import { Pins } from "./types";

type PinDetails = Pins['details'];

export interface PinComponentProps {
    xPercent: number;
    yPercent: number;
    details: PinDetails
    isActive: boolean;
    onClick?: () => void;
    onEdit?: (updatedDetails: PinDetails ) => void;
    onDelete?: () => void;
}

export interface PinDetailsModalProps {
    selectedFloorID?: string;
    isOpen: boolean;
    initdetails?: PinDetails;
    onSave: (details: PinDetails) => void;
    onClose: () => void
}