import React, { useState, useEffect } from "react";
import { FloorDetailsModalProps } from "../data/interfaces";

const FloorDetailsModal: React.FC<FloorDetailsModalProps> = ({ isOpen, onClose, onSave, floorDetails, onDelete }) => {
    const [floorID, setFloorID] = useState<string>("");
    const [floorName, setFloorName] = useState<string>("");
    const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
    const [confirmDelete, setConfirmDelete] = useState<string>("");

    useEffect(() => {
        if (floorDetails) {
            setFloorID(floorDetails.floorID || "");
            setFloorName(floorDetails.floorName);
        }
    }, [floorDetails]);

    const handleSave = () => {
        if (!floorName.trim()) {
            alert('Please provide a name for this floor.');
            return;
        }

        onSave({ floorID, floorName });
        handleClose();
    };

    const handleDelete = () => {
        if (!floorDetails) return;
        
        if (confirmDelete !== floorDetails.floorName) {
            alert('Please type the exact floor name to confirm deletion.');
            return;
        }
        
        if (onDelete) {
            onDelete(floorID);
        }
        handleClose();
    };

    const handleClose = () => {
        onClose();
        // Reset form states
        if (!floorDetails) {
            setFloorName("");
            setFloorID("");
        }
        setIsDeleteMode(false);
        setConfirmDelete("");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                <h2 className="text-xl font-semibold mb-4">{floorDetails ? "Edit Floor Details" : "Add Floor Details"}</h2>
                
                {!isDeleteMode ? (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Floor Name</label>
                            <input
                                type="text"
                                className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={floorName}
                                onChange={(e) => setFloorName(e.target.value)}
                                placeholder="Enter floor name"
                            />
                        </div>
                        <div className="flex justify-between">
                            {floorDetails && (
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
                            <p className="my-2">To confirm deletion, please type the floor name: <span className="font-semibold">{floorDetails?.floorName}</span></p>                            <input
                                type="text"
                                className={`w-full border rounded p-2 focus:outline-none focus:ring-2 mt-2 ${
                                    confirmDelete 
                                        ? confirmDelete === floorDetails?.floorName
                                            ? "border-green-500 focus:ring-green-500" 
                                            : "border-red-500 focus:ring-red-500"
                                        : "border-red-300 focus:ring-red-500"
                                }`}
                                value={confirmDelete}
                                onChange={(e) => setConfirmDelete(e.target.value)}
                                placeholder="Type floor name to confirm"
                            />
                            {confirmDelete && (
                                <p className={`text-sm mt-1 ${confirmDelete === floorDetails?.floorName ? "text-green-600" : "text-red-600"}`}>
                                    {confirmDelete === floorDetails?.floorName 
                                        ? "Floor name matches! You can now delete." 
                                        : "Floor name does not match."}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button 
                                className="bg-gray-300 px-4 py-2 rounded cursor-pointer hover:bg-gray-400 transition-colors" 
                                onClick={() => setIsDeleteMode(false)}
                            >
                                Cancel
                            </button>                            <button 
                                className={`px-4 py-2 rounded ${
                                    confirmDelete === floorDetails?.floorName
                                    ? "bg-red-500 text-white cursor-pointer hover:bg-red-600"
                                    : "bg-red-300 text-white cursor-not-allowed"
                                } transition-colors`}
                                onClick={handleDelete}
                                disabled={confirmDelete !== floorDetails?.floorName}
                            >
                                Delete
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FloorDetailsModal;