import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 4, 
  className 
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter out files that would exceed the limit
    const availableSlots = maxImages - images.length - previews.length;
    const filesToProcess = acceptedFiles.slice(0, availableSlots);

    const newPreviews = filesToProcess.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));

    setPreviews(prev => [...prev, ...newPreviews]);
  }, [images.length, previews.length, maxImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: maxImages,
    disabled: images.length + previews.length >= maxImages
  });

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const removePreview = (index: number) => {
    const preview = previews[index];
    URL.revokeObjectURL(preview.url);
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const totalImages = images.length + previews.length;
  const canAddMore = totalImages < maxImages;

  // Clean up URLs on unmount
  React.useEffect(() => {
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Image Grid */}
      {totalImages > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {/* Existing uploaded images */}
          {images.map((imageUrl, index) => (
            <div key={`uploaded-${index}`} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-border">
                <img
                  src={imageUrl}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          
          {/* Preview images (not yet uploaded) */}
          {previews.map((preview, index) => (
            <div key={`preview-${index}`} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-border border-dashed bg-muted/50">
                <img
                  src={preview.url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">Preview</span>
                </div>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removePreview(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-primary/50",
            !canAddMore && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {isDragActive ? (
              <>
                <Upload className="h-8 w-8 text-primary" />
                <p className="text-sm font-medium">Drop images here...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Drag & drop images here, or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, JPEG, WebP up to 10MB ({totalImages}/{maxImages} images)
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>{totalImages} of {maxImages} images</span>
        {previews.length > 0 && (
          <span className="text-orange-600">{previews.length} pending upload</span>
        )}
      </div>
    </div>
  );
}

// Export the component with ref for accessing methods
export const ImageUploadWithRef = React.forwardRef<
  { getFilesToUpload: () => File[]; clearPreviews: () => void },
  ImageUploadProps
>((props, ref) => {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const availableSlots = (props.maxImages || 4) - props.images.length - previews.length;
    const filesToProcess = acceptedFiles.slice(0, availableSlots);

    const newPreviews = filesToProcess.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));

    setPreviews(prev => [...prev, ...newPreviews]);
  }, [props.images.length, previews.length, props.maxImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: props.maxImages || 4,
    disabled: props.images.length + previews.length >= (props.maxImages || 4)
  });

  React.useImperativeHandle(ref, () => ({
    getFilesToUpload: () => previews.map(p => p.file),
    clearPreviews: () => {
      previews.forEach(preview => URL.revokeObjectURL(preview.url));
      setPreviews([]);
    }
  }));

  const removeImage = (index: number) => {
    const newImages = [...props.images];
    newImages.splice(index, 1);
    props.onImagesChange(newImages);
  };

  const removePreview = (index: number) => {
    const preview = previews[index];
    URL.revokeObjectURL(preview.url);
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const totalImages = props.images.length + previews.length;
  const canAddMore = totalImages < (props.maxImages || 4);

  React.useEffect(() => {
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, []);

  return (
    <div className={cn("space-y-4", props.className)}>
      {totalImages > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {props.images.map((imageUrl, index) => (
            <div key={`uploaded-${index}`} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-border">
                <img
                  src={imageUrl}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          
          {previews.map((preview, index) => (
            <div key={`preview-${index}`} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-border border-dashed bg-muted/50">
                <img
                  src={preview.url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">Preview</span>
                </div>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removePreview(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {isDragActive ? (
              <>
                <Upload className="h-8 w-8 text-primary" />
                <p className="text-sm font-medium">Drop images here...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Drag & drop images here, or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, JPEG, WebP up to 10MB ({totalImages}/{props.maxImages || 4} images)
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>{totalImages} of {props.maxImages || 4} images</span>
        {previews.length > 0 && (
          <span className="text-orange-600">{previews.length} pending upload</span>
        )}
      </div>
    </div>
  );
});