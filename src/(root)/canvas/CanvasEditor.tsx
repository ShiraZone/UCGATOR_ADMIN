/**
 * CanvasEditor Component
 * 
 * This component provides a user interface for managing building floors and pins on a map.
 * It allows users to add, edit, and delete floors and pins, as well as publish changes.
 * The component includes a sidebar for navigation and actions related to floors, and a canvas
 * area that displays a map image with associated pins.
 * 
 * The component utilizes React hooks for state management and side effects, and it integrates
 * with a backend API for loading and saving floor and pin data. It also handles user authentication
 * and loading states.
 * 
 * @module CanvasEditor
 * 
 * @requires react
 * @requires react-router-dom
 * @requires ../../components/NavigationBar
 * @requires ./PinComponent
 * @requires ./PinDetailsModal
 * @requires ./FloorComponent
 * @requires ./ModalDialog
 * @requires ../../data/types
 * @requires react-auth-kit/hooks/useAuthHeader
 * @requires ../../lib/Canvas.helper
 * @requires ../../context/LoadingProvider
 * @requires @fortawesome/react-fontawesome
 * @requires ../../constant/COLORS
 * @requires ./HelpModal
 * @requires react-tooltip
 * 
 * @typedef {Object} PinDetails
 * @property {string} pinName - The name of the pin.
 * @property {string} pinDescription - A description of the pin.
 * @property {string} pinType - The type of location the pin represents (e.g., "room", "exit").
 * @property {string} pinImage - URL or path to an image representing the pin.
 * 
 * @typedef {Object} FloorData
 * @property {string} buildingID - The ID of the building the floor belongs to.
 * @property {string} floorID - The unique ID of the floor.
 * @property {string} floorName - The name of the floor.
 * @property {string} floorNumber - The number/level of the floor.
 * @property {File} floorImage - The image file representing the floor.
 * @property {string} updatedAt - The timestamp of the last update.
 * 
 * @returns {JSX.Element} The rendered CanvasEditor component.
 */

// REACT
import {
  useEffect,
  useRef,
  useState
} from "react";

// ROUTER
import {
  useParams,
  useLocation,
  useNavigate
} from "react-router-dom"

// COMPONENT
import NavigationBar from "@/components/NavigationBar";
import PinComponent from "./PinComponent";
import PinDetailsModal from "./PinDetailsModal";
import { FloorComponent } from "./FloorComponent";
import { ModalDialog } from "./ModalDialog";
import { DialogConfirm } from "@/components/DialogConfirm";

// INTERFACE
import { FloorData, Pins } from "../../data/types";

// AUTH
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';

// API
import {
  createFloorHandler,
  deleteBuilding,
  deleteFloor,
  loadFloorHandler,
  publishedBuilding,
  setPinHandler,
  updateBuilding,
  updateFloorName
} from "../../lib/Canvas.helper";

// CONTEXT
import { useLoading } from "../../context/LoadingProvider";
import { useToast, ToastType } from "../../context/ToastProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faCircleArrowLeft,
  faPencil,
  faPlus,
  faPrint,
  faSave
} from "@fortawesome/free-solid-svg-icons";
import { COLORS } from "../../constant/COLORS";
import { Tooltip } from "react-tooltip";
import { useApiToasts } from "@/hooks/useApiToasts"
import FloorDetailsModal from "@/components/FloorDetailsModal";
import BuildingModal from "@/components/BuildingModal";

const useQuery = () => new URLSearchParams(useLocation().search);

const validateFile = (file: File | null): boolean => {
  if (!file) return true; // No file to validate
  if (!file.type.startsWith("image/")) {
    console.error("Invalid file type. Please upload an image.");
    alert("Invalid file type. Please upload an image.");

    return false;
  }

  return true;
}

