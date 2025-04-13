import { faBuilding } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFloor: (data: {
    floorName: string;
    floorNum: number;
    mapFile?: FileList;
  }) => void;
}

export const ModalDialog = ({
  isOpen, onClose, onAddFloor
}: ModalDialogProps ) => {
  const [floorNum, setFloorNum] = useState<number>(0);
  const [floorName, setFloorName] = useState<string>("");
  const [mapFile, setMapFile] = useState<FileList | null>(null);

  const handleAddFloor = () => {
    if (!floorName) {
      alert("Floor name input not found.");
      return;
    }

    if (!mapFile || mapFile.length === 0) {
      alert("Please upload a PNG or JPG map image.");
      return;
    }

    onAddFloor({ floorName, floorNum, mapFile });
    setFloorName("");
    setFloorNum(0);
    setMapFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="relative z-20" aria-labelledby="modal-title" role='dialog' aria-modal="true">
      <div className="fixed inset-0 bg-gray-500/50 bg-opacity-75 transition-opacity" aria-hidden="true" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex flex-col sm:items-start">
                <div className="flex flex-row items-center">
                  <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:size-10">
                    <FontAwesomeIcon icon={faBuilding} className="h-6 w-6 text-uc-blue" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-base font-semibold text-gray-900" id="modal-title">
                      You are adding a new floor
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You are currently adding a new floor to the current location. Please provide the following information.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="my-4 w-full">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="floorName">
                    Floor Name
                  </label>
                  <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="floorName" type="text" placeholder="Floor Name" value={floorName} onChange={(e) => setFloorName(e.target.value)} />
                </div>
                <div className="my-4 w-full">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="floorNum">
                    Floor Number
                  </label>
                  <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="floorNum" type="number" placeholder="Floor Number" value={floorNum} onChange={(e) => setFloorNum(Number(e.target.value))} />
                </div>
                <div className="my-4 w-full">
                  <label htmlFor="mapFile" className="block text-gray-700 text-sm font-bold mb-2">
                    Upload Floor Map (PNG or JPG)
                  </label>
                  <input
                    id="mapFile"
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={(e) => setMapFile(e.target.files)}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 cursor-pointer" />
                </div>
                {mapFile && mapFile.length > 0 && (
                  <img src={URL.createObjectURL(mapFile[0])} alt="Uploaded Floor Map" />
                )}
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-10 cursor-pointer py-2 text-sm ml-4 font-semibold text-gray-900 ring-1 shadow-xs ring-gray-500 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto" onClick={onClose}>Cancel</button>
              <button type="button" className="inline-flex w-full justify-center rounded-md bg-green-600 px-10 cursor-pointer py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-700 sm:ml-3 sm:w-auto" onClick={handleAddFloor}>Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
