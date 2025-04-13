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
    floorID: string | null;
    floorName: string;
    floorNumber: number;
    floorImage?: null | string;
    pin?: Pins[] | null;
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