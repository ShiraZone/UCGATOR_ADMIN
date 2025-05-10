import { Pins, FloorData, Building } from "./types";
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

export interface FloorDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedFloor: { floorID: string; floorName: string }) => void;
    floorDetails?: Pick<FloorData, 'floorID' | 'floorName'>;
    onDelete?: (floorID: string) => void;
}

export interface BuildingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedBuilding: { buildingID: string; buildingName: string; floorCount: string; isLive: boolean }) => void;
    buildingDetails?: Building;
    onDelete?: (buildingID: string) => void;
    onUnpublish?: (buildingID: string) => void;
}

export interface FloorDataResponse {
    success: boolean;
    floorData: RawFloorData[];
    message?: string;
    error?: string;
}