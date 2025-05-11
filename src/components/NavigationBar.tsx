import IMAGE from "../constant/IMAGES"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons"

import { Tooltip } from 'react-tooltip'
import { HelpModal } from "@/(root)/canvas/HelpModal"

import { useState } from "react"

const NavigationBar = () => {
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    return (
        <>
            <div className="w-full h-16 bg-uc-primary flex flex-row px-4 py-2 justify-between">
                <div className="flex flex-row gap-3 items-center">
                    <div className="flex flex-row gap-5 items-center">
                        <img src={IMAGE.UCGatorLogo} alt="ucgator_logo.png" className="w-18" />
                    </div>
                    <div className="flex justify-center items-center">
                        <h1 className="text-xl font-semibold tracking-wider text-white">UCGATOR ADMIN</h1>
                    </div>
                </div>
                <div className="relative flex flex-row justify-center items-center group gap-5">                    
                    <FontAwesomeIcon 
                        icon={faInfoCircle} 
                        color="white" 
                        className="text-xl cursor-pointer" 
                        data-tooltip-id="help-tooltip" 
                        data-tooltip-content="Help Section" 
                        onClick={() => setIsHelpModalOpen(true)}
                    />
                    <Tooltip id="help-tooltip" />
                </div>
            </div>
            <HelpModal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
            />
        </>
    )
}

export default NavigationBar