// ICONS
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
// REACT
import { useState } from "react";

interface FloorComponentProps {
  floorID: string;
  floorName: string;
  floorNumber: number;
  onSelect: (mapImage?: string) => void;
  layers: {
    floorID: string;
    layerName: string
  }[];
  selected: boolean;
}

export const FloorComponent = ({ floorID, floorName, floorNumber, onSelect, layers, selected }: FloorComponentProps) => {
  const [showSublayer, setShowSublayer] = useState<boolean>(false);

  return (
    <>
      <div className="rounded" tabIndex={0} onClick={() => onSelect(floorID)}>
        <div className={`flex flex-row px-2 py-3 items-center justify-between rounded ${selected ? "bg-uc-blue text-white" : "hover:bg-gray-400"}`}>
          <div className="flex items-center">
            <FontAwesomeIcon 
              icon={showSublayer ? faMinus : faPlus} 
              aria-expanded={showSublayer} 
              onClick={(e) => { e.stopPropagation(); setShowSublayer(!showSublayer) }} 
              className="cursor-pointer"
            />
            <span className="px-4"> {floorName} (Floor {floorNumber}) </span>
          </div>
        </div>
        <div className={`ml-5 overflow-hidden transition-all duration-300 rounded-b-md ${(showSublayer) ? "max-h-96 opacity-100 " : "max-h-0 opacity-0"} ${selected ? "bg-gray-200" : ""}`} aria-hidden={!showSublayer}>
          {/* Display layers */}
          <ul className="list-disc list-inside px-2 py-1">
            {layers.map((layer, index) => (
              <li key={index} className="text-md text-gray-700">
                {layer.layerName}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};
