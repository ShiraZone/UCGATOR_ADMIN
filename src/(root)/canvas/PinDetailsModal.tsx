import React, { useState, useEffect } from "react";
import { PinDetailsModalProps } from "../../data/interfaces";

const PinDetailsModal: React.FC<PinDetailsModalProps> = ({ isOpen, onClose, onSave, initdetails, selectedFloorID }) => {
    const [floorID, setFloorID] = useState<string>(selectedFloorID!);
    const [pinName, setName] = useState<string>("");
    const [pinDescription, setDescription] = useState<string | undefined>("");
    const [pinType, setType] = useState<string | undefined>("");
    const [pinImage, setImage] = useState<string | null>(null);

    useEffect(() => {
        if (initdetails) {
            setFloorID(initdetails.floorID);
            setName(initdetails.pinName);
            setDescription(initdetails.pinDescription);
            setType(initdetails.pinType);
            setImage(initdetails.pinImage);
        }
    }, [initdetails]);

    const handleSave = () => {
        if (!pinName) {
            alert('Please provide a name for this pin.');
            return;
        }

        onSave({ floorID, pinName, pinDescription, pinType, pinImage });
        setName("");
        setDescription("");
        setType('');
        setImage(null);
    };

    const handleClose = () => {
        onClose();
        setName("");
        setDescription("");
        setType("");
        setImage(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-xl font-semibold mb-4">{initdetails ? "Edit Pin Details" : "Add Pin Details"}</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium">Name</label>
                    <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={pinName}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium">Description</label>
                    <textarea
                        className="w-full border rounded p-2"
                        value={pinDescription}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium">Service</label>
                    <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={pinType}
                        onChange={(e) => setType(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <h3>This image do not have any images yet.</h3>
                </div>
                <div className="flex justify-end gap-2">
                    <button className="bg-gray-300 px-4 py-2 rounded cursor-pointer hover:bg-gray-400 hover:text-white" onClick={handleClose}>
                        Cancel
                    </button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600" onClick={handleSave}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PinDetailsModal;
