-- ============================================================================
-- Migration 04: Storage Buckets and Storage RLS Policies
-- ============================================================================

-- Create Storage Buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('school-assets', 'school-assets', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']),
    ('announcements', 'announcements', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']),
    ('student-photos', 'student-photos', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/jpg']),
    ('student-documents', 'student-documents', true, 5242880, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;


-- Storage Policies

-- 1. school-assets
DROP POLICY IF EXISTS "Public can view school assets" ON storage.objects;
CREATE POLICY "Public can view school assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'school-assets');

DROP POLICY IF EXISTS "Admins can manage school assets" ON storage.objects;
CREATE POLICY "Admins can manage school assets"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'school-assets' AND public.is_admin())
    WITH CHECK (bucket_id = 'school-assets' AND public.is_admin());


-- 2. announcements
DROP POLICY IF EXISTS "Public can view announcement images" ON storage.objects;
CREATE POLICY "Public can view announcement images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'announcements');

DROP POLICY IF EXISTS "Admins can manage announcement images" ON storage.objects;
CREATE POLICY "Admins can manage announcement images"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'announcements' AND public.is_admin())
    WITH CHECK (bucket_id = 'announcements' AND public.is_admin());


-- 3. student-photos
DROP POLICY IF EXISTS "Public can upload student photos" ON storage.objects;
CREATE POLICY "Public can upload student photos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'student-photos');

DROP POLICY IF EXISTS "Public can view student photos" ON storage.objects;
CREATE POLICY "Public can view student photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'student-photos');

DROP POLICY IF EXISTS "Admins can manage student photos" ON storage.objects;
CREATE POLICY "Admins can manage student photos"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'student-photos' AND public.is_admin())
    WITH CHECK (bucket_id = 'student-photos' AND public.is_admin());


-- 4. student-documents
DROP POLICY IF EXISTS "Public can upload student documents" ON storage.objects;
CREATE POLICY "Public can upload student documents"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'student-documents');

DROP POLICY IF EXISTS "Public can view student documents" ON storage.objects;
CREATE POLICY "Public can view student documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'student-documents');

DROP POLICY IF EXISTS "Admins can manage student documents" ON storage.objects;
CREATE POLICY "Admins can manage student documents"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'student-documents' AND public.is_admin())
    WITH CHECK (bucket_id = 'student-documents' AND public.is_admin());
