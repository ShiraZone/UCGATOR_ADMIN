// COMPONENTS
import SideNavBar from "../../components/SideNavBar"

// REACR-ROUTER
import { Outlet } from "react-router-dom"

import { useToast } from "@/context/ToastProvider"
import { initializeApiToasts } from "@/config/apiClient"
import { useEffect } from "react"
import { TopNavBar } from "@/components/TopNavBar"

const Index = () => {
    const { showToast } = useToast();
    
    useEffect(() => {
        initializeApiToasts(showToast);
    }, [showToast])

    return (
        <div className="h-screen flex flex-row">
            <SideNavBar />
            <div className="flex flex-1 flex-col">
            <TopNavBar />
                <div className="flex-1 overflow-auto bg-gray-50">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Index