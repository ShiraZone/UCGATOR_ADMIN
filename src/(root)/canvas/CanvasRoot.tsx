// REACT
import React from 'react'
import { FormEvent, useEffect, useState } from 'react'

// ICONS
import { faBuilding, faCircleArrowLeft, } from '@fortawesome/free-solid-svg-icons'

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
import { ToastType, useToast } from '@/context/ToastProvider'
import { useApiToasts } from '@/hooks/useApiToasts'
import { COLORS } from '@/constant/COLORS'

const CanvasHistoryComponent = ({
    buildingID,
    buildingName,
    floorCount,
    isLive
}: Building) => {
    const navigate = useNavigate();

    const handleClick = () => {
        const uri = `/campus/editor/${buildingID}?building_name=${encodeURIComponent(buildingName)}&count_floor=${floorCount}&status=${isLive}`;
        navigate(uri);
    };

    // CHANGE THIS SOONER

    return (
        <div id={buildingID} className='min-w-[300px] min-h-[150px] max-h-[200px] relative rounded-2xl border-1 p-3 cursor-pointer hover:bg-gray-200 transform transition-transform duration-300 hover:scale-105' onClick={handleClick}>
            <h3>{buildingName} - {floorCount}</h3>
            <h3>{isLive ? 'PUBLISHED' : ''}</h3>
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
    // TOAST CONTEXT
    const { showToast } = useToast();

    // Use our custom hook to initialize API toasts only once
    useApiToasts();

    const submitNameHandler = async (e: FormEvent) => {
        e.preventDefault();
        const buildinginput = document.getElementById('bldgName') as HTMLInputElement;
        const floorinput = document.getElementById('floorCnt') as HTMLInputElement;

        buildinginput.classList.remove('border', 'border-red-500');
        floorinput.classList.remove('border', 'border-red-500');

        const rawBuildingName = buildinginput.value.trim();
        const rawFloorCount = parseInt(floorinput.value.trim(), 10);

        let hasError = false;

        if (!rawBuildingName) {
            showToast('Please enter a building name.', ToastType.ERROR);
            buildinginput.classList.add('border', 'border-red-500');
            hasError = true;
        }

        if (!rawFloorCount) {
            showToast('Please enter a valid floor count.', ToastType.ERROR);
            floorinput.classList.add('border', 'border-red-500');
            hasError = true;
        }

        if (hasError) return;

        setLoading(true, 'Loading...');
        try {
            const encodedName = encodeURIComponent(rawBuildingName!);
            const { buildingID, isPublished } = await createBuildingHandler(rawBuildingName, rawFloorCount);

            const uri = `/campus/editor/${buildingID}?building_name=${encodedName}&count_floor=${rawFloorCount}&status=${isPublished}`;

            if (buildingID) {
                navigateToCanvasHandler(uri);
            }
        } catch (error: any) {
            console.error(error);
            throw error;
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
            );

            const buildingID = response.data.building._id;
            const isPublished = response.data.building.published;

            return { buildingID, isPublished };
        } catch (error: any) {
            console.error(error);
            throw error;
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
                isLive: building.isLive
            })));
        } catch (error: any) {
            console.error(error || error.response?.data?.error);
        }
    }

    const navigateToCanvasHandler = (uri: string) => {
        if (!uri) {
            console.error('URI not found.')
            return;
        }

        navigate(uri);

        const CanvasEditor = React.lazy(() => import('./CanvasEditor'));

        <React.Suspense fallback={<div>Loading...</div>}>
            <CanvasEditor />
        </React.Suspense>
    }

    const handleHistoryPush = () => {
        navigate('/')
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
                <button className="cursor-pointer absolute top-20 left-5" onClick={() => handleHistoryPush()}>
                    <FontAwesomeIcon icon={faCircleArrowLeft} color={COLORS.BLUE} className="text-2xl" />
                </button>
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
                                    isLive={building.isLive}
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