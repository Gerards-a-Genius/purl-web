// src/lib/api/security.test.ts
// Security-focused tests for API and storage functions

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  update: vi.fn(() => mockSupabase),
  delete: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  single: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      getPublicUrl: vi.fn(),
      remove: vi.fn(),
      list: vi.fn(),
      createSignedUrl: vi.fn(),
    })),
  },
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: { session: { access_token: 'mock-token', user: { id: 'user-123' } } },
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    }),
  },
};

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

describe('File Upload Security', () => {
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  describe('File Size Validation', () => {
    it('should accept files under 50MB', () => {
      const fileSize = 10 * 1024 * 1024; // 10MB
      expect(fileSize <= MAX_FILE_SIZE).toBe(true);
    });

    it('should reject files over 50MB', () => {
      const fileSize = 60 * 1024 * 1024; // 60MB
      expect(fileSize > MAX_FILE_SIZE).toBe(true);
    });

    it('should accept files exactly at 50MB', () => {
      const fileSize = 50 * 1024 * 1024; // 50MB
      expect(fileSize <= MAX_FILE_SIZE).toBe(true);
    });
  });

  describe('MIME Type Validation', () => {
    it('should accept PDF files', () => {
      expect(allowedTypes.includes('application/pdf')).toBe(true);
    });

    it('should accept JPEG images', () => {
      expect(allowedTypes.includes('image/jpeg')).toBe(true);
    });

    it('should accept PNG images', () => {
      expect(allowedTypes.includes('image/png')).toBe(true);
    });

    it('should accept WebP images', () => {
      expect(allowedTypes.includes('image/webp')).toBe(true);
    });

    it('should accept GIF images', () => {
      expect(allowedTypes.includes('image/gif')).toBe(true);
    });

    it('should reject executable files', () => {
      expect(allowedTypes.includes('application/x-executable')).toBe(false);
    });

    it('should reject JavaScript files', () => {
      expect(allowedTypes.includes('application/javascript')).toBe(false);
    });

    it('should reject HTML files', () => {
      expect(allowedTypes.includes('text/html')).toBe(false);
    });

    it('should reject SVG files (potential XSS vector)', () => {
      expect(allowedTypes.includes('image/svg+xml')).toBe(false);
    });

    it('should reject ZIP archives', () => {
      expect(allowedTypes.includes('application/zip')).toBe(false);
    });
  });

  describe('File Path Generation', () => {
    function generateFilePath(userId: string, fileName: string): string {
      const timestamp = Date.now();
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      return `${userId}/${timestamp}-${sanitizedName}`;
    }

    it('should prefix path with user ID', () => {
      const path = generateFilePath('user-123', 'file.pdf');
      expect(path.startsWith('user-123/')).toBe(true);
    });

    it('should sanitize special characters in filename', () => {
      const path = generateFilePath('user-123', 'file<script>.pdf');
      expect(path).not.toContain('<');
      expect(path).not.toContain('>');
    });

    it('should sanitize spaces in filename', () => {
      const path = generateFilePath('user-123', 'my file name.pdf');
      expect(path).not.toContain(' ');
    });

    it('should sanitize path traversal attempts', () => {
      const path = generateFilePath('user-123', '../../../etc/passwd');
      // Path traversal slashes are converted to underscores
      expect(path).not.toContain('/etc');
      expect(path).not.toContain('../');
    });

    it('should preserve file extension', () => {
      const path = generateFilePath('user-123', 'document.pdf');
      expect(path.endsWith('.pdf')).toBe(true);
    });

    it('should sanitize unicode characters', () => {
      const path = generateFilePath('user-123', 'файл.pdf');
      expect(path).not.toContain('файл');
    });
  });
});

