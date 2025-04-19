import { useState } from 'react';
import apiClient from '@/config/apiClient';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import { useLoading } from '@/context/LoadingProvider';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UserFormData {
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
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
}

const defaultPermissions = {
  role: 'viewer' as const,
  modules: {
    userManagement: {
      view: true,
      create: false,
      edit: false,
      delete: false
    },
    contentManagement: {
      view: true,
      create: false,
      edit: false,
      delete: false
    },
    reportManagement: {
      view: true,
      create: false,
      edit: false,
      delete: false
    }
  }
};

const AddUserModal = ({ isOpen, onClose, onSuccess }: AddUserModalProps) => {
  const authHeader = useAuthHeader();
  const { setLoading } = useLoading();
  
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    permissions: defaultPermissions
  });

  const handlePermissionChange = (module: string, action: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        modules: {
          ...prev.permissions.modules,
          [module]: {
            ...prev.permissions.modules[module],
            [action]: value
          }
        }
      }
    }));
  };

  const handleRoleChange = (role: 'admin' | 'editor' | 'viewer') => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        role,
        modules: {
          userManagement: {
            view: role === 'admin'|| role === 'viewer',
            create: role === 'admin',
            edit: role === 'admin',
            delete: role === 'admin'
          },
          contentManagement: {
            view: role === 'admin' || role === 'editor' || role === 'viewer',
            create: role === 'admin' || role === 'editor',
            edit: role === 'admin' || role === 'editor',
            delete: role === 'admin'
          },
          reportManagement: {
            view: role === 'admin' || role === 'editor' || role === 'viewer',
            create: role === 'admin',
            edit: role === 'admin',
            delete: role === 'admin'
          }
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/admin/sign-up', formData, {
        headers: {
          Authorization: authHeader
        }
      });
      
      if (response.data.success) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800/50 bg-opacity-75 flex items-center justify-center z-10">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Add New Admin User</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded p-1 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded p-1 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded p-1 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Middle Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded p-1 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                value={formData.middleName || ''}
                onChange={(e) => setFormData({...formData, middleName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded p-1 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <div className="grid grid-cols-3 gap-4">
              {(['admin', 'editor', 'viewer'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleChange(role)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    formData.permissions.role === role
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
            <div className="space-y-4">
              {Object.entries(formData.permissions.modules).map(([module, permissions]) => (
                <div key={module} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                    {module.replace('Management', '')}
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(permissions).map(([action, value]) => (
                      <label key={action} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handlePermissionChange(module, action, e.target.checked)}
                          className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{action}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Create Admin User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal; 