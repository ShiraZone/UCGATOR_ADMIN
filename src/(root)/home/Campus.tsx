// COLORS
import { COLORS } from "../../constant/COLORS";

// ICONS
import { faBuilding, faPencil, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

// REACT
import { useEffect, useState, useRef } from "react";

// AUTH
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';

// CONTEXT
import { useLoading } from "../../context/LoadingProvider";
import axios from "axios";

let url = import.meta.env.VITE_API_URL;

// Add CSS for hiding scrollbars
const scrollbarHideStyles = {
  '-ms-overflow-style': 'none',  /* IE and Edge */
  'scrollbarWidth': 'none',      /* Firefox */
  '&::-webkit-scrollbar': {      /* Chrome, Safari and Opera */
    display: 'none'
  }
} as const;

// Types
interface Building {
  buildingID: string;
  buildingName: string;
  floors: Floor[];
}

interface Floor {
  floorID: string;
  floorName: string;
  floorNumber: number;
  floorImage?: string;
  pois?: POI[];
}

interface POI {
  details: {
    floorID: string;
    pinName: string;
    pinDescription: string;
    pinType: string;
  };
  coordinates: {
    x: number;
    y: number;
  };
  _id: string;
}

const Campus = () => {
  // AUTH
  const authHeader = useAuthHeader();
  
  // CONTEXT
  const { setLoading } = useLoading();

  // STATE
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [selectedFloor, setSelectedFloor] = useState<string>("");
  const [currentFloor, setCurrentFloor] = useState<Floor | null>(null);
  const [mapImage, setMapImage] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  // Get all buildings
  const getBuildings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/map/admin/building/load`, {
        headers: {
          Authorization: authHeader
        }
      });

      if (response.data.success) {
        setBuildings(response.data.buildings);
        if (response.data.buildings.length > 0) {
          const firstBuilding = response.data.buildings[0];
          setSelectedBuilding(firstBuilding.buildingID);
          if (firstBuilding.floors.length > 0) {
            setSelectedFloor(firstBuilding.floors[0].floorID);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
    } finally {
      setLoading(false);
    }
  }

  // Get floor data
  const getFloorData = async (floorID: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/map/admin/building/${floorID}`, {
        headers: {
          Authorization: authHeader
        }
      });

      if (response.data.success) {
        setCurrentFloor(response.data.floor);
        setMapImage(response.data.floor.floorImage);
      }
    } catch (error) {
      console.error('Error fetching floor data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Handle building change
  const handleBuildingChange = (buildingID: string) => {
    setSelectedBuilding(buildingID);
    const building = buildings.find(b => b.buildingID === buildingID);
    if (building && building.floors.length > 0) {
      setSelectedFloor(building.floors[0].floorID);
    }
  };

  // Handle floor change
  const handleFloorChange = (floorID: string) => {
    setSelectedFloor(floorID);
    getFloorData(floorID);
  };

  // Function to scroll to pin position
  const scrollToPin = (coordinates: { x: number, y: number }) => {
    if (!imageRef.current) return;

    const container = imageRef.current.parentElement?.parentElement?.parentElement;
    if (!container) return;

    const rect = imageRef.current.getBoundingClientRect();
    const pinX = (coordinates.x / 100) * rect.width;
    const pinY = (coordinates.y / 100) * rect.height;

    container.scrollTo({
      left: pinX - container.clientWidth / 2,
      top: pinY - container.clientHeight / 2,
      behavior: 'smooth'
    });
  };

  // Handle pin selection from sidebar
  const handlePinSelect = (poi: POI) => {
    setSelectedPinId(poi._id);
    scrollToPin(poi.coordinates);
  };

  // Load initial data
  useEffect(() => {
    getBuildings();
  }, []);

  // Load floor data when selected floor changes
  useEffect(() => {
    if (selectedFloor) {
      getFloorData(selectedFloor);
    }
  }, [selectedFloor]);

  return (
    <div className='w-full h-full bg-gray-50'>
      <div className='flex h-full'>
        {/* Main Content Area - 75% */}
        <div className="w-4/5 p-5 overflow-hidden">
          <div className="relative w-full h-[calc(100%-1rem)] bg-white rounded-xl shadow-lg">
            {mapImage ? (
              <div className="relative w-full h-full overflow-auto" style={scrollbarHideStyles}>
                <div className="absolute inset-0 min-w-full min-h-full flex items-center justify-center">
                  <div className="relative w-[1200px] h-[700px] flex items-center justify-center">
                    <img 
                      ref={imageRef}
                      src={mapImage} 
                      alt="Floor Plan" 
                      className="w-full h-full object-contain select-none"
                    />
                    {/* Render POIs */}
                    {currentFloor?.pois?.map((poi) => (
                      <div
                        key={poi._id}
                        className={`absolute cursor-pointer transition-all duration-300 ${
                          selectedPinId === poi._id 
                            ? 'w-4 h-4' 
                            : 'w-3 h-3'
                        }`}
                        style={{
                          left: `${poi.coordinates.x}%`,
                          top: `${poi.coordinates.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        title={poi.details.pinName}
                        onClick={() => setSelectedPinId(poi._id)}
                      >
                        <div className={`w-full h-full rounded-full ${
                          selectedPinId === poi._id 
                            ? 'bg-yellow-500 ring-4 ring-yellow-500 ring-opacity-50' 
                            : 'bg-red-500 hover:ring-4 hover:ring-red-500 hover:ring-opacity-50'
                        }`} />
                        
                        {/* Pin Info Popover */}
                        {selectedPinId === poi._id && (
                          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-full -top-2 bg-white rounded-lg shadow-lg p-3 min-w-[200px] z-50">
                            <div className="flex flex-col gap-1">
                              <h3 className="font-semibold text-gray-800">{poi.details.pinName}</h3>
                              <p className="text-sm text-gray-600">{poi.details.pinDescription}</p>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <span className="font-medium">Type:</span>
                                <span>{poi.details.pinType}</span>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-white transform -translate-x-1/2 translate-y-1 rotate-45"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No map image available</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - 25% */}
        <div className="w-1/5 bg-gray-900 text-white p-5 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <FontAwesomeIcon icon={faBuilding} className="text-xl" />
            <h1 className="font-bold tracking-wide text-xl">UCLM MAP</h1>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            <Link to="/campus/root" className="block">
              <button className="w-full h-12 bg-yellow-600 hover:bg-yellow-700 rounded font-bold tracking-wide">
                EDIT CANVAS
              </button>
            </Link>
            <button className="w-full h-12 bg-yellow-600 hover:bg-yellow-700 rounded font-bold tracking-wide">
              VIEW LOCATION
            </button>
            <button className="w-full h-12 bg-yellow-600 hover:bg-yellow-700 rounded font-bold tracking-wide">
              ANNOUNCEMENTS
            </button>
          </div>

          {/* Building/Floor Selection */}
          <div className="space-y-3 mb-6">
            <div className="relative">
              <select 
                value={selectedBuilding}
                onChange={(e) => handleBuildingChange(e.target.value)}
                className="w-full h-12 bg-white text-gray-900 rounded px-4 appearance-none cursor-pointer"
              >
                <option value="">Choose Building</option>
                {buildings.map((building) => (
                  <option key={building.buildingID} value={building.buildingID}>
                    {building.buildingName}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <FontAwesomeIcon icon={faBuilding} className="text-gray-500" />
              </div>
            </div>
            <div className="relative">
              <select
                value={selectedFloor}
                onChange={(e) => handleFloorChange(e.target.value)}
                className="w-full h-12 bg-white text-gray-900 rounded px-4 appearance-none cursor-pointer"
              >
                <option value="">Choose Floor</option>
                {buildings
                  .find(b => b.buildingID === selectedBuilding)
                  ?.floors.map((floor) => (
                    <option key={floor.floorID} value={floor.floorID}>
                      {floor.floorName}
                    </option>
                  ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <FontAwesomeIcon icon={faBuilding} className="text-gray-500" />
              </div>
            </div>
          </div>

          {/* All Locations List */}
          <div className="flex-1 bg-gray-800 rounded-lg p-4 flex flex-col min-h-0">
            <h2 className="text-lg font-semibold mb-4">All Locations</h2>
            <div className="flex-1 overflow-y-auto pr-2 min-h-0" style={scrollbarHideStyles}>
              {currentFloor?.pois?.map(poi => (
                <div 
                  key={poi._id} 
                  className={`flex items-center gap-2 py-2 px-3 rounded cursor-pointer transition-colors ${
                    selectedPinId === poi._id 
                      ? 'bg-yellow-600' 
                      : 'hover:bg-gray-700'
                  }`}
                  onClick={() => handlePinSelect(poi)}
                >
                  <FontAwesomeIcon 
                    icon={faLocationDot} 
                    className={selectedPinId === poi._id ? 'text-white' : 'text-red-500'} 
                  />
                  <span>{poi.details.pinName}</span>
                </div>
              ))}
              {(!currentFloor?.pois || currentFloor.pois.length === 0) && (
                <div className="text-gray-400 text-center py-2">
                  No locations available for this floor
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campus;