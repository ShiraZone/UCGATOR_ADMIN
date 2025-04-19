// ICONS
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faMicrophone, faSchool, faUser } from "@fortawesome/free-solid-svg-icons";

// ROUTER
import { Link, useLocation } from "react-router-dom";

const SideNavBar = () => {
    const location = useLocation();

    const isPathActive = (basePath: any) => location.pathname.startsWith(basePath);

    return (
        <div className="w-[250px] h-screen bg-uc-primary">
            <div className="flex p-5 justify-center border-b-2 border-uc-gray1 h-auto">
                <h1 className="text-2xl tracking-wide text-white font-semibold">UCGator</h1>
            </div>
            <div className="flex flex-col">
                <div className="p-3">
                    <div>
                        <h1 className="text-2xl tracking-wide text-white font-semibold">Menu</h1>
                    </div>
                    <div className="flex flex-col my-3 gap-3.5">
                        <div className='relative group'>
                            <button className={`flex items-center w-full gap-4 space-x-3 px-4 py-2 rounded-lg font-semibold transition ${isPathActive("/dashboard") ? "bg-yellow-600 text-white" : "text-gray-500 hover:text-gray-300"} transform transition-transform duration-300 hover:scale-103`}> 
                                <FontAwesomeIcon icon={faHouse} />
                                Dashboard 
                            </button>
                            <div className="ml-8 mt-1 hidden group-hover:flex flex-col space-y-1 text-sm text-white">
                                <Link to='/dashboard/overview' className='text-lg font-semibold hover:text-gray-300'>Overview</Link>
                                <Link to='/dashboard/reports' className='text-lg font-semibold hover:text-gray-300'>Reports</Link>
                            </div>
                        </div>
                        <div className='relative group'>
                            <button className={`flex items-center w-full gap-4 space-x-3 px-4 py-2 rounded-lg font-semibold transition ${isPathActive('/campus') ? "bg-yellow-600 text-white" : "text-gray-500 hover:text-gray-300"} transform transition-transform duration-300 hover:scale-103`}> 
                                <FontAwesomeIcon icon={faSchool} />
                                Campus 
                            </button>
                            <div className="ml-8 mt-1 hidden group-hover:flex flex-col space-y-1 text-sm text-white">
                                <Link to='/campus/map' className='text-lg font-semibold hover:text-gray-300'>Maps</Link>
                                <Link to='/campus/root' className='text-lg font-semibold hover:text-gray-300'>Canvas</Link>
                                <Link to='/campus/location pins' className='text-lg font-semibold hover:text-gray-300'>Pins</Link>
                            </div>
                        </div>
                        <div className='relative group'>
                            <button className={`flex items-center w-full gap-4 space-x-3 px-4 py-2 rounded-lg font-semibold transition ${isPathActive('/users') ? "bg-yellow-600 text-white" : "text-gray-500 hover:text-gray-300"} transform transition-transform duration-300 hover:scale-103`}>
                                <FontAwesomeIcon icon={faUser} />
                                Users 
                            </button>
                            <div className="ml-8 mt-1 hidden group-hover:flex flex-col space-y-1 text-sm text-white">
                                <Link to='/users/system users' className='text-lg font-semibold hover:text-gray-300'>System Users</Link>
                                <Link to='/users/admin users' className='text-lg font-semibold hover:text-gray-300'>Admin Users</Link>
                            </div>
                        </div>
                        <div className='relative group'>
                            <button className={`flex items-center w-full gap-4 space-x-3 px-4 py-2 rounded-lg font-semibold transition ${isPathActive('/announcement') ? "bg-yellow-600 text-white" : "text-gray-500 hover:text-gray-300"} transform transition-transform duration-300 hover:scale-103`}>
                                <FontAwesomeIcon icon={faMicrophone} />
                                Announcement 
                            </button>
                            <div className="ml-8 mt-1 hidden group-hover:flex flex-col space-y-1 text-sm text-white">
                                <Link to='/announcement/list all' className='text-lg font-semibold hover:text-gray-300'>Announcements</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SideNavBar