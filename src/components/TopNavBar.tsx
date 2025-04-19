import { faSignOut } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { IUserData } from '@/data/types';


export const TopNavBar = () => {
    const location = useLocation();
    const signOut = useSignOut();
    const navigate = useNavigate();
    const authUser = useAuthUser<IUserData>();

    const handleSignOut = () => {
        signOut();
        navigate('/login', { replace: true })
    }

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/dashboard')) return 'Dashboard';
        if (path.includes('/campus')) return 'Campus';
        if (path.includes('/users')) return 'Users';
        if (path.includes('/profile')) return 'Profile';
        if (path.includes('/announcement')) return 'Announcement';
        return 'Dashboard';
    }

    return (
        <div className='flex items-center justify-between px-4 py-2 bg-white shadow-sm border-b border-gray-200'>
            <div className='flex items-center'>
                <span className='text-lg font-semibold text-gray-800'>
                    {getPageTitle()}
                </span>
            </div>
            <div className='flex items-center gap-4'>
                {/** LOGOUT */}
                <div className='text-right'>
                    <div className="text-sm font-medium text-gray-900">{authUser?.profile.firstName} {authUser?.profile.lastName}</div>
                    <div className="text-xs text-gray-500">{authUser?.email}</div>
                </div>
                {/** LOGOUT */}
                <div className='relative cursor-pointer transform transition-transform duration-300 hover:scale-103'>
                    <Link to={`/profile/${authUser?._id}`}>
                        <img src={authUser?.profile.avatar} alt="profile_image" className='w-[45px] h-[45px] rounded-3xl contain-size' />
                    </Link>
                </div>
                <div className='text-gray-500 hover:text-gray-700 cursor-pointer transform transition-transform duration-300 hover:scale-103'>
                    <FontAwesomeIcon icon={faSignOut} onClick={() => handleSignOut()} />
                </div>
            </div>
        </div>
    )
}
