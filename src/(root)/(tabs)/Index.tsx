// COMPONENTS
import SideNavBar from "../../components/SideNavBar"

// REACR-ROUTER
import { Outlet } from "react-router-dom"

import { useApiToasts } from "@/hooks/useApiToasts"
import { TopNavBar } from "@/components/TopNavBar"

const Index = () => {
    // Use our custom hook to initialize API toasts only once
    useApiToasts();

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