import React, { useState, useRef, useEffect } from 'react';
import { useLoading } from '../../context/LoadingProvider';
import { useToast, ToastType } from '../../context/ToastProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmarkCircle, faImage, faUpload } from '@fortawesome/free-solid-svg-icons';
import { Announcement } from '../../data/models/Announcement';
import apiClient from '../../config/apiClient';
import { url } from '@/config/config';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  announcement?: Announcement;
}

interface MediaFile {
  file: File;
  previewUrl: string;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  announcement
}) => {
  const { setLoading } = useLoading();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const authHeader = useAuthHeader();

  const [caption, setCaption] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Initialize form with announcement data when editing
  useEffect(() => {
    if (announcement) {
      setCaption(announcement.caption);
      // When editing, we don't need to handle media files
    } else {
      setCaption('');
      setMediaFiles([]); // Only reset media files when creating new
    }
    setCurrentImageIndex(0);
  }, [announcement, isOpen]); // Add isOpen to dependencies to reset state when modal opens/closes

  // Cleanup preview URLs when component unmounts or modal closes
  useEffect(() => {
    return () => {
      // Only cleanup when not editing
      if (!announcement) { 
        mediaFiles.forEach(file => {
          if (file.previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(file.previewUrl);
          }
        });
      }
    };
  }, [mediaFiles, announcement]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (announcement) return; // Don't allow file selection when editing
    
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        showToast('File size should be less than 100MB', ToastType.ERROR);
        return false;
      }

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        showToast(
          'Please select valid image files (JPG, PNG, GIF)',
          ToastType.ERROR
        );
        return false;
      }

      return true;
    });

    const newMediaFiles = validFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setMediaFiles(prev => [...prev, ...newMediaFiles]);
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(newFiles[index].previewUrl);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For editing, only validate caption
    // For creation, validate that at least one of caption or media is present
    if (!announcement && !caption.trim() && mediaFiles.length === 0) {
      showToast('Please provide either a caption or upload an image', ToastType.ERROR);
      return;
    }

    try {
      setLoading(true, announcement ? 'Updating announcement...' : 'Creating announcement...');

      if (announcement) {
        // Update existing announcement - only update caption and style
        const updateData = {
          caption: caption.trim(),
          style: {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#000000',
            backgroundColor: '#ffffff',
            textAlign: 'left',
            fontWeight: 'normal'
          }
        };

        // Make the API call to update announcement
        await apiClient.put(`${url}/post/${announcement.id}`, updateData, {
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          }
        });
      } else {
        // Create new announcement with media
        const formData = new FormData();
        
        // Append caption if not empty
        if (caption.trim()) {
          formData.append('caption', caption.trim());
        }

        // Add style fields individually to be parsed as an object by Express
        formData.append('style[fontFamily]', 'Arial');
        formData.append('style[fontSize]', '16px');
        formData.append('style[color]', '#000000');
        formData.append('style[backgroundColor]', '#ffffff');
        formData.append('style[textAlign]', 'left');
        formData.append('style[fontWeight]', 'normal');
        
        // Append all new media files
        mediaFiles.forEach(mediaFile => {
          formData.append('media', mediaFile.file);
        });

        // Make the API call to create announcement
        const response = await apiClient.post(`${url}/post/create`, formData, {
          headers: {
            Authorization: authHeader,
            'Content-Type': 'multipart/form-data',
          }
        });

        console.log('Server response:', response.data);
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error publishing announcement:', error);
      // Show more detailed error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create announcement';
      // showToast(errorMessage, ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCaption('');
    if (!announcement) { // Only clear media files when not editing
      setMediaFiles([]);
    }
    onClose();
  };

  const renderMediaPreview = () => {
    // Guard against undefined mediaFiles
    if (!mediaFiles || mediaFiles.length === 0) return null;

    const handlePrev = () => {
      setCurrentImageIndex(prev => (prev - 1 + mediaFiles.length) % mediaFiles.length);
    };

    const handleNext = () => {
      setCurrentImageIndex(prev => (prev + 1) % mediaFiles.length);
    };

    return (
      <div className="mt-2 border rounded-lg overflow-hidden bg-gray-50">
        <div className="p-2 bg-gray-100 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faImage} className="text-gray-500" />
            <span className="text-sm text-gray-600">Media Preview</span>
          </div>
          <div className="text-sm text-gray-500">
            {currentImageIndex + 1} / {mediaFiles.length}
          </div>
        </div>
        <div className="relative p-4">
          <div className="relative aspect-video w-full">
            {mediaFiles.map((media, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-300 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={media.previewUrl}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-contain rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    removeMediaFile(index);
                    if (currentImageIndex >= mediaFiles.length - 1) {
                      setCurrentImageIndex(Math.max(0, mediaFiles.length - 2));
                    }
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FontAwesomeIcon icon={faXmarkCircle} />
                </button>
              </div>
            ))}
          </div>
          
          {mediaFiles.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <FontAwesomeIcon icon={faXmarkCircle} className="rotate-180" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <FontAwesomeIcon icon={faXmarkCircle} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/30" onClick={handleClose} />
        <div className="relative bg-white rounded-lg w-full max-w-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">
              {announcement ? 'Edit Announcement' : 'Create New Announcement'}
            </h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <FontAwesomeIcon icon={faXmarkCircle} className="text-2xl" />
            </button>
          </div>
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caption {!announcement && mediaFiles.length === 0 && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                placeholder="Enter announcement caption..."
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{caption && caption.length || 0}/500 characters</span>
                {!announcement && !caption.trim() && mediaFiles.length === 0 && (
                  <span className="text-red-500">Caption is required when no image is uploaded</span>
                )}
              </div>
            </div>
            {/* Only show media upload section when creating new announcement */}
            {!announcement && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images {!caption.trim() && <span className="text-red-500">*</span>}
                </label>
                <div className="space-y-2">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-yellow-100 text-yellow-600 border-yellow-600 cursor-pointer transition-colors duration-200"
                    >
                      <FontAwesomeIcon icon={faUpload} />
                      Upload Images
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ALLOWED_IMAGE_TYPES.join(',')}
                      onChange={handleFileSelect}
                      className="hidden"
                      multiple
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">
                      Supported formats: JPG, PNG, GIF (max 100MB per file)
                    </span>
                    {!caption.trim() && mediaFiles.length === 0 && (
                      <span className="text-red-500">Image is required when no caption is provided</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Only show media preview when creating new announcement */}
            {!announcement && renderMediaPreview()}
            {/* Footer */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 text-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200"
              >
                {announcement ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal; 