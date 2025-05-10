import React, { useState, useEffect } from "react";
import { BuildingModalProps } from "../data/interfaces";

const BuildingModal: React.FC<BuildingModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    buildingDetails, 
    onDelete,
}) => {
    const [buildingID, setBuildingID] = useState<string>("");
    const [buildingName, setBuildingName] = useState<string>("");
    const [floorCount, setFloorCount] = useState<string>("");
    const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
    const [confirmDelete, setConfirmDelete] = useState<string>("");
    const [isUnpublishing, setIsUnpublishing] = useState<boolean>(false);

    useEffect(() => {
        if (buildingDetails) {
            setBuildingID(buildingDetails.buildingID || "");
            setBuildingName(buildingDetails.buildingName);
            setFloorCount(buildingDetails.floorCount);
        } else {
            // Reset form when opening for a new building
            setBuildingName("");
            setFloorCount("");
            setBuildingID("");
        }
    }, [buildingDetails, isOpen]);

    const handleSave = () => {
        if (!buildingName.trim()) {
            alert('Please provide a name for this building.');
            return;
        }

        if (!floorCount.trim() || isNaN(parseInt(floorCount))) {
            alert('Please provide a valid floor count.');
            return;
        }

        onSave({
            buildingID, buildingName, floorCount, isLive: buildingDetails?.isLive || false
        });
        handleClose();
    };
    
    const handleDelete = () => {
        if (!buildingDetails) return;
        
        if (confirmDelete !== buildingDetails.buildingName) {
            alert('Please type the exact building name to confirm deletion.');
            return;
        }

        // If the building is live and we need to unpublish first
        if (buildingDetails.isLive && !isUnpublishing) {
            setIsUnpublishing(true);
            return;
        }
        
        if (onDelete) {
            onDelete(buildingID);
        }
        handleClose();
    };

    const handleClose = () => {
        onClose();
        // Reset form states
        if (!buildingDetails) {
            setBuildingName("");
            setFloorCount("");
            setBuildingID("");
        }
        setIsDeleteMode(false);
        setConfirmDelete("");
        setIsUnpublishing(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                <h2 className="text-xl font-semibold mb-4">
                    {buildingDetails ? "Edit Building Details" : "Add Building Details"}
                </h2>
                
                {!isDeleteMode ? (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Building Name</label>
                            <input
                                type="text"
                                className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={buildingName}
                                onChange={(e) => setBuildingName(e.target.value)}
                                placeholder="Enter building name"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Floor Count</label>
                            <input
                                type="number"
                                className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={floorCount}
                                onChange={(e) => setFloorCount(e.target.value)}
                                placeholder="Enter number of floors"
                                min="1"
                            />
                        </div>
                        
                        <div className="flex justify-between">
                            {buildingDetails && (
                                <button 
                                    className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-600 transition-colors" 
                                    onClick={() => setIsDeleteMode(true)}
                                >
                                    Delete
                                </button>
                            )}
                            <div className="flex gap-2 ml-auto">
                                <button 
                                    className="bg-gray-300 px-4 py-2 rounded cursor-pointer hover:bg-gray-400 transition-colors" 
                                    onClick={handleClose}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 transition-colors" 
                                    onClick={handleSave}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mb-4">
                            <p className="text-red-500 font-medium">Warning: This action cannot be undone</p>
                              {buildingDetails?.isLive && !isUnpublishing && (
                                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="text-yellow-700">
                                        <strong>Notice:</strong> This building is currently published.
                                    </p>
                                    <p className="text-yellow-700 text-sm mt-1">
                                        We see that the building is currently published. Deleting so will unpublish it.
                                    </p>
                                </div>
                            )}                            {isUnpublishing && (
                                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="text-yellow-700">
                                        <strong>Confirm:</strong> Are you sure you want to delete?
                                    </p>
                                    <p className="text-yellow-700 text-sm mt-1">
                                        The building will be unpublished and then permanently deleted.
                                    </p>
                                </div>
                            )}
                            
                            <p className="my-2">
                                To confirm deletion, please type the building name: 
                                <span className="font-semibold"> {buildingDetails?.buildingName}</span>
                            </p>
                            
                            <input
                                type="text"
                                className={`w-full border rounded p-2 focus:outline-none focus:ring-2 mt-2 ${
                                    confirmDelete 
                                        ? confirmDelete === buildingDetails?.buildingName
                                            ? "border-green-500 focus:ring-green-500" 
                                            : "border-red-500 focus:ring-red-500"
                                        : "border-red-300 focus:ring-red-500"
                                }`}
                                value={confirmDelete}
                                onChange={(e) => setConfirmDelete(e.target.value)}
                                placeholder="Type building name to confirm"
                            />
                            
                            {confirmDelete && (
                                <p className={`text-sm mt-1 ${confirmDelete === buildingDetails?.buildingName ? "text-green-600" : "text-red-600"}`}>
                                    {confirmDelete === buildingDetails?.buildingName 
                                        ? "Building name matches! You can now proceed." 
                                        : "Building name does not match."}
                                </p>
                            )}
                        </div>
                        
                        <div className="flex justify-end gap-2">
                            <button 
                                className="bg-gray-300 px-4 py-2 rounded cursor-pointer hover:bg-gray-400 transition-colors" 
                                onClick={() => {
                                    setIsDeleteMode(false);
                                    setIsUnpublishing(false);
                                }}
                            >
                                Cancel
                            </button>
                            
                            <button 
                                className={`px-4 py-2 rounded ${
                                    confirmDelete === buildingDetails?.buildingName
                                    ? "bg-red-500 text-white cursor-pointer hover:bg-red-600"
                                    : "bg-red-300 text-white cursor-not-allowed"
                                } transition-colors`}                                onClick={handleDelete}
                                disabled={confirmDelete !== buildingDetails?.buildingName}
                            >
                                {isUnpublishing ? "Confirm Delete" : "Delete"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BuildingModal;