const CanvasEditor = () => {
  const { buildingID } = useParams();
  const query = useQuery();

  // DOM
  const navigate = useNavigate()

  // QUERY
  const buildingName = query.get('building_name');
  const floorCount: number = parseInt(query.get('count_floor')!);
  const published: boolean = (query.get('status')?.toLowerCase() === 'true') || false;
  // AUTH
  const authHeader = useAuthHeader();
  // CONTEXT
  const { setLoading } = useLoading();
  const { showToast } = useToast();

  // LAYERS RELATED
  const [layers, setLayers] = useState<{ floorID: string; layerName: string }[]>([]);

  // REF
  const imageRef = useRef<HTMLImageElement>(null);

  // FLOOR RELATED
  const [selectedFloorID, setSelectedFloorID] = useState<string | null>(null); // Track selected floor
  const [isModalOpen, setIsModalOpen] = useState(false);  // OKAY
  const [floors, setFloors] = useState<FloorData[] | undefined>([]);
  const [mapImage, setMapImage] = useState<string | null | undefined>(null);  // FLOOR & PIN RELATED
  type PinDetails = Pins['details'];
  const [editable, setEditable] = useState<boolean>(false);
  const [newPin, setNewPin] = useState<{ xPercent: number; yPercent: number } | null>(null);
  const [activePinIndex, setActivePinIndex] = useState<number | null>(null); // Track the active pin for the popover
  const [editingPinIndex, setEditingPinIndex] = useState<number | null>(null); // Track the pin being edited
  const [pins, setPins] = useState<{ [floorID: string]: Pins[] }>({}); // STORES ALL PIN
  const [pinsByFloor, setPinsByFloor] = useState<Pins[]>([]); // STORES ALL PINS OF THE CURRENT FLOOR
  const [pinDetails, setPinDetails] = useState<PinDetails | null>(); // STORE PIN DETAILS OF THE ACTIVE INDEX
  const [mapLoaded, setMapLoaded] = useState<boolean>(false); // STATE FOR MAP TRACKING
  const [toDeletePin, setToDeletPin] = useState<string[]>([]);
  const [openConfirmatory, setOpenConfirmatory] = useState<{ state: boolean; description: string }>({ state: false, description: '' }); // STATE FOR CONFIRMATION DIALOG
  // MODAL RELATED
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false); // State for pin modal
  const [isFloorDetailsModalOpen, setIsFloorDetailsModalOpen] = useState<boolean>(false);
  const [editingFloorDetails, setEditingFloorDetails] = useState<Pick<FloorData, 'floorID' | 'floorName'> | null>(null);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState<boolean>(false);

  // Track if there are any unsaved changes
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // CONFIGURATION RELATED
  const handleHistoryPush = () => {
    if (selectedFloorID && editable) {
      alert('Please save any work in progress.');
      return;
    }

    if (activePinIndex && editable) {
      alert('Please save any work in progress.');
      return;
    }

    navigate('/campus/map');
  }

  // CORRDINATES SYSTEM
  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current)
      return;

    if (!selectedFloorID) {
      alert('Please select a floor first before editing.');
      return;
    }

    if (!editable) {
      console.warn('Editing is currently disabled.');
      return;
    }

    if (activePinIndex !== null) {
      setActivePinIndex(null);
      setPinDetails({
        floorID: "",
        pinName: "",
        pinType: "",
        pinDescription: "",
        pinImage: ""
      });
    }

    // Get the actual image's bounding box
    const rect = imageRef.current.getBoundingClientRect();

    const pixelX = event.clientX - rect.left;
    const pixelY = event.clientY - rect.top;

    const xPercent = (pixelX / rect.width) * 100;
    const yPercent = (pixelY / rect.height) * 100;

    setNewPin({ xPercent, yPercent });
    setIsPinModalOpen(true);
  };

  /**
   * Handles adding a new pin with provided details to the selected floor.
   * 
   * This function adds a new pin to the pins collection, updates the available layers,
   * and refreshes the pins list for the current floor. It also resets the new pin state
   * and closes the pin modal.
   * 
   * @param {PinDetails} details - The details of the pin to be added including name, description, type, and image.
   * @returns {void}
   * 
   * @example
   * // Add a new pin with specific details
   * handleAddPinDetails({
   *   pinName: "Meeting Room",
   *   pinDescription: "Main conference room",
   *   pinType: "room",
   *   pinImage: "room.jpg"
   * });
   * 
   * @typedef {Object} PinDetails
   * @property {string} pinName - The name of the pin.
   * @property {string} pinDescription - A description of the pin.
   * @property {string} pinType - The type of location the pin represents (e.g., "room", "exit").
   * @property {string} pinImage - URL or path to an image representing the pin.
   */
  const handleAddPinDetails = (details: PinDetails): void => {
    if (newPin && selectedFloorID) {
      const incomingPin: Pins = {
        pinID: Math.random().toString(),
        details: {
          floorID: selectedFloorID,
          pinName: details.pinName,
          pinDescription: details.pinDescription,
          pinType: details.pinType,
          pinImage: details.pinImage,
        },
        coordinates: {
          x: newPin.xPercent,
          y: newPin.yPercent,
        }
      }

      console.log(details);

      setPins((prev) => ({
        ...prev,
        [selectedFloorID]: [...(prev[selectedFloorID] || []), incomingPin]
      }))

      setLayers((prev) => [
        ...prev,
        { floorID: selectedFloorID, layerName: details!.pinName }
      ])

      setPinsByFloor((prev) => [...prev, incomingPin]);
      setHasChanges(true); // Mark that changes have been made

      console.log(pinsByFloor);
      setNewPin(null); // Reset new pin
      setIsPinModalOpen(false); // Close the modal
    }
  };

  /**
   * Handles the click event on a pin in the floor map.
   * 
   * When a pin is clicked, this function toggles its active state and updates
   * the pin details display. If the same pin is clicked twice, it deactivates 
   * the pin selection.
   * 
   * @param {number} index - The index of the clicked pin in the pinsByFloor array.
   * @returns {void}
   * 
   * @example
   * // When pin at index 2 is clicked
   * handlePinClick(2);
   * 
   * @throws {TypeError} Potential error if pinsByFloor[index] doesn't exist or if selectedFloorID is null/undefined.
   */
  const handlePinClick = (index: number): void => {
    setActivePinIndex((prevIndex) => (prevIndex === index ? null : index));

    const info = pinsByFloor[index].details;

    const formattedInfo = {
      floorID: selectedFloorID!,
      pinName: info.pinName,
      pinType: info.pinType,
      pinDescription: info.pinDescription,
      pinImage: info.pinImage
    };

    if (selectedFloorID === info.floorID) {
      setPinDetails(formattedInfo);
    }
  }

  /**
   * Handles editing an existing pin with updated details.
   * 
   * This function updates a pin's details across multiple state structures:
   * - Updates the pin in the pinsByFloor array
   * - Updates the corresponding pin in the pins object organized by floor
   * - Updates the associated layer in the layers array
   * 
   * After updating all relevant state, it resets the editing state and closes the modal.
   * 
   * @param {PinDetails} updatedDetails - The new details for the pin being edited.
   * @returns {void}
   * 
   * @example
   * // Edit a pin with updated information
   * handleEditPin({
   *   floorID: "floor1",
   *   pinName: "Updated Meeting Room",
   *   pinDescription: "Renovated conference room",
   *   pinType: "room",
   *   pinImage: "updated-room.jpg"
   * });
   * 
   * @throws {TypeError} Potential error if selectedFloorID is null/undefined or editingPinIndex is invalid.
   */
  const handleEditPin = (updatedDetails: PinDetails): void => {
    if (selectedFloorID && editingPinIndex !== null) {

      const currentPin = pinsByFloor[editingPinIndex];

      const updatedPin: Pins = {
        ...currentPin,
        details: updatedDetails
      };

      // Update local state
      setPinsByFloor((prev) => {
        const updated = [...prev];
        updated[editingPinIndex] = updatedPin;
        return updated;
      });

      setPins((prev) => {
        const floorPins = [...(prev[selectedFloorID] || [])];
        // Find the correct pin in the floor pins array
        const pinIndexInFloor = floorPins.findIndex(p =>
          p.pinID === currentPin.pinID);

        if (pinIndexInFloor !== -1) {
          floorPins[pinIndexInFloor] = updatedPin;
        }

        return {
          ...prev,
          [selectedFloorID]: floorPins
        };
      });

      setLayers((prev) =>
        prev.map((layer) =>
          layer.floorID === selectedFloorID && layer.layerName === updatedDetails.pinName
            ? { ...layer, layerName: updatedDetails.pinName }
            : layer
        )
      );

      setHasChanges(true); // Mark that changes have been made
    }

    setEditingPinIndex(null); // Reset editing index
    setIsPinModalOpen(false); // Close the modal
    setIsPinModalOpen(false); // Close the modal
  };

  /**
   * Handles the deletion of a pin from the floor map.
   * 
   * This function:
   * - Validates that a floor is selected
   * - Adds the pin ID to the deletion queue (toDeletePin)
   * - Removes the pin from the pins object organized by floor
   * - Updates the pinsByFloor array for the current floor
   * - Removes the corresponding layer from the layers array
   * - Resets the active pin selection
   * 
   * @param {number} index - The index of the pin to delete in the current floor's pin array.
   * @returns {void}
   * 
   * @example
   * // Delete pin at index 3
   * handleDeletePin(3);
   * 
   * @throws {Error} Error message in console if selectedFloorID is not available.
   */
  const handleDeletePin = (index: number): void => {
    if (!selectedFloorID) {
      console.error("selectedFloorID is required");
      return; // Handle the error as needed
    }

    const pinToDelete = pins[selectedFloorID]?.[index];

    if (pinToDelete?.pinID) {
      setToDeletPin(prev => [...prev, pinToDelete.pinID]);
    }

    // Update the pins state
    setPins((prev) => {
      const floorPins = prev[selectedFloorID]; // Get the current pins for the floor
      const updatedPins = floorPins.filter((_, i) => i !== index); // Filter out the pin at the specified index

      return {
        ...prev,
        [selectedFloorID]: updatedPins, // Update the specific floorID with the new array
      };
    });

    // Update pinsByFloor state
    setPinsByFloor(() => {
      const floorPins = pins[selectedFloorID]; // Get the current pins for the floor
      const updatedPins = floorPins.filter((_, i) => i !== index); // Filter out the pin at the specified index
      return updatedPins; // Set the updated pins for the current floor
    });

    // Update layers state
    setLayers((prev) => {
      return prev.filter((_, i) => i !== index || prev[i].floorID !== selectedFloorID);
    });

    setHasChanges(true); // Mark that changes have been made
    setActivePinIndex(null); // Close the popover
  };

  /**
   * Handles toggling edit mode and saving pin changes to the server.
   * 
   * This function has dual functionality:
   * 1. If not in edit mode, it enables edit mode and returns early
   * 2. If in edit mode, it validates necessary parameters and sends pin updates to the server
   * 
   * The function manages loading state during API calls and toggles edit mode upon completion.
   * 
   * @async
   * @returns {Promise<null|void>} Returns null if the API call fails, otherwise void
   * @throws {Error} Various errors if required parameters are missing:
   *                 - If buildingID is missing
   *                 - If authHeader is missing
   *                 - If selectedFloorID is missing
   * 
   * @example
   * // Toggle edit mode or save changes
   * await handleSavePins();
   */
  const handleSavePins = async (): Promise<null | void> => {
    if (!editable) {
      setEditable(true);
      return;
    }

    setLoading(true);
    try {
      if (!buildingID) {
        throw new Error('Can not load existing target expat,-buildingID');
      }

      if (!authHeader) {
        throw new Error("Authorization header is missing. Please log in again.");
      }

      if (!selectedFloorID) {
        throw new Error("Can not find existing floor,-floorID")
      }

      const response = await setPinHandler(buildingID, authHeader, selectedFloorID, pinsByFloor, toDeletePin);

      if (!response) {
        return null;
      }
    } catch (error: any) {
      console.error(error || error.response?.data?.error);
    } finally {
      setLoading(false);
      setEditable(!editable);
    }
  }

  /**
   * Loads and processes floor data for the current building.
   * 
   * This function:
   * - Validates authentication credentials
   * - Fetches floor data from the server
   * - Processes the raw floor data to extract pin information
   * - Updates multiple state variables (pins, layers, floors)
   * - Handles loading states during the process
   * 
   * @async
   * @returns {Promise<void>}
   * @throws {Error} Various errors may occur during API calls or data processing
   * 
   * @example
   * // Load floor data for the current building
   * await handleLoadFloorEvent();
   * 
   * @requires buildingID - The ID of the building to load floors for
   * @requires authHeader - Authorization header for API authentication
   */
  const handleLoadFloorEvent = async (): Promise<void> => {
    setLoading(true, 'Setting up floor data...');
    try {

      if (!buildingID) {
        console.log('AMBOT');
      }

      if (!authHeader) {
        console.error("Authorization header is missing.");
        alert("Authorization header is missing. Please log in again.");
        return;
      }

      const rawFloors: object[] | null = await loadFloorHandler(buildingID, authHeader);

      if (!rawFloors) {
        console.log('Data is empty.');
      }

      let allLayers: any[] = [];

      const updatedFloors = rawFloors!.map((floor: any) => {
        const pins: Pins[] = floor.pin.map((pinner: any) => ({
          pinID: pinner._id,
          details: {
            floorID: floor.floorID,
            pinName: pinner.details.pinName,
            pinType: pinner.details.pinType,
            pinDescription: pinner.details.pinDescription,
            pinImage: pinner.pinImage,
          },
          coordinates: {
            x: pinner.coordinates.x,
            y: pinner.coordinates.y,
          }
        })) || [];

        setPins((prev) => ({
          ...prev,
          [floor.floorID]: pins
        }));

        const newLayers = pins.map((pin) => ({
          floorID: floor.floorID, // Use the floor ID
          layerName: pin.details.pinName || 'Unnamed Pin', // Use the pin name or a default value
        }));

        allLayers = [...allLayers, ...newLayers];

        return {
          floorID: floor.floorID,
          buildingID: floor.buildingID,
          floorNumber: floor.floorNumber,
          floorName: floor.floorName,
          floorImage: floor.floorImage,
          pin: pins.length > 0 ? pins : null,
          updatedAt: new Date().toString(),
          layers: newLayers
        }
      })

      setLayers(allLayers);
      setFloors(updatedFloors || []);
      setHasChanges(false);

    } catch (error: any) {
      console.log(error || error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handles the selection of a floor from the available floors.
   * 
   * This function:
   * - Prevents floor switching if currently in edit mode with unsaved changes
   * - Sets the selected floor ID in state
   * - Manages loading state during the operation
   * - Locates the selected floor data from the floors array
   * - Updates the current pins display based on the selected floor
   * - Sets the floor map image for display
   * 
   * @param {string} floorID - The ID of the floor to select
   * @returns {void}
   * 
   * @example
   * // Select floor with ID 'floor123'
   * handleSelectFloor('floor123');
   * 
   * @throws {Error} May throw errors during processing that will be caught and logged
   */
  const handleSelectFloor = (floorID: string): void => {
    if (selectedFloorID && editable) {
      alert('Please save the current progress before switching floors.');
      return;
    }

    setSelectedFloorID(floorID);
    setActivePinIndex(null);
    setPinDetails({
      floorID: floorID,
      pinName: "",
      pinType: "",
      pinDescription: "",
      pinImage: ""
    });
    setLoading(true, 'Loading Map...');
    try {

      const selectedFloor = floors?.find((floor) => floor.floorID === floorID);

      // If no selected floor, return error.
      if (!selectedFloor) {
        alert('The selected floor does not exist. Please choose a valid floor.');
        return;
      }

      setPinsByFloor(pins[floorID] ?? []);
      setMapImage(selectedFloor.floorImage);

    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the creation of a new floor for the current building.
   * 
   * This function:
   * - Validates the map file, floor name, and floor number
   * - Verifies authentication is present
   * - Prepares floor data for submission
   * - Submits the floor creation request to the server
   * - Updates the floors state with the newly created floor
   * - Manages loading state during the operation
   * 
   * @async
   * @param {Object} data - The floor data from the form
   * @param {string} data.floorName - The name of the floor
   * @param {string} data.floorNum - The number/level of the floor
   * @param {File[]} data.mapFile - Array containing the floor map image file
   * @returns {Promise<void>}
   * 
   * @example
   * // Create a new floor with form data
   * await handleAddFloorEvent({
   *   floorName: "Ground Floor",
   *   floorNum: "0",
   *   mapFile: [fileObject]
   * });
   * 
   * @requires validateFile - Function to validate the uploaded file
   * @requires authHeader - Authorization header for API authentication
   * @requires buildingID - The ID of the building to add the floor to
   */
  const handleAddFloorEvent = async (data: any): Promise<void> => {

    const file = data.mapFile && data.mapFile.length > 0 ? data.mapFile[0] : null;

    // Validate file
    if (!validateFile(file)) return;

    // Check if floor count exceeds limit
    if (floors && floors.length >= floorCount) {
      console.error(`Maximum floor count (${floorCount}) reached.`);
      alert(`Cannot add more floors. Maximum limit of ${floorCount} floors reached.`);
      return;
    }

    // Validate floorName and floorNum fields
    if (!data.floorName || !data.floorNum) {
      console.error("Floor name and floor number are required.");
      alert("Please provide both the floor name and floor number.");
      return;
    }

    // Validate authorization header
    if (!authHeader) {
      console.error("Authorization header is missing.");
      alert("Authorization header is missing. Please log in again.");
      return;
    }

    const floorData: FloorData = {
      buildingID: buildingID ?? null,
      floorID: null,
      floorName: data.floorName,
      floorNumber: data.floorNum,
      floorImage: file,
      updatedAt: new Date().toISOString(), // Add updatedAt property
    }

    setLoading(true, 'Loading Map...');
    try {
      const newFloor = await createFloorHandler(floorData, authHeader);

      if (!newFloor) {
        console.error("Failed to create a new floor.");
        alert("An error occurred while creating the floor. Please try again.");
        return;
      }

      const { currentFloor } = newFloor as { currentFloor: any };

      setFloors([
        ...(floors || []),
        {
          floorID: currentFloor.floorID,
          buildingID: currentFloor || "",
          floorNumber: currentFloor.floorNumber,
          floorName: currentFloor.floorName,
          floorImage: currentFloor.floorImage,
          updatedAt: new Date().toString(),
        }
      ]);

    } catch (error) {
      console.error("Error creating floor:", error);
      alert("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFloor = async (id: string) => {
    if (selectedFloorID && editable) {
      alert('Please save any work in progress');
      return;
    }

    setLoading(true, 'Deleting Floor.');
    try {
      // Validate buildingID and authorization header
      if (!buildingID) {
        console.error("Building ID is missing.");
        alert("Building ID is missing. Please try again.");
        return;
      }

      if (!authHeader) {
        console.error("Authorization header is missing.");
        alert("Authorization header is missing. Please log in again.");
        return;
      }

      const response = await deleteFloor(buildingID, id, authHeader);

      if (!response) {
        throw new Error('Failed to delete floor');
      }

      // Update state to remove the deleted floor
      setFloors(floors?.filter((floor) => floor.floorID !== id));
      setSelectedFloorID(null);
      setMapImage(null);
      setEditable(false);
    } catch (error) {
      console.error('Error deleting floor:', error);
      alert('Failed to delete floor. Please try again.');
    } finally {
      setLoading(false);
      setHasChanges(true);
    }
  };

  const publishedFloor = async () => {
    if (!buildingID)
      throw new Error('Could not published building. Please try again.');

    if (!authHeader) {
      console.error("Authorization header is missing.");
      alert("Authorization header is missing. Please log in again.");
      return;
    }

    setLoading(true); // Start loading
    try {
      const isPublished = await publishedBuilding(buildingID, authHeader);

      if (isPublished) {
        console.log('Building published successfully.');
        setOpenConfirmatory({ state: true, description: 'Building published successfully.' });
        // Reset changes after successful publishing
        setHasChanges(false);
      } else {
        console.error('Failed to publish the building.');
      }
    } catch (error) {
      console.error('Error publishing building:', error);
    } finally {
      setLoading(false);
    }
  }
  
  /**
   * Handles the editing of a floor name.
   * 
   * This function:
   * - Opens the floor details modal with the current floor details
   * - Sets the editing floor details in state
   * 
   * @param {string} floorID - The ID of the floor to edit
   * @param {string} floorName - The current name of the floor
   * @returns {void}
   */
  const handleEditFloorRequest = (floorID: string, floorName: string): void => {
    setEditingFloorDetails({ floorID, floorName });
    setIsFloorDetailsModalOpen(true);
  };  /**
   * Handles saving the updated floor name.
   * 
   * This function:
   * - Calls the API to update the floor name
   * - Updates the local state with the new floor name
   * - Shows toast messages for success/failure
   * - Closes the modal
   * 
   * @param {Object} updatedFloor - The updated floor details
   * @param {string} updatedFloor.floorID - The ID of the floor
   * @param {string} updatedFloor.floorName - The new name of the floor
   * @returns {Promise<void>}
   */
  const handleUpdateFloorName = async (updatedFloor: { floorID: string; floorName: string }): Promise<void> => {
    if (!buildingID || !authHeader) {
      showToast('Missing required information', ToastType.ERROR);
      return;
    }

    setLoading(true, 'Updating floor name...');
    try {
      const success = await updateFloorName(
        buildingID,
        updatedFloor.floorID,
        updatedFloor.floorName,
        authHeader
      );

      if (success) {
        // Update local state
        setFloors((prevFloors) =>
          prevFloors?.map(floor =>
            floor.floorID === updatedFloor.floorID
              ? { ...floor, floorName: updatedFloor.floorName }
              : floor
          ) || []
        );

        showToast('Floor name updated successfully', ToastType.SUCCESS);
        setHasChanges(true); // Mark that changes have been made
      } else {
        showToast('Failed to update floor name', ToastType.ERROR);
      }
    } catch (error) {
      console.error('Error updating floor name:', error);
      showToast('An error occurred while updating floor name', ToastType.ERROR);
    } finally {
      setLoading(false);
      setIsFloorDetailsModalOpen(false);
      setEditingFloorDetails(null);
    }
  };
  const handleUpdateBuilding = async (updatedBuilding: { buildingID: string; buildingName: string; floorCount: string; isLive: boolean }) => {
    if (!buildingID || !authHeader) {
      showToast('Missing required information', ToastType.ERROR);
      return;
    }

    setLoading(true, 'Updating building details...');
    try {
      const success = await updateBuilding(
        buildingID,
        authHeader,
        updatedBuilding.buildingName,
        updatedBuilding.floorCount
      );

      if (success) {
        // Update navigation URL to reflect the new building name
        navigate(`/campus/editor/${buildingID}?building_name=${encodeURIComponent(updatedBuilding.buildingName)}&count_floor=${updatedBuilding.floorCount}&status=${published}`, { replace: true });
        showToast('Building details updated successfully', ToastType.SUCCESS);
        setHasChanges(true); // Mark that changes have been made
      } else {
        showToast('Failed to update building details', ToastType.ERROR);
      }
    } catch (error) {
      console.error('Error updating building details:', error);
      showToast('An error occurred while updating building details', ToastType.ERROR);
    } finally {
      setLoading(false);
      setIsBuildingModalOpen(false);
    }
  };

  const handleDeleteBuilding = async () => {
    if (!buildingID || !authHeader) {
      showToast('Missing required information', ToastType.ERROR);
      return;
    }

    setLoading(true, 'Deleting building...');
    try {
      const success = await deleteBuilding(buildingID, authHeader);

      if (success) {
        showToast('Building deleted successfully', ToastType.SUCCESS);
        // Navigate back to canvas root after deletion
        navigate('/canvas', { replace: true });
      } else {
        showToast('Failed to delete building', ToastType.ERROR);
      }
    } catch (error) {
      console.error('Error deleting building:', error);
      showToast('An error occurred while deleting building', ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleLoadFloorEvent();
    setHasChanges(false);
  }, [buildingID])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (editable) {
        e.preventDefault();
        e.returnValue = ''; // Show confirmation dialog
      }
    };

    const handlePopState = () => {
      if (editable && !window.confirm('Are you sure you want to go back? Unsaved changes will be lost.')) {
        // Push the current page back to prevent navigation
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Add dummy state so we can detect back
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [editable]);

  useEffect(() => {
    if (published) {
      setOpenConfirmatory({ state: true, description: 'Building is already published. Any changes will not be reflected to the live users.' });
    }
  }, [published])

  useApiToasts();

  return (
    <div className="w-full h-screen select-none">
      <NavigationBar />
      <div className="h-[calc(100%-4rem)] bg-uc-editor-bg flex flex-row gap-0">
        {/* SIDE BAR */}
        <div className="w-[250px] border-r-1 flex flex-col h-full bg-white">
          <div className="p-3 text-center border-b-1 border-gray-300 flex flex-row gap-2">
            <button className="cursor-pointer" onClick={() => handleHistoryPush()}>
              <FontAwesomeIcon icon={faCircleArrowLeft} color={COLORS.BLUE} className="text-2xl" />
            </button>
            <h1 className="font-semibold text-xl">{buildingName} - {floorCount}</h1>
          </div>
          {/* BUTTON */}
          <div className="p-3 text-center border-b-1 border-gray-300 flex flex-row justify-around gap-2">
            <button
              className={`px-5 py-2 rounded-lg text-white font-semibold tracking-wider ${floors && floors.length < floorCount
                ? 'bg-yellow-600 cursor-pointer hover:bg-yellow-700'
                : 'bg-gray-400 cursor-not-allowed'
                }`}
              onClick={() => floors && floors.length < floorCount && setIsModalOpen(true)}
              data-tooltip-id="add-floor-btn"
              data-tooltip-content={
                floors && floors.length < floorCount
                  ? "Add a new floor"
                  : `Maximum floor count (${floorCount}) reached`
              }
            >
              <FontAwesomeIcon icon={faPlus} color="white" className="text-lg" />
            </button>
            <button
              className={`px-5 py-2 rounded-lg text-white font-semibold tracking-wider ${hasChanges ? 'bg-yellow-600 cursor-pointer hover:bg-yellow-700' : 'bg-gray-400 cursor-not-allowed'}`}
              data-tooltip-id="publish-btn"
              data-tooltip-content={hasChanges ? "Publish to live users" : "No changes to publish"}
              onClick={() => hasChanges && publishedFloor()}
              disabled={!hasChanges}
            >
              <FontAwesomeIcon icon={faPrint} color="white" className="text-lg" />
            </button>
            <button
              className={`px-5 py-2 rounded-lg text-white font-semibold tracking-wider bg-yellow-600 cursor-pointer hover:bg-yellow-700`}
              data-tooltip-id="building-btn"
              data-tooltip-content={"Edit building details"}
              onClick={() => setIsBuildingModalOpen(true)}
            >
              <FontAwesomeIcon icon={faBuilding} color="white" className="text-lg" />
            </button>
            <Tooltip id="add-floor-btn" className="z-150" />
            <Tooltip id="publish-btn" className="z-150" />
            <Tooltip id="building-btn" className="z-150" />
          </div>
          {/* LAYER LIST */}
          <div className="px-2 py-3 max-h-[1000px] overflow-auto scrollbar-hide">
            <h1 className="text-md">Layers</h1>
            <div className="flex flex-col gap-2 mt-2 ">
              {floors?.map((floor: FloorData) => (
                <FloorComponent
                  key={floor.floorID}
                  floorName={floor.floorName}
                  floorID={floor.floorID!}
                  floorNumber={floor.floorNumber}
                  onSelect={() => handleSelectFloor(floor.floorID!)}
                  layers={layers.filter((layer) => layer.floorID === floor.floorID)}
                  selected={selectedFloorID === floor.floorID}
                />
              ))}
            </div>
          </div>
        </div>
        {/* CANVAS */}
        {floors && floors.length > 0 ? (
          <>
            {mapImage && (
              <>
                <div className="overflow-auto flex-1 relative" >
                  <div className="max-w-fit max-h-fit m-2 p-2 bg-white z-15 absolute rounded-md justify-around items-center gap-3">
                    <button
                      className={`flex justify-center items-center flex-col p-3 hover:bg-gray-200 cursor-pointer gap-1 rounded min-w-[75px] ${isFloorDetailsModalOpen ? "bg-gray-200" : "bg-white"}`}
                      onClick={() => handleEditFloorRequest(selectedFloorID!, floors.find(floor => floor.floorID === selectedFloorID!)?.floorName!)}
                    >
                      <FontAwesomeIcon icon={faBuilding} color={COLORS.BLUE} className="text-xl" />
                      <h3 className="text-blue-950 font-semibold">Floor</h3>
                    </button>
                    <button
                      className={`flex justify-center items-center flex-col p-3 hover:bg-gray-200 cursor-pointer gap-1 rounded min-w-[75px] ${editable ? "bg-gray-200" : "bg-white"}`}
                      onClick={() => handleSavePins()}
                    >
                      <FontAwesomeIcon icon={editable ? faSave : faPencil} color={COLORS.BLUE} className="text-xl" />
                      <h3 className="text-blue-950 font-semibold">{`${editable ? "Save" : "Edit"}`}</h3>
                    </button>
                  </div>
                  <div className={`w-[1280px] max-h-[auto] mx-30 my-10 relative ${editable ? "cursor-pointer" : ""}`}>
                    <img src={mapImage} alt="Map" onClick={handleImageClick} className="max-h-full max-w-full" ref={imageRef} onLoad={() => { setMapLoaded(true) }} />
                    {/* Pin Layer - Positioned absolutely on top of the image */}
                    {mapLoaded && (
                      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        {pinsByFloor.map((pin, index) => (
                          <PinComponent
                            key={index}
                            xPercent={pin.coordinates.x}
                            yPercent={pin.coordinates.y}
                            details={pin.details}
                            isActive={activePinIndex === index}
                            onClick={() => handlePinClick(index)}
                            onEdit={() => {
                              setEditingPinIndex(index);
                              setPinDetails(pin.details);
                              setIsPinModalOpen(true);
                            }}
                            onDelete={() => handleDeletePin(index)}
                            editable={editable}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <h1 className="text-center">No map Image available</h1>
        )}
      </div>
      <ModalDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddFloor={handleAddFloorEvent} />
      <PinDetailsModal
        selectedFloorID={selectedFloorID!}
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setEditingPinIndex(null);
          if (newPin) {
            // Reset pin details only if adding a new pin
            setPinDetails({
              floorID: selectedFloorID!,
              pinName: "",
              pinType: "",
              pinDescription: "",
              pinImage: null
            });
          }
        }}
        onSave={(pinDetails) => {
          if (editingPinIndex !== null) {
            handleEditPin(pinDetails);
          } else {
            handleAddPinDetails(pinDetails);
          }
        }}
        initdetails={pinDetails!}
      />
      <DialogConfirm
        title="Confirmation"
        open={openConfirmatory.state}
        description={openConfirmatory.description}
        onConfirm={() => setOpenConfirmatory({ state: false, description: '' })}
        confirmText="Okay"
      />
      <FloorDetailsModal
        isOpen={isFloorDetailsModalOpen}
        onDelete={handleDeleteFloor}
        onClose={() => setIsFloorDetailsModalOpen(false)}
        onSave={handleUpdateFloorName}
        floorDetails={editingFloorDetails || undefined}
      />
      <BuildingModal
        isOpen={isBuildingModalOpen}
        onClose={() => setIsBuildingModalOpen(false)}
        onSave={handleUpdateBuilding}
        buildingDetails={{
          buildingID: buildingID!,
          buildingName: buildingName!,
          floorCount: floorCount.toString(),
          isLive: published
        }}
        onDelete={handleDeleteBuilding}
      />
    </div>
  )
}

export default CanvasEditor