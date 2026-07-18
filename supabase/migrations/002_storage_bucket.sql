-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'screenshots',
  'screenshots',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg'];

-- Create storage policies
CREATE POLICY "Authenticated can upload screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'screenshots');

CREATE POLICY "Authenticated can view screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'screenshots');

CREATE POLICY "Authenticated can delete screenshots"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'screenshots');
