// ICONS
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ConfirmDialog } from "@/components/DialogComponent";
// REACT
import { useState } from "react";

interface FloorComponentProps {
  floorID: string;
  floorName: string;
  floorNumber: number;
  onDelete: (id: string) => void;
  onSelect: (mapImage?: string) => void;
  layers: {
    floorID: string;
    layerName: string
  }[];
  selected: boolean;
}

export const FloorComponent = ({ floorID, floorName, floorNumber, onDelete, onSelect, layers, selected }: FloorComponentProps) => {
  const [showSublayer, setShowSublayer] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false)

  // Handle keyboard events for accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Delete") {
      setShowConfirm(true);
    }
  };

  return (
    <>
      <div className="rounded" tabIndex={0} onKeyDown={handleKeyDown} onClick={() => onSelect(floorID)}>
        <div className={`flex flex-row px-2 py-3 items-center rounded ${selected ? "bg-uc-blue text-white" : "hover:bg-gray-400"}`}>
          <FontAwesomeIcon icon={showSublayer ? faMinus : faPlus} aria-expanded={showSublayer} onClick={(e) => { e.stopPropagation(); setShowSublayer(!showSublayer) }} />
          <span className="px-4"> {floorName} (Floor {floorNumber}) </span>
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
      <ConfirmDialog 
        open={showConfirm}
        title="Delete Floor?"
        description="This will permanently remove the floor and its data."
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => {
          onDelete(floorID)
          setShowConfirm(false);
        }}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};
