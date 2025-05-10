import IMAGE from "../constant/IMAGES"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faInfoCircle, faMapPin } from "@fortawesome/free-solid-svg-icons"

import { Tooltip } from 'react-tooltip'
import { HelpModal } from "@/(root)/canvas/HelpModal"
import PinTypeModal from "./PinTypeModal"

import { useState, useEffect } from "react"

interface SelectedPinType {
    name: string;
}

const NavigationBar = () => {
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isPinTypeModalOpen, setIsPinTypeModalOpen] = useState(false);
    const [selectedPinType, setSelectedPinType] = useState<SelectedPinType | null>(null);
    
    // Handle pin type selection
    const handlePinTypeSelect = (pinTypeName: string) => {
        console.log(`Selected pin type: ${pinTypeName}`);
        // Here you would typically update context or state in a real app
        // For demonstration purposes we'll simulate retrieving the pin type details
        
        // Save to localStorage for persistence
        localStorage.setItem('selectedPinTypeName', pinTypeName);
        
        // Update the selected pin type
        setSelectedPinType({
            name: pinTypeName
        });
        
        // Show a toast or notification that would be implemented in a real app
        // showToast(`Pin type '${pinTypeName}' selected successfully`);
    };
    
    // Load the last selected pin type from localStorage on component mount
    useEffect(() => {
        const savedPinTypeName = localStorage.getItem('selectedPinTypeName');
        if (savedPinTypeName) {
            setSelectedPinType({
                name: savedPinTypeName
            });
        }
    }, []);
    
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
                <div className="relative flex flex-row justify-center items-center group gap-5">                    <div className="flex items-center">
                        {selectedPinType && (
                            <span className="text-white text-sm mr-2">
                                Active Pin: {selectedPinType.name}
                            </span>
                        )}
                        <FontAwesomeIcon 
                            icon={faMapPin} 
                            color="white" 
                            className="text-xl cursor-pointer" 
                            data-tooltip-id="pin-tooltip" 
                            data-tooltip-content="Select & Manage Pin Types" 
                            onClick={() => setIsPinTypeModalOpen(true)}
                        />
                        <Tooltip id="pin-tooltip" />
                    </div>
                    
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
            <PinTypeModal 
                isOpen={isPinTypeModalOpen}
                onClose={() => setIsPinTypeModalOpen(false)}
                onSelectPinType={handlePinTypeSelect}
            />
        </>
    )
}

export default NavigationBar