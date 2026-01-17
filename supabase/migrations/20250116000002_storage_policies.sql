-- Storage bucket policies for pattern files
-- Migration: 20250116000002_storage_policies.sql

-- ============================================================================
-- CREATE PATTERNS BUCKET
-- ============================================================================

-- Create the patterns bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'patterns',
  'patterns',
  true,  -- Public bucket (files accessed via signed URLs for private access)
  52428800,  -- 50MB file size limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload their own pattern files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'patterns' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to view their own files
CREATE POLICY "Users can view their own pattern files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'patterns' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update their own pattern files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'patterns' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'patterns' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own pattern files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'patterns' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can upload their own pattern files" ON storage.objects IS
  'Allows authenticated users to upload files only to their user-specific folder (userId/filename)';

COMMENT ON POLICY "Users can view their own pattern files" ON storage.objects IS
  'Allows authenticated users to view files only in their user-specific folder';

COMMENT ON POLICY "Users can update their own pattern files" ON storage.objects IS
  'Allows authenticated users to update files only in their user-specific folder';

COMMENT ON POLICY "Users can delete their own pattern files" ON storage.objects IS
  'Allows authenticated users to delete files only in their user-specific folder';
