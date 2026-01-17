// src/lib/api/storage.ts
// API service for file storage (Supabase Storage)
import { createClient } from '@/lib/supabase/client';

const PATTERNS_BUCKET = 'patterns';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

// Generate a unique file path for a user
function generateFilePath(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${userId}/${timestamp}-${sanitizedName}`;
}

// Upload a pattern file
export async function uploadPatternFile(
  userId: string,
  file: File
): Promise<UploadResult> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a PDF or image file.');
  }

  const supabase = createClient();
  const filePath = generateFilePath(userId, file.name);

  const { error } = await supabase.storage
    .from(PATTERNS_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(PATTERNS_BUCKET)
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };
}

// Upload pattern file from base64 (for AI processing)
export async function uploadPatternFromBase64(
  userId: string,
  base64Data: string,
  fileName: string,
  mimeType: string
): Promise<UploadResult> {
  // Convert base64 to Uint8Array
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const supabase = createClient();
  const filePath = generateFilePath(userId, fileName);

  const { error } = await supabase.storage
    .from(PATTERNS_BUCKET)
    .upload(filePath, bytes, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(PATTERNS_BUCKET)
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    fileName,
    fileSize: bytes.length,
    mimeType,
  };
}

// Get a signed URL for private access
export async function getSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(PATTERNS_BUCKET)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

// Delete a pattern file
export async function deletePatternFile(filePath: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(PATTERNS_BUCKET)
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

// List user's pattern files
export async function listUserPatterns(userId: string): Promise<{
  name: string;
  size: number;
  createdAt: string;
}[]> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(PATTERNS_BUCKET)
    .list(userId, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }

  return data.map(file => ({
    name: file.name,
    size: file.metadata?.size || 0,
    createdAt: file.created_at,
  }));
}

// Get file as base64 for AI processing
export async function getFileAsBase64(fileUrl: string): Promise<string> {
  const response = await fetch(fileUrl);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
