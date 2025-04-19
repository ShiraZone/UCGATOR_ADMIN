import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faUserPlus, faShieldAlt, faEllipsisVertical, faTimes, faPause, faPlay, faBan } from '@fortawesome/free-solid-svg-icons';
import AddUserModal from '@/components/AddUserModal';
import apiClient from '@/config/apiClient';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { useLoading } from '../../context/LoadingProvider';
import { IUserData } from '@/data/types';

let url = import.meta.env.VITE_API_URL;

interface User {
  _id: string;
  email: string;
  profile: {
    avatar: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    fullName: string;
  };
  permissions: {
    role: 'admin' | 'editor' | 'viewer';
    modules: {
      [key: string]: {
        view: boolean;
        create: boolean;
        edit: boolean;
        delete: boolean;
      };
    };
  };
  status: 'active' | 'suspended' | 'inactive';
  dateCreated: string;
  lastLogin?: string;
}

const AdminUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const authHeader = useAuthHeader();
  const authUser = useAuthUser<IUserData>();
  const { setLoading } = useLoading();

  // Permission check functions
  const canView = () => authUser?.permissions?.modules?.userManagement?.view || false;
  const canCreate = () => authUser?.permissions?.modules?.userManagement?.create || false;
  const canEdit = () => authUser?.permissions?.modules?.userManagement?.edit || false;
  const canDelete = () => authUser?.permissions?.modules?.userManagement?.delete || false;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/management/admin/account/user', {
        headers: {
          Authorization: authHeader
        }
      });
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleTerminate = async (userId: string) => {
    if (!window.confirm('Are you sure you want to terminate this user?')) return;

    setLoading(true);
    try {
      const response = await apiClient.patch(`/management/admin/account/${userId}/terminate`, {}, {
        headers: {
          Authorization: authHeader
        }
      });
      if (response.data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error terminating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId: string) => {
    if (!window.confirm('Are you sure you want to suspend this user?')) return;

    setLoading(true);
    try {
      const response = await apiClient.patch(`/management/admin/account/${userId}/suspend`, {}, {
        headers: {
          Authorization: authHeader
        }
      });
      if (response.data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error suspending user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async (userId: string) => {
    if (!window.confirm('Are you sure you want to reactivate this user?')) return;

    setLoading(true);
    try {
      const response = await apiClient.patch(`/management/admin/account/${userId}/reactivate`, {}, {
        headers: {
          Authorization: authHeader
        }
      });
      if (response.data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error reactivating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.permissions.role === roleFilter;
    const isNotCurrentUser = user._id !== authUser?._id; // Exclude current user
    return matchesSearch && matchesStatus && matchesRole && isNotCurrentUser;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedRow(null); // Close expanded row when changing pages
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6">
      <div className="bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Admin Users</h1>
            {canCreate() && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faUserPlus} />
                <span>Add Admin</span>
              </button>
            )}
          </div>

          {/* Filters and Search */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {canView() ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  {(canEdit() || canDelete()) && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <>
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === user._id ? null : user._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {user.profile.avatar ? (
                              <img src={user.profile.avatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-xl font-medium text-gray-500">
                                {user.profile.firstName[0]}
                              </span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.profile.fullName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.permissions.role)}`}>
                          {user.permissions.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.dateCreated).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {canEdit() && user.status === 'active' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSuspend(user._id);
                              }}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              <FontAwesomeIcon icon={faPause} />
                            </button>
                          )}
                          {canEdit() && user.status === 'suspended' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReactivate(user._id);
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FontAwesomeIcon icon={faPlay} />
                            </button>
                          )}
                          {canDelete() && (user.status === 'active' || user.status === 'suspended') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTerminate(user._id);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FontAwesomeIcon icon={faBan} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedRow === user._id && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Permissions</h4>
                              <div className="space-y-2">
                                {Object.entries(user.permissions.modules).map(([module, permissions]) => (
                                  <div key={module} className="flex items-center justify-between">
                                    <span className="text-gray-900 capitalize">{module.replace('Management', '')}</span>
                                    <div className="flex gap-2">
                                      {Object.entries(permissions).map(([action, hasPermission]) => (
                                        <span
                                          key={action}
                                          className={`px-2 py-1 text-xs rounded-full ${hasPermission ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                          {action}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Account Details</h4>
                              <div className="space-y-2">
                                <div>
                                  <span className="text-gray-500">Created:</span>
                                  <span className="ml-2 text-gray-900">{new Date(user.dateCreated).toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Last Login:</span>
                                  <span className="ml-2 text-gray-900">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Status:</span>
                                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                                    user.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                    {user.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            You don't have permission to view this content.
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {canCreate() && (
        <AddUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
};

export default AdminUser; 