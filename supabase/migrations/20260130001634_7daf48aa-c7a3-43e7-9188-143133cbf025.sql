-- Create storage bucket for brag sheet images
INSERT INTO storage.buckets (id, name, public) VALUES ('brag-sheet-images', 'brag-sheet-images', true);

-- Create storage policies for brag sheet images
CREATE POLICY "Users can view brag sheet images"
ON storage.objects FOR SELECT
USING (bucket_id = 'brag-sheet-images');

CREATE POLICY "Users can upload their own brag sheet images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'brag-sheet-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own brag sheet images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'brag-sheet-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own brag sheet images"
ON storage.objects FOR DELETE
USING (bucket_id = 'brag-sheet-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add images column to brag_sheet_entries table
ALTER TABLE public.brag_sheet_entries 
ADD COLUMN images text[] DEFAULT '{}'::text[];