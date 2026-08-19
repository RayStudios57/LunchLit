import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BragSheetImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function BragSheetImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 5 
}: BragSheetImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Generate signed URLs for display
  useEffect(() => {
    if (images.length === 0) return;
    
    const generateSignedUrls = async () => {
      const urls: Record<string, string> = {};
      for (const storedPath of images) {
        // Extract file path from stored value (could be full URL or path)
        let filePath = storedPath;
        try {
          const url = new URL(storedPath);
          const pathParts = url.pathname.split('/');
          const bucketIndex = pathParts.findIndex(p => p === 'brag-sheet-images');
          if (bucketIndex !== -1) {
            filePath = pathParts.slice(bucketIndex + 1).join('/');
          }
        } catch {
          // Already a path, use as-is
        }
        
        const { data } = await supabase.storage
          .from('brag-sheet-images')
          .createSignedUrl(filePath, 3600);
        
        if (data?.signedUrl) {
          urls[storedPath] = data.signedUrl;
        }
      }
      setSignedUrls(urls);
    };
    
    generateSignedUrls();
  }, [images]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!user) {
      toast({ title: 'Please sign in to upload images', variant: 'destructive' });
      return;
    }

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast({ 
        title: 'Maximum images reached', 
        description: `You can only add up to ${maxImages} images`,
        variant: 'destructive' 
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    // Validate file types and sizes
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 1024 * 1024 * 1024; // 1GB

    for (const file of filesToUpload) {
      if (!validTypes.includes(file.type)) {
        toast({ 
          title: 'Invalid file type', 
          description: 'Please upload JPG, PNG, WebP, or GIF images',
          variant: 'destructive' 
        });
        return;
      }
      if (file.size > maxSize) {
        toast({ 
          title: 'File too large', 
          description: 'Images must be under 1GB',
          variant: 'destructive' 
        });
        return;
      }
    }

    setIsUploading(true);

    try {
      const uploadedPaths: string[] = [];

      for (const file of filesToUpload) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('brag-sheet-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        // Store the file path, not public URL (bucket is now private)
        uploadedPaths.push(fileName);
      }

      onImagesChange([...images, ...uploadedPaths]);
      toast({ title: `${uploadedPaths.length} image(s) uploaded` });

    } catch (error) {
      console.error('Error uploading images:', error);
      toast({ 
        title: 'Upload failed', 
        description: 'Please try again',
        variant: 'destructive' 
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async (storedPath: string) => {
    try {
      let filePath = storedPath;
      try {
        const url = new URL(storedPath);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.findIndex(p => p === 'brag-sheet-images');
        if (bucketIndex !== -1) {
          filePath = pathParts.slice(bucketIndex + 1).join('/');
        }
      } catch {
        // Already a path
      }
      await supabase.storage.from('brag-sheet-images').remove([filePath]);
    } catch {
      // If we can't parse, just remove from list
    }

    onImagesChange(images.filter(img => img !== storedPath));
  };

  const getDisplayUrl = (storedPath: string) => {
    return signedUrls[storedPath] || '';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Images</span>
        <span className="text-xs text-muted-foreground">
          ({images.length}/{maxImages})
        </span>
      </div>

      {/* Image preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {images.map((storedPath, idx) => {
            const displayUrl = getDisplayUrl(storedPath);
            return (
              <div key={idx} className="relative group aspect-video">
                {displayUrl ? (
                  <img 
                    src={displayUrl} 
                    alt={`Brag sheet image ${idx + 1}`}
                    className="w-full h-full object-cover rounded-lg border"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-lg border bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(storedPath)}
                  className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload button */}
      {images.length < maxImages && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-dashed"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <ImagePlus className="h-4 w-4 mr-2" />
                Add Images
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG, WebP, or GIF (max 1GB each)
          </p>
        </div>
      )}
    </div>
  );
}
