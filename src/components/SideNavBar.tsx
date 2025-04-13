// REACT
import { FC } from 'react';

// ICONS
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faSchool, faUser, faSignOut } from "@fortawesome/free-solid-svg-icons";

// ROUTER
import { Link, useLocation, useNavigate } from "react-router-dom";

// AUTH
import useSignOut from 'react-auth-kit/hooks/useSignOut'
import { useLoading } from '../context/LoadingProvider';

type MenuItemProps = {
    to: any;
    icon: any;
    label: string;
}

const MenuItem: FC<MenuItemProps> = ({ to, icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link to={to} className={`flex gap-4 items-center space-x-3 px-4 py-2 rounded-lg font-semibold transition ${isActive ? "bg-yellow-600 text-white" : "text-gray-500 hover:text-gray-300"} transform transition-transform duration-300 hover:scale-103`}>
            <FontAwesomeIcon icon={icon} />
            {label}
        </Link>
    )
}

const SideNavBar = () => {
    const signOut = useSignOut();
    const navigate = useNavigate();

    const handleSignOut = () => {
        signOut();
        navigate('/login', { replace: true })
    }

    return (
        <div className="w-[250px] h-screen bg-uc-primary">
            <div className="flex p-5 justify-center border-b-2 border-uc-gray1 h-auto">
                <h1 className="text-2xl tracking-wide text-white font-semibold">UCGator</h1>
            </div>
            <div className="flex flex-col">
                <div className='p-3 bg-gray-700 mx-2 flex flex-row justify-around rounded-xl mt-4'>
                    <Link to={'/profile/12379'} className='flex flex-row justify-center items-center gap-4 text-white transform transition-transform duration-300 hover:scale-105'>
                        <FontAwesomeIcon icon={faUser} />
                        <h3>Charles Peter</h3>
                    </Link>
                    <button onClick={() => handleSignOut()} className='text-white text-xl gap-2 flex flex-row justify-center items-center transform transition-transform duration-300 hover:scale-105 cursor-pointer'>
                        <FontAwesomeIcon icon={faSignOut} />
                    </button>
                </div>
                <div className="p-3">
                    <div>
                        <h1 className="text-2xl tracking-wide text-white font-semibold">Menu</h1>
                    </div>
                    <div className="flex flex-col my-3 gap-3.5">
                        <MenuItem to='/' icon={faHouse} label='Dashboard' />
                        <MenuItem to='/campus' icon={faSchool} label='Campus' />
                        <MenuItem to='/manage+user' icon={faUser} label='Accounts' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SideNavBar