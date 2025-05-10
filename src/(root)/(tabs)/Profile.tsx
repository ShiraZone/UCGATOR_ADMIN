import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCheck, faTimes, faKey, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import apiClient from '@/config/apiClient';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { useLoading } from '@/context/LoadingProvider';
import { IUserData } from '@/data/types';
import { toast } from 'react-toastify';

const url = import.meta.env.VITE_API_URL;

interface SecurityFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface EmailChangeData {
  newEmail: string;
  otp: string;
}

const inputClass = "px-4 py-3 block w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 transition-colors duration-200";
const labelClass = "block text-sm font-medium text-gray-600 mb-1.5";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    middleName: '',
    lastName: ''
  });
  const [securityForm, setSecurityForm] = useState<SecurityFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [emailChangeForm, setEmailChangeForm] = useState<EmailChangeData>({
    newEmail: '',
    otp: ''
  });

  const authHeader = useAuthHeader();
  const authUser = useAuthUser<IUserData>();
  const signIn = useSignIn();
  const { setLoading } = useLoading();

  useEffect(() => {
    if (authUser) {
      setEditForm({
        firstName: authUser.profile.firstName,
        middleName: authUser.profile.middleName || '',
        lastName: authUser.profile.lastName,
      });
    }
  }, [authUser]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiClient.patch(`${url}/management/account/${authUser?._id}/profile`, editForm, {
        headers: {
          Authorization: authHeader
        }
      });

      if (response.data.success) {
        if (authUser) {
          const updatedUser = {
            ...authUser,
            profile: {
              ...authUser.profile,
              firstName: editForm.firstName,
              middleName: editForm.middleName,
              lastName: editForm.lastName,
            }
          };
          
          signIn({
            auth: {
              token: authHeader?.split(' ')[1] || '',
              type: "Bearer"
            },
            userState: updatedUser
          });
        }
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post(`${url}/management/admin/account/change-password`, {
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword
      }, {
        headers: {
          Authorization: authHeader
        }
      });

      if (response.data.success) {
        toast.success('Password updated successfully');
        setIsChangingPassword(false);
        setSecurityForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!emailChangeForm.newEmail) {
      toast.error('Please enter a new email address');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post(`${url}/management/admin/account/email/send-otp`, {
        newEmail: emailChangeForm.newEmail
      }, {
        headers: {
          Authorization: authHeader
        }
      });

      if (response.data.success) {
        toast.success('OTP sent to your new email address');
        setOtpSent(true);
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailChangeForm.otp) {
      toast.error('Please enter the OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post(`${url}/management/admin/account/email/verify`, {
        newEmail: emailChangeForm.newEmail,
        otp: emailChangeForm.otp
      }, {
        headers: {
          Authorization: authHeader
        }
      });

      if (response.data.success) {
        toast.success('Email updated successfully');
        setIsChangingEmail(false);
        setOtpSent(false);
        setEmailChangeForm({
          newEmail: '',
          otp: ''
        });
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  if (!authUser) {
    return <div className="p-4">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-[90rem] mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Account Information Section - wider */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <h1 className="text-2xl font-bold text-gray-800">Account Information</h1>
                  <div className="flex gap-2 w-full md:w-auto">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 w-full md:w-auto justify-center"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                        <span>Edit Account</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 flex-1 md:flex-initial justify-center"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                          <span>Cancel</span>
                        </button>
                        <button
                          onClick={handleEditSubmit}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 flex-1 md:flex-initial justify-center"
                        >
                          <FontAwesomeIcon icon={faCheck} />
                          <span>Save Changes</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6">
                <div className="space-y-6">
                  {/* Profile Content */}
                  <div className="space-y-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center">
                            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                              {authUser.profile.avatar ? (
                                <img src={authUser.profile.avatar} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-3xl font-medium text-gray-500">
                                  {authUser.profile.firstName[0]}
                                </span>
                              )}
                            </div>
                            <div className="ml-6">
                              <h3 className="text-xl font-medium text-gray-900">{authUser.profile.fullName}</h3>
                              <p className="text-gray-500">{authUser.email}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
                            <div>
                              <label className={labelClass}>First Name</label>
                              <input
                                type="text"
                                value={editForm.firstName}
                                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Middle Name</label>
                              <input
                                type="text"
                                value={editForm.middleName}
                                onChange={(e) => setEditForm({ ...editForm, middleName: e.target.value })}
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Last Name</label>
                              <input
                                type="text"
                                value={editForm.lastName}
                                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                className={inputClass}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center">
                          <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {authUser.profile.avatar ? (
                              <img src={authUser.profile.avatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-3xl font-medium text-gray-500">
                                {authUser.profile.firstName[0]}
                              </span>
                            )}
                          </div>
                          <div className="ml-6">
                            <h3 className="text-xl font-medium text-gray-900">{authUser.profile.fullName}</h3>
                            <p className="text-gray-500">{authUser.email}</p>
                          </div>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
                          <div>
                            <label className="text-sm text-gray-500">First Name</label>
                            <p className="text-gray-900">{authUser.profile.firstName || editForm.firstName}</p>
                          </div>
                          {authUser.profile.middleName && (
                            <div>
                              <label className="text-sm text-gray-500">Middle Name</label>
                              <p className="text-gray-900">{authUser.profile.middleName || editForm.middleName}</p>
                            </div>
                          )}
                          <div>
                            <label className="text-sm text-gray-500">Last Name</label>
                            <p className="text-gray-900">{authUser.profile.lastName || editForm.lastName}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Account Status Information */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex flex-wrap items-center gap-8">
                      <div className="flex items-center gap-3">
                        <div>
                          <label className="text-sm text-gray-500">Role</label>
                          <p className="text-gray-900 capitalize font-medium">{authUser.permissions.role}</p>
                        </div>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <div>
                          <label className="text-sm text-gray-500">Status</label>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${authUser.status === 'active' ? 'bg-green-100 text-green-800' :
                            authUser.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {authUser.status}
                          </span>
                        </div>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <div>
                          <label className="text-sm text-gray-500">Account Created</label>
                          <p className="text-gray-900 font-medium">{new Date(authUser.dateCreated).toLocaleDateString()}</p>
                        </div>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <div>
                          <label className="text-sm text-gray-500">Last Login</label>
                          <p className="text-gray-900 font-medium">
                            {authUser.lastLogin ? new Date(authUser.lastLogin).toLocaleString() : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Module Permissions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(authUser.permissions.modules).map(([module, permissions]) => (
                        <div key={module} className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 capitalize mb-3">
                            {module.replace('Management', '')}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(permissions).map(([action, hasPermission]) => (
                              <span
                                key={action}
                                className={`px-3 py-1 text-sm rounded-full ${hasPermission ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings Section - wider */}
          <div className="lg:col-span-2 space-y-6">
            {/* Change Password Card */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
                  <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
                </div>
              </div>

              <div className="p-4">
                {!isChangingPassword ? (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 justify-center"
                  >
                    <FontAwesomeIcon icon={faKey} />
                    <span>Change Password</span>
                  </button>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className={labelClass}>Current Password</label>
                        <input
                          type="password"
                          value={securityForm.currentPassword}
                          onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className={labelClass}>New Password</label>
                        <input
                          type="password"
                          value={securityForm.newPassword}
                          onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Confirm New Password</label>
                        <input
                          type="password"
                          value={securityForm.confirmPassword}
                          onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsChangingPassword(false)}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                      >
                        Update
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Change Email Card */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold text-gray-800">Change Email</h2>
                  <p className="text-sm text-gray-500">Update your email address</p>
                </div>
              </div>

              <div className="p-4">
                {!isChangingEmail ? (
                  <button
                    onClick={() => setIsChangingEmail(true)}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 justify-center"
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span>Change Email</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>New Email Address</label>
                      <div className="space-y-2">
                        <input
                          type="email"
                          value={emailChangeForm.newEmail}
                          onChange={(e) => setEmailChangeForm({ ...emailChangeForm, newEmail: e.target.value })}
                          className={inputClass}
                          disabled={otpSent}
                          required
                        />
                        {!otpSent && (
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                          >
                            Send OTP
                          </button>
                        )}
                      </div>
                    </div>

                    {otpSent && (
                      <form onSubmit={handleEmailChange} className="space-y-4">
                        <div>
                          <label className={labelClass}>Enter OTP</label>
                          <input
                            type="text"
                            value={emailChangeForm.otp}
                            onChange={(e) => setEmailChangeForm({ ...emailChangeForm, otp: e.target.value })}
                            className={inputClass}
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsChangingEmail(false);
                              setOtpSent(false);
                              setEmailChangeForm({ newEmail: '', otp: '' });
                            }}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                          >
                            Verify
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;