// REACT
import React from 'react'
import { FormEvent, useEffect, useState } from 'react'

// ICONS
import { faBuilding, } from '@fortawesome/free-solid-svg-icons'

// COMPONENTS
import NavigationBar from '../../components/NavigationBar'

// ROUTER
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// AXIOS
import axios from 'axios'

// AUTH
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';

// INTERFACE
import { Building } from '../../data/types'
import { useLoading } from '../../context/LoadingProvider'

const CanvasHistoryComponent = ({
    buildingID,
    buildingName,
    floorCount,
    published
}: Building) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if(published) {
            alert('Cannot edit published buildings for now.');
            return;
        }

        const uri = `/editor/${buildingID}?building_name=${encodeURIComponent(buildingName)}&count_floor=${floorCount}`;
        navigate(uri);
    };

    // CHANGE THIS SOONER

    return (
        <div id={buildingID} className='min-w-[300px] min-h-[150px] max-h-[200px] relative rounded-2xl border-1 p-3 cursor-pointer hover:bg-gray-200 transform transition-transform duration-300 hover:scale-105' onClick={handleClick}>
            <h3>{buildingName} - {floorCount}</h3>
            <h3>{published ? 'PUBLISHED' : ''}</h3>
        </div>
    )
}

const CanvasRoot = () => {
    // ENVIRONMENT URL
    const url = import.meta.env.VITE_API_URL;
    // AUTH
    const authHeader = useAuthHeader();
    // REACT-DOM
    const navigate = useNavigate();
    // STATE MANAGEMENT
    const [saveBldgs, setSaveBldgs] = useState<Building[]>([]);
    // LOADING MANAGEMENT
    const { setLoading } = useLoading();

    const submitNameHandler = async (e: FormEvent) => {
        e.preventDefault();
        const buildinginput = document.getElementById('bldgName') as HTMLInputElement;
        const floorinput = document.getElementById('floorCnt') as HTMLInputElement;

        const rawBuildingName = buildinginput.value.trim();
        const rawFloorCount = parseInt(floorinput.value.trim(), 10);

        if (!rawBuildingName) {
            alert('Please enter a building name');
            return;
        }

        setLoading(true, 'Loading...');
        try {
            const encodedName = encodeURIComponent(rawBuildingName!);
            const buildingID = await createBuildingHandler(rawBuildingName, rawFloorCount);
    
            const uri = `/editor/${buildingID}?building_name=${encodedName}&count_floor=${rawFloorCount}`;
    
            if(buildingID) {
                navigateToCanvasHandler(uri);
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const createBuildingHandler = async (rawBuildingName: string, rawFloorCount: number) => {
        try {
            const response = await axios.post(`${url}/canvas/create-bldg`, 
                {
                    rawBuildingName,
                    rawFloorCount
                },
                {
                    headers: {
                        Authorization: authHeader
                    }
                }
            )

            if(!response.data.success) {
                console.error(response.data.error);
            }

            const buildingID = response.data.building._id;

            return buildingID;
        } catch (error: any) {
            console.error(error || error.response?.data?.error);
            alert(error.response?.data?.handler);
        }
    }

    const loadHistoryHandler = async () => {
        try {
            const response = await axios.get(`${url}/canvas/load-bldg`, {
                headers: {
                    Authorization: authHeader
                }
            });

            const buildings = response.data.buildings;

            setSaveBldgs(buildings.map((building: any) => ({
                buildingID: building._id,
                buildingName: building.buildingName,
                floorCount: building.floorCount,
                published: building.published
            })));
        } catch (error: any) {
            console.error(error || error.response?.data?.error);
        }
    }

    const navigateToCanvasHandler = (uri: string) => {
        if(!uri) {
            console.error('URI not found.')
            return;
        }

        navigate(uri);

        const CanvasEditor = React.lazy(() => import('./CanvasEditor'));

        <React.Suspense fallback={<div>Loading...</div>}>
            <CanvasEditor />
        </React.Suspense>
    }

    useEffect(() => {
        setLoading(true, 'Loading Data...');
        try {
            loadHistoryHandler();
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
        
    }, []);

    return (
        <div className="bg-gray-50 w-full h-screen">
            <NavigationBar />
            <div className='h-[calc(100%-4rem)] flex flex-col items-center justify-start space-y-4 p-10'>
                <div className='flex flex-col gap-4 items-center justify-center border-b-1 border-gray-400/90 w-full px-2 py-5'>
                    <input type="text" id="bldgName" name="bldgName" placeholder="Building Name" className='block w-56 max-w-100 min-w-75 rounded-md py-2 px-3 ring-1 ring-inset ring-gray-400 focus:text-gray-800' required />
                    <input type="number" id="floorCnt" name="floorCnt" placeholder="Floor Count" className='block w-56 max-w-100 min-w-75 rounded-md py-2 px-3 ring-1 ring-inset ring-gray-400 focus:text-gray-800' required />
                    <button className='bg-yellow-600 text-white px-6 py-3 rounded-lg border-dashed border-2 border-black flex items-center gap-2 cursor-pointer hover:bg-white hover:text-black' onClick={submitNameHandler}>
                        <FontAwesomeIcon icon={faBuilding} />
                        <h1>Add New Building</h1>
                    </button>
                </div>
                <div className='flex flex-col gap-4 items-center w-fit'>
                    <h3>Recent Layers</h3>
                    <div className='grid grid-cols-3 gap-4 w-full'>
                        {saveBldgs && saveBldgs.length > 0 ? (
                            saveBldgs.map((building) => (
                                <CanvasHistoryComponent
                                    key={building.buildingID}
                                    buildingID={building.buildingID}
                                    buildingName={building.buildingName}
                                    floorCount={building.floorCount}
                                    published={false}
                                />
                            ))
                        ) : (
                            <p className='col-span-3 text-center'>No saved buildings found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CanvasRoot