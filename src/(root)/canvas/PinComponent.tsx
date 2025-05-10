import React from "react";
import { PinComponentProps } from "../../data/interfaces";

const PinComponent: React.FC<PinComponentProps> = ({ xPercent, yPercent, details, isActive, onClick, onEdit, onDelete, editable }) => {

    const onEditHandlerEvent = () => {
        if (!editable) {
            alert('Click edit floor on the side buttons before editing this pin.');
            return;
        }

        onEdit && onEdit(details!);
    }

    return (
        <div
            className="absolute w-4 h-4 bg-red-500 rounded-full cursor-pointer pointer-events-auto"
            style={{
                left: `${xPercent}%`,
                top: `${yPercent}%`,
                transform: "translate(-50%, -50%)"
            }}
            onClick={onClick}
        >
            {isActive && details && (
                <div
                    className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10"
                    style={{
                        top: "120%", // Position below the pin
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "350px"
                    }}
                >
                    <h3 className="text-lg font-semibold">{details.pinName}</h3>
                    <p className="text-sm text-gray-600">
                        {details.pinDescription && details.pinDescription.length > 100 ? `${details.pinDescription.substring(0, 20)}...` : details.pinDescription}
                    </p>
                    {details.pinType && (
                        <p className="text-sm text-gray-600 font-medium">Service: {details.pinType}</p>
                    )}
                    {details.pinImage && (
                        <img
                            src={details.pinImage}
                            alt={details.pinName}
                            className="mt-2 w-full h-auto max-h-32 object-contain"
                        />
                    )}
                    <div className="flex justify-end gap-2 mt-2">
                        {editable && (
                            <>
                                <button
                                    className="bg-yellow-500 text-white px-2 py-1 rounded cursor-pointer hover:bg-yellow-700"
                                    onClick={() => onEditHandlerEvent()}
                                >
                                    Edit
                                </button>
                                <button className="bg-red-500 text-white px-2 py-1 rounded cursor-pointer hover:bg-red-600" onClick={onDelete}>
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PinComponent;
