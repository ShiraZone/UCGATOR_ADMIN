// COMPONENTS
import SideNavBar from "../../components/SideNavBar"

// REACR-ROUTER
import { Outlet } from "react-router-dom"

const Index = () => {
    return (
        <div className="bg-gray-50 w-full h-screen flex flex-row">
            <SideNavBar/>
            <Outlet />
        </div>
    )
}

export default Index