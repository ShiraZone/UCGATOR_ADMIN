// AXIOS
import axios from "axios";

// INTERFACES
import { FloorData } from "../data/types";

let url = import.meta.env.VITE_API_URL;

/**
 * Creates or stores a new floor draft in the database with the provided floor details.
 *
 * @async
 * @function createFloorHandler
 * @param {Object} floorData - The floor details to be sent to the server.
 * @param {string} floorData.buildingID - The unique identifier for the building.
 * @param {string} floorData.floorName - The name of the floor.
 * @param {number} floorData.floorNumber - The number of the floor.
 * @param {string} floorData.updatedAt - The last updated timestamp for the floor (ISO format).
 * @param {File} [floorData.floorImage] - An optional image file representing the floor.
 * @returns {Promise<Object|undefined>} Returns the `curFloor` object from the server response if successful, or `undefined` if there is an error.
 *
 * @example
 * // Sample usage
 * const floorData = {
 *   buildingID: '12345',
 *   floorName: 'First Floor',
 *   floorNumber: 1,
 *   updatedAt: '2025-04-09T18:40:07Z',
 *   floorImage: someFileObject, // Optional
 * };
 *
 * try {
 *   const authHeader = useAuthHeader();
 *   const createdFloor = await createFloorHandler(floorData, authHeader());
 *   console.log('Floor created:', createdFloor);
 * } catch (error) {
 *   console.error('Error creating floor:', error);
 * }
 *
 * @throws Will log an error to the console if the request fails.
 */
export const createFloorHandler = async (floorData: FloorData, authHeader: string): Promise<object | undefined> => {
    try {
        const formData = new FormData();

        // Append all non-file data to FormData
        // Validate data for possible null values
        if (floorData.buildingID) {
            formData.append('buildingID', floorData.buildingID);
        }
        formData.append('floorName', floorData.floorName);
        formData.append('floorNumber', floorData.floorNumber.toString());
        formData.append('updatedAt', floorData.updatedAt);

        // Append the floor image if it exists
        if (floorData.floorImage) {
            formData.append('floorImage', floorData.floorImage);
        }

        // AXIOS API
        const response = await axios.post(`${url}/canvas/store-bldg-draft`, formData, {
            headers: {
                // Add bearer authorization
                Authorization: authHeader,
                // Specify that the request is a multipart form and contains files.
                'Content-Type': 'multipart/form-data',
            }
        });

        // Validate the response
        if(!response.data.success) {
            console.error('Failed to create floor.');
            return;
        }

        // Filter out the response.
        const currentFloor = response.data.curfloor;
        const currentHistory = response.data.history;

        console.log(currentFloor);

        // Return response data.
        return { currentFloor, currentHistory };
    } catch (error: any) {
        // Log the error for debugging purposes.
        console.error('Error creating floor: ', error || error.response?.data?.error);
        // throw error or create user-friendly message.
        throw error;
    }
}

/**
 * Fetches floor data for a specified building from the API.
 * 
 * @async
 * @param {string|undefined} buildingID - The unique identifier of the building to load floors for.
 * @param {string} authHeader - The authorization header string for API authentication.
 * @returns {Promise<FloorData[]|null>} A promise that resolves to an array of floor data objects 
 *                                      or null if no floors are found or loading fails.
 * @throws {Error} If the API request fails or returns an error.
 * 
 * @example
 * // Get floors for a specific building
 * const floors = await loadFloorHandler('building123', 'Bearer token123');
 * 
 * @typedef {Object} FloorData
 * @property {string} buildingID - The ID of the building this floor belongs to.
 * @property {string} floorID - The unique identifier for the floor.
 * @property {string} floorName - The name of the floor.
 * @property {number} floorNumber - The numerical level of the floor.
 * @property {string} floorImage - URL or path to the floor image.
 * @property {string} updatedAt - Timestamp of when the floor data was last updated.
 * @property {Array} pin - Array of points of interest on this floor.
 */
export const loadFloorHandler = async (buildingID: string | undefined, authHeader: string): Promise<object[] | null> => {
    try {
        // Placeholder implementation

        const response = await axios.get(`${url}/canvas/load-floor`, {
            params: { buildingID },
            headers: {
                Authorization: authHeader
            }
        });

        if(!response.data.success) {
            console.error('Failed to load data.');
            return null;
        }

        const floorData: FloorData[] = (response.data.floorData as any[]).map((item): FloorData => ({
            buildingID: buildingID,
            floorID: item._id,
            floorName: item.floorName,
            floorNumber: item.floorNumber,
            floorImage: item.floorImage,
            updatedAt: item.updatedAt,
            pin: item.pois,
        }))

        if (floorData.length === 0) {
            return null;
        }

        return floorData;
    } catch (error: any) {
        // Log the error for debugging purposes.
        console.error('Error loading floor: ', error || error.response?.data?.error);
        // throw error or create user-friendly message.
        throw error;
    }
}

/**
 * Updates pin information for a specific floor in a building.
 * 
 * @async
 * @param {string|undefined} buildingID - The unique identifier of the building.
 * @param {string} authHeader - The authorization header string for API authentication.
 * @param {string} floorID - The unique identifier of the floor to update pins for.
 * @param {Array} pins - Array of pin objects to add or update on the floor.
 * @param {string[]} toDeletePin - Array of pin IDs to remove from the floor.
 * @returns {Promise<boolean>} A promise that resolves to true if the operation was successful, false otherwise.
 * @throws {Error} If the API request fails or returns an error.
 * 
 * @example
 * // Update pins on a floor
 * const success = await setPinHandler(
 *   'building123', 
 *   'Bearer token123', 
 *   'floor456', 
 *   [{ id: 'pin1', position: { x: 100, y: 200 }, label: 'Exit' }],
 *   ['pin2', 'pin3']
 * );
 */
export const setPinHandler = async (buildingID: string | undefined, authHeader: string, floorID: string, pins: any[], toDeletePin: string[]): Promise<boolean> => {
    
    console.log(pins);

    try {
        const response = await axios.post(`${url}/canvas/update-pin`,
            {
                buildingID,
                floorID,
                pins,
                toDeletePin
            },
            {
                headers: {
                    // Add bearer authorization
                    Authorization: authHeader,
                }
            }
        )

        if(!response.data.success) {
            console.error(`Fail to save pin details: ${response?.data?.error}`);
            return false;
        }

        // Return response data.
        return true;
    } catch (error: any) {
        // Log the error for debugging purposes.
        console.error('Error creating floor: ', error || error.response?.data?.error);
        // throw error or create user-friendly message.
        throw error;
    }
}