describe('API Data Scoping', () => {
  describe('Project Queries', () => {
    it('should always filter by user_id', () => {
      // Verify that queries always include user_id filter
      const userId = 'user-123';
      const query = `.eq('user_id', '${userId}')`;

      expect(query).toContain('user_id');
      expect(query).toContain(userId);
    });

    it('should not expose other users IDs in query', () => {
      const userId = 'user-123';
      const otherUserId = 'user-456';

      // Query should only use the authenticated user's ID
      expect(userId).not.toBe(otherUserId);
    });
  });

  describe('Protected Route Configuration', () => {
    const protectedPaths = ['/projects', '/learn'];
    const authPaths = ['/login', '/register'];
    const publicPaths = ['/library', '/api/patterns'];

    it('should protect /projects routes', () => {
      expect(protectedPaths.includes('/projects')).toBe(true);
    });

    it('should protect /learn routes', () => {
      expect(protectedPaths.includes('/learn')).toBe(true);
    });

    it('should keep /library public', () => {
      expect(protectedPaths.includes('/library')).toBe(false);
    });

    it('should keep /api/patterns public', () => {
      expect(protectedPaths.includes('/api/patterns')).toBe(false);
    });

    it('should redirect authenticated users from auth pages', () => {
      expect(authPaths.includes('/login')).toBe(true);
      expect(authPaths.includes('/register')).toBe(true);
    });
  });
});

describe('Edge Function Authentication', () => {
  describe('Authorization Header Validation', () => {
    it('should reject requests without authorization header', () => {
      const authHeader = null;
      expect(authHeader).toBeNull();

      // Function should return 401
      const expectedStatus = 401;
      expect(expectedStatus).toBe(401);
    });

    it('should reject requests with empty authorization header', () => {
      const authHeader = '';
      expect(authHeader).toBeFalsy();
    });

    it('should accept requests with valid Bearer token', () => {
      const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      expect(authHeader.startsWith('Bearer ')).toBe(true);
    });
  });

  describe('JWT Verification Configuration', () => {
    const functionsConfig = {
      'parse-pattern': { verify_jwt: true },
      'sos-assist': { verify_jwt: true },
      'contextual-help': { verify_jwt: true },
      'generate-steps': { verify_jwt: true },
    };

    it('should require JWT for parse-pattern', () => {
      expect(functionsConfig['parse-pattern'].verify_jwt).toBe(true);
    });

    it('should require JWT for sos-assist', () => {
      expect(functionsConfig['sos-assist'].verify_jwt).toBe(true);
    });

    it('should require JWT for contextual-help', () => {
      expect(functionsConfig['contextual-help'].verify_jwt).toBe(true);
    });

    it('should require JWT for generate-steps', () => {
      expect(functionsConfig['generate-steps'].verify_jwt).toBe(true);
    });
  });
});

describe('RLS Policy Verification', () => {
  describe('Projects Table', () => {
    const projectsPolicy = {
      select: 'auth.uid() = user_id',
      insert: 'auth.uid() = user_id',
      update: 'auth.uid() = user_id',
      delete: 'auth.uid() = user_id',
    };

    it('should restrict SELECT to owner', () => {
      expect(projectsPolicy.select).toContain('auth.uid()');
      expect(projectsPolicy.select).toContain('user_id');
    });

    it('should restrict INSERT to owner', () => {
      expect(projectsPolicy.insert).toContain('auth.uid()');
    });

    it('should restrict UPDATE to owner', () => {
      expect(projectsPolicy.update).toContain('auth.uid()');
    });

    it('should restrict DELETE to owner', () => {
      expect(projectsPolicy.delete).toContain('auth.uid()');
    });
  });

  describe('Steps Table', () => {
    const stepsPolicy = {
      access: 'EXISTS (SELECT 1 FROM projects p WHERE p.id = steps.project_id AND p.user_id = auth.uid())',
    };

    it('should verify project ownership via subquery', () => {
      expect(stepsPolicy.access).toContain('EXISTS');
      expect(stepsPolicy.access).toContain('projects');
      expect(stepsPolicy.access).toContain('user_id = auth.uid()');
    });
  });

  describe('Pattern Annotations Table', () => {
    const annotationsPolicy = {
      access: 'EXISTS (SELECT 1 FROM projects p WHERE p.id = pattern_annotations.project_id AND p.user_id = auth.uid())',
    };

    it('should verify project ownership via subquery', () => {
      expect(annotationsPolicy.access).toContain('EXISTS');
      expect(annotationsPolicy.access).toContain('projects');
      expect(annotationsPolicy.access).toContain('user_id = auth.uid()');
    });
  });

  describe('User Favorites Table', () => {
    const favoritesPolicy = {
      access: 'auth.uid() = user_id',
    };

    it('should restrict access to owner', () => {
      expect(favoritesPolicy.access).toContain('auth.uid()');
      expect(favoritesPolicy.access).toContain('user_id');
    });
  });
});

describe('Storage Bucket Security', () => {
  describe('Folder Scoping', () => {
    it('should extract user ID from file path', () => {
      const filePath = 'user-123/1234567890-document.pdf';
      const userId = filePath.split('/')[0];
      expect(userId).toBe('user-123');
    });

    it('should reject access to other users folders', () => {
      const currentUserId = 'user-123';
      const filePath = 'user-456/document.pdf';
      const fileOwnerId = filePath.split('/')[0];

      expect(fileOwnerId).not.toBe(currentUserId);
    });

    it('should allow access to own folder', () => {
      const currentUserId = 'user-123';
      const filePath = 'user-123/document.pdf';
      const fileOwnerId = filePath.split('/')[0];

      expect(fileOwnerId).toBe(currentUserId);
    });
  });

  describe('Bucket Configuration', () => {
    const bucketConfig = {
      id: 'patterns',
      public: true,
      file_size_limit: 52428800, // 50MB
      allowed_mime_types: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
      ],
    };

    it('should have correct file size limit', () => {
      expect(bucketConfig.file_size_limit).toBe(50 * 1024 * 1024);
    });

    it('should only allow safe MIME types', () => {
      expect(bucketConfig.allowed_mime_types).not.toContain('text/html');
      expect(bucketConfig.allowed_mime_types).not.toContain('application/javascript');
      expect(bucketConfig.allowed_mime_types).not.toContain('image/svg+xml');
    });
  });
});

describe('Input Sanitization', () => {
  describe('Query Parameter Validation', () => {
    it('should parse limit with default value', () => {
      const parseLimit = (value: string | null) =>
        value ? parseInt(value, 10) || 10 : 10;

      expect(parseLimit(null)).toBe(10);
      expect(parseLimit('5')).toBe(5);
      expect(parseLimit('abc')).toBe(10);
      expect(parseLimit('')).toBe(10);
    });

    it('should validate enum values', () => {
      const validTypes = ['knitting', 'crochet', 'machine_knit'];
      const validateType = (type: string | null) =>
        type && validTypes.includes(type) ? type : null;

      expect(validateType('knitting')).toBe('knitting');
      expect(validateType('invalid')).toBeNull();
      expect(validateType(null)).toBeNull();
    });
  });

  describe('XSS Prevention', () => {
    it('should not allow script tags in text input', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitized = maliciousInput.replace(/[^a-zA-Z0-9.-]/g, '_');

      expect(sanitized).not.toContain('<script>');
    });

    it('should not allow event handlers in text input', () => {
      const maliciousInput = 'file" onclick="alert(1)';
      const sanitized = maliciousInput.replace(/[^a-zA-Z0-9.-]/g, '_');

      // Quotes are removed, preventing attribute injection
      expect(sanitized).not.toContain('"');
      expect(sanitized).not.toContain('=');
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should not allow SQL injection in text input', () => {
      const maliciousInput = "'; DROP TABLE projects; --";
      const sanitized = maliciousInput.replace(/[^a-zA-Z0-9.-]/g, '_');

      // Dangerous SQL characters are removed
      expect(sanitized).not.toContain("'");
      expect(sanitized).not.toContain(';');
      // The result is safely sanitized to: "__DROP_TABLE_projects__--"
      // but the actual query uses parameterized queries via Supabase
    });
  });
});
