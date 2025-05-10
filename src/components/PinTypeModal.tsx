import { useState, useEffect } from "react";
import {
    faXmarkCircle,
    faMapPin,
    faPlus,
    faPencil,
    faTrash,
    faCheck,
    faTimes,
    faSave
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { COLORS } from "../constant/COLORS";
import { ConfirmDialog } from "./DialogComponent";

interface PinTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPinType: (pinType: string) => void;
}

const PinTypeModal = ({ isOpen, onClose, onSelectPinType }: PinTypeModalProps) => {
    // Initial pin types - just names
    const initialPinTypes = [
        "Cashier",
        "Records Office",
        "Comfort Room",
        "Computer Lab",
        "Science Lab",
        "Elevator"
    ];

    // State for pin types (CRUD operations)
    const [pinTypes, setPinTypes] = useState<string[]>(initialPinTypes);

    // State for form fields
    const [newPinTypeName, setNewPinTypeName] = useState<string>("");

    // State for editing mode
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [editingPinTypeIndex, setEditingPinTypeIndex] = useState<number | null>(null);

    // State for confirmation dialog
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [pinTypeToDelete, setPinTypeToDelete] = useState<number | null>(null);

    // State for validation errors
    const [validationError, setValidationError] = useState<string | null>(null);

    // Reset form
    const resetForm = () => {
        setNewPinTypeName("");
        setEditingPinTypeIndex(null);
        setIsEditMode(false);
        setValidationError(null);
    };

    // Enter edit mode for a specific pin type
    const enterEditMode = (pinTypeName: string, index: number) => {
        setIsEditMode(true);
        setEditingPinTypeIndex(index);
        setNewPinTypeName(pinTypeName);
    };

    // Add new pin type
    const addPinType = () => {
        // Validate input
        if (!newPinTypeName.trim()) {
            setValidationError("Name is required");
            return;
        }

        // Check for duplicate name to avoid confusion
        if (!isEditMode && pinTypes.some(pinType =>
            pinType.toLowerCase() === newPinTypeName.toLowerCase()
        )) {
            setValidationError("A pin type with this name already exists");
            return;
        }

        if (isEditMode && editingPinTypeIndex !== null) {
            // Update existing pin type
            setPinTypes(pinTypes.map((pinType, index) =>
                index === editingPinTypeIndex
                    ? newPinTypeName
                    : pinType
            ));
        } else {
            // Add new pin type
            setPinTypes([
                ...pinTypes,
                newPinTypeName
            ]);
        }

        // Reset form and validation errors
        resetForm();
    };

    // Delete pin type
    const deletePinType = () => {
        if (pinTypeToDelete !== null) {
            setPinTypes(pinTypes.filter((_, index) => index !== pinTypeToDelete));
            setShowDeleteConfirm(false);
            setPinTypeToDelete(null);
        }
    };

    // Confirm pin type deletion
    const confirmDeletePinType = (index: number) => {
        setPinTypeToDelete(index);
        setShowDeleteConfirm(true);
    };

    // Save all pin types
    const savePinTypes = () => {
        console.log("Saving pin types:", pinTypes);
        localStorage.setItem('pinTypes', JSON.stringify(pinTypes));
        // Could show confirmation toast or message
    };

    // Cancel editing
    const cancelEdit = () => {
        resetForm();
    };

    useEffect(() => {
        // Reset state when modal is opened
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

    // Load pin types from localStorage on component mount
    useEffect(() => {
        try {
            const savedPinTypes = localStorage.getItem('pinTypes');
            if (savedPinTypes) {
                setPinTypes(JSON.parse(savedPinTypes));
            }
        } catch (error) {
            console.error("Error loading pin types from localStorage", error);
        }
    }, []);

    if (!isOpen) return null;

    return (
        <div className="relative z-99" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-500/50 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose} />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform rounded-lg overflow-auto bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg max-h-[700px]">
                        <div className="border-b-1 border-b-gray-200 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 items-center">
                            <button onClick={onClose} className="cursor-pointer">
                                <FontAwesomeIcon icon={faXmarkCircle} color={COLORS.BLUE} className="text-2xl" />
                            </button>
                            <h3 className="text-lg font-semibold text-uc-blue flex-1">
                                Manage Pin
                            </h3>
                        </div>
                        <div className="bg-white px-4 pt-4 pb-4 sm:p-6">
                            {/* Form for adding/editing pin types */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-md font-medium mb-3">{isEditMode ? "Edit Pin Type" : "Add New Pin Type"}</h4>
                                {validationError && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                                        {validationError}
                                    </div>
                                )}

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={newPinTypeName}
                                        onChange={(e) => {
                                            setNewPinTypeName(e.target.value);
                                            setValidationError(null);
                                        }}
                                        className="px-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        placeholder="Pin Type Name"
                                    />
                                </div>

                                <div className="flex justify-end space-x-2">
                                    {isEditMode ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={cancelEdit}
                                                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={addPinType}
                                                className="px-3 py-2 bg-green-600 rounded-md text-sm font-medium text-white hover:bg-green-700"
                                            >
                                                <FontAwesomeIcon icon={faCheck} className="mr-1" /> Update
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={addPinType}
                                            className="px-3 py-2 bg-yellow-600 rounded-md text-sm font-medium text-white hover:bg-yellow-700"
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add Pin Type
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* List of existing pin types */}
                            <div className="mt-4">
                                <h4 className="text-md font-medium mb-3">Current Pin Types</h4>
                                <div className="overflow-y-auto max-h-64 border rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {pinTypes.map((name, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <FontAwesomeIcon
                                                            icon={faMapPin}
                                                            className="text-lg text-gray-600"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            type="button"
                                                            onClick={() => enterEditMode(name, index)}
                                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                                        >
                                                            <FontAwesomeIcon icon={faPencil} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => confirmDeletePinType(index)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                type="button"
                                className="inline-flex justify-center items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                                onClick={savePinTypes}
                            >
                                <FontAwesomeIcon icon={faSave} className="mr-2" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmDialog
                open={showDeleteConfirm}
                title="Delete Pin Type"
                description="Are you sure you want to delete this pin type? This action cannot be undone."
                onConfirm={deletePinType}
                onCancel={() => {
                    setShowDeleteConfirm(false);
                    setPinTypeToDelete(null);
                }}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

export default PinTypeModal;