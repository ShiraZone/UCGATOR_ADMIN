// COMPONENTS
import SideNavBar from "../../components/SideNavBar"

// REACR-ROUTER
import { Outlet } from "react-router-dom"

import { useToast } from "@/context/ToastProvider"
import { initializeApiToasts } from "@/config/apiClient"
import { useEffect } from "react"

const Index = () => {
    const {showToast} = useToast();

    useEffect(() => {
        initializeApiToasts(showToast);
    }, [showToast])

    return (
        <div className="bg-gray-50 w-full h-screen flex flex-row">
            <SideNavBar/>
            <Outlet />
        </div>
    )
}

export default Index