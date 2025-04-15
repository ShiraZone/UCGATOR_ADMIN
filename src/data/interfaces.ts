import { Pins } from "./types";
import { RawFloorData } from "./types";

type PinDetails = Pins['details'];

export interface PinComponentProps {
    xPercent: number;
    yPercent: number;
    details: PinDetails
    isActive: boolean;
    onClick?: () => void;
    onEdit?: (updatedDetails: PinDetails) => void;
    onDelete?: () => void;
    editable: boolean;
}

export interface PinDetailsModalProps {
    selectedFloorID?: string;
    isOpen: boolean;
    initdetails?: PinDetails;
    onSave: (details: PinDetails) => void;
    onClose: () => void;
}

export interface FloorDataResponse {
    success: boolean;
    floorData: RawFloorData[];
    message?: string;
    error?: string;
}