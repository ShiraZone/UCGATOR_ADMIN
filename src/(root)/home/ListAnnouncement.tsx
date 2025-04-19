import { useState, useEffect } from 'react';
import { Announcement } from '../../data/models/Announcement';
import { useLoading } from '../../context/LoadingProvider';
import { useToast, ToastType } from '../../context/ToastProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faChevronLeft, faChevronRight, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { DialogConfirm } from '../../components/DialogConfirm';
import AnnouncementModal from './CreateAnnouncementModal';
import apiClient from '../../config/apiClient';
import { url } from '@/config/config';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { IUserData } from '@/data/types';

interface CreatedBy {
  id: string;
  name: string;
  avatar: string;
}

interface AnnouncementWithUser extends Omit<Announcement, 'createdBy'> {
  createdBy: CreatedBy;
}

interface PaginatedResponse {
  success: boolean;
  count: number;
  total: number;
  currentPage: number;
  totalPages: number;
  data: AnnouncementWithUser[];
}

const ListAnnouncement = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementWithUser[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementWithUser | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndices, setCurrentImageIndices] = useState<{ [key: string]: number }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeletedPosts, setShowDeletedPosts] = useState(false);
  const { setLoading } = useLoading();
  const authHeader = useAuthHeader();
  const authUser = useAuthUser<IUserData>();

  // Permission check functions
  const canView = () => authUser?.permissions?.modules?.contentManagement?.view || false;
  const canCreate = () => authUser?.permissions?.modules?.contentManagement?.create || false;
  const canEdit = () => authUser?.permissions?.modules?.contentManagement?.edit || false;
  const canDelete = () => authUser?.permissions?.modules?.contentManagement?.delete || false;

  useEffect(() => {
    if (canView()) {
      loadAnnouncements();
    }
  }, [currentPage, showDeletedPosts]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true, 'Loading announcements...');
      const response = await apiClient.get<PaginatedResponse>(
        `${url}/post/post_all?page=${currentPage}&showDeleted=${showDeletedPosts}&onlyDeleted=${showDeletedPosts}`,
        {
          headers: {
            Authorization: authHeader
          }
        }
      );
      const { data } = response;
      
      if (data.success) {
        setAnnouncements(data.data);
        setTotalPages(data.totalPages);
        
        // Initialize currentImageIndices for all announcements
        const initialIndices = data.data.reduce((acc, announcement) => {
          acc[announcement.id] = 0;
          return acc;
        }, {} as { [key: string]: number });
        setCurrentImageIndices(initialIndices);
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true, 'Deleting announcement...');
      await apiClient.delete(`/post/${id}`, {
        headers: {
          Authorization: authHeader
        }
      });
      await loadAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleOpenModal = (announcement?: AnnouncementWithUser) => {
    setSelectedAnnouncement(announcement || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedAnnouncement(null);
    setIsModalOpen(false);
  };

  const handlePrevImage = (announcementId: string) => {
    setCurrentImageIndices(prev => ({
      ...prev,
      [announcementId]: (prev[announcementId] - 1 + (announcements.find(a => a.id === announcementId)?.mediaUrls?.length || 0)) % (announcements.find(a => a.id === announcementId)?.mediaUrls?.length || 1)
    }));
  };

  const handleNextImage = (announcementId: string) => {
    setCurrentImageIndices(prev => ({
      ...prev,
      [announcementId]: (prev[announcementId] + 1) % (announcements.find(a => a.id === announcementId)?.mediaUrls?.length || 1)
    }));
  };

  return (
    <div className="container mx-auto py-3">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {showDeletedPosts ? 'Deleted Announcements' : 'Announcements'}
          </h1>
          {canView() && (
            <button
              onClick={() => setShowDeletedPosts(!showDeletedPosts)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200 ${
                showDeletedPosts 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <FontAwesomeIcon icon={showDeletedPosts ? faEyeSlash : faEye} />
              {showDeletedPosts ? 'Show Active Posts' : 'Show Deleted Posts'}
            </button>
          )}
        </div>
        {!showDeletedPosts && canCreate() && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors duration-200 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            Create New Announcement
          </button>
        )}
      </div>

      {canView() ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              {showDeletedPosts ? 'No deleted announcements found' : 'No announcements found'}
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 ${
                  !announcement.isActive ? 'opacity-75' : ''
                }`}
                style={announcement.style}
              >
                {/* Media Section */}
                {announcement.mediaUrls && announcement.mediaUrls.length > 0 && (
                  <div className="relative aspect-video w-full">
                    {announcement.mediaUrls.map((url, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-300 ${
                          index === (currentImageIndices[announcement.id] || 0) ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`${announcement.caption} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    
                    {announcement.mediaUrls.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => handlePrevImage(announcement.id)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                        >
                          <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNextImage(announcement.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                        >
                          <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm text-white bg-black/50 px-2 py-1 rounded">
                          {(currentImageIndices[announcement.id] || 0) + 1} / {announcement.mediaUrls.length}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Content Section */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-gray-600 line-clamp-3">{announcement.caption}</p>
                    <div className="flex gap-2">
                      {announcement.isActive && canEdit() && (
                        <button
                          onClick={() => handleOpenModal(announcement)}
                          className="text-yellow-600 hover:text-yellow-700 transition-colors duration-200"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      )}
                      {canDelete() && (
                        <button
                          onClick={() => {
                            setSelectedAnnouncement(announcement);
                            setIsDeleteDialogOpen(true);
                          }}
                          className={`transition-colors duration-200 ${
                            announcement.isActive 
                              ? 'text-red-500 hover:text-red-700' 
                              : 'text-green-500 hover:text-green-700'
                          }`}
                          title={announcement.isActive ? 'Delete' : 'Restore'}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-3">
                    <div className="flex items-center gap-2">
                      <img 
                        src={announcement.createdBy.avatar} 
                        alt={announcement.createdBy.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{announcement.createdBy.name}</p>
                        <p>{new Date(announcement.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      announcement.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {announcement.isActive ? 'Active' : 'Deleted'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          You don't have permission to view announcements.
        </div>
      )}

      {/* Pagination Controls */}
      {canView() && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      <DialogConfirm
        open={isDeleteDialogOpen}
        title={selectedAnnouncement?.isActive ? "Delete Announcement" : "Restore Announcement"}
        description={
          selectedAnnouncement?.isActive
            ? "Are you sure you want to delete this announcement? This action can be undone."
            : "Are you sure you want to restore this announcement?"
        }
        onConfirm={() => selectedAnnouncement && handleDelete(selectedAnnouncement.id)}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />

      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={loadAnnouncements}
        announcement={selectedAnnouncement ? {
          ...selectedAnnouncement,
          createdBy: selectedAnnouncement.createdBy.name
        } : undefined}
      />
    </div>
  );
};

export default ListAnnouncement;