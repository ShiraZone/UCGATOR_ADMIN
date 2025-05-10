// CANVAS INTERFACE

export type Pins = {
    pinID: string;
    details: {
        floorID: string;
        pinName: string;
        pinType: string | undefined;
        pinDescription: string | undefined;
        pinImage: string | null;
    };
    coordinates: {
        x: number;
        y: number;
    };
}

export type FloorData = {
    buildingID: string | null | undefined;
    floorID: string | null | undefined;
    floorName: string;
    floorNumber: number;
    floorImage?: null | string;
    pin?: Pins[] | null;
    updatedAt: string;
}

export type RawFloorData = {
    _id: string | null | undefined;
    floorID: string | null | undefined;
    floorName: string;
    floorNumber: number;
    floorImage?: null | string;
    pois: Pins[] | null;
    updatedAt: string;
}

export type AddFloorEventData = {
    mapFile?: FileList;
    floorName: string;
    floorNum: number;
}

export type Building = {
    buildingID: string;
    buildingName: string;
    floorCount: string;
    published: boolean;
}

export interface ApiResponse<T = any> {
    floorData: RawFloorData[];
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
    page: number;
    totalPages: number;
    totalItems: number;
}

export interface ErrorResponse {
    statusCode: number;
    error: string;
    message: string;
}

export interface IUserData {
    _id: string;
    email: string;
    profile: {
        avatar: string;
        firstName: string;
        middleName?: string;
        lastName: string;
        fullName: string;
    };
    permissions: {
        role: 'admin' | 'editor' | 'viewer';
        modules: {
            [key: string]: {
                view: boolean;
                create: boolean;
                edit: boolean;
                delete: boolean;
            };
        };
    };
    status: 'active' | 'suspended' | 'inactive';
    dateCreated: string;
    lastLogin?: string;
}