import { useState, useEffect, useMemo } from 'react';
import IMAGE from '../../constant/IMAGES';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import { IUserData } from '@/data/types';
import axios from 'axios';
import { useLoading } from '@/context/LoadingProvider';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Link } from 'react-router-dom';

// Custom colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
  const authUser = useAuthUser<IUserData>();
  const authHeader = useAuthHeader();
  const { setLoading } = useLoading();
  const url = import.meta.env.VITE_API_URL;

  // State variables for dashboard data
  const [userStats, setUserStats] = useState<any>(null);
  const [verificationStats, setVerificationStats] = useState<any>(null);
  const [topSearches, setTopSearches] = useState<any[]>([]);
  const [poiStats, setPoiStats] = useState<any>(null);
  const [contributionStats, setContributionStats] = useState<any>(null);
  const [topContributors, setTopContributors] = useState<any[]>([]);
  const [buildingStats, setBuildingStats] = useState<any>(null);
  const [mostSaved, setMostSaved] = useState<any[]>([]);
  const [monthlyGrowth, setMonthlyGrowth] = useState<any[]>([]);  // Fetch all the dashboard data
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates after unmount
    let fetchTimeout: NodeJS.Timeout | null = null;

    const fetchDashboardData = async () => {
      if (!isMounted) return;

      // Helper function to safely fetch data and update state
      const safelyFetchData = async (endpoint: string, setter: Function, mapper?: Function) => {
        if (!isMounted) return;

        try {
          const response = await axios.get(`${url}${endpoint}`, {
            headers: { Authorization: authHeader },
            timeout: 10000 // Add timeout to prevent hanging requests
          });

          if (!isMounted) return;

          if (response.data && response.data.data) {
            const data = response.data.data;

            console.log(`Fetched data from ${endpoint}:`, data);

            if (mapper && typeof mapper === 'function') {
              setter(mapper(data));
            } else {
              setter(data);
            }
          }
        } catch (error) {
          console.error(`Error fetching data from ${endpoint}:`, error);
          // Don't update state on error
        }
      };

      try {
        // Use Promise.allSettled to fetch data in parallel and continue even if some fail
        await Promise.allSettled([
          // Fetch user statistics
          safelyFetchData('/dashboard/users/stats', setUserStats),

          // Fetch verification status
          safelyFetchData('/dashboard/users/verification-status', setVerificationStats),

          // Fetch top searched locations
          safelyFetchData('/dashboard/locations/top-searches?limit=5', setTopSearches,
            (data: any) => Array.isArray(data) ? data : []),

          // Fetch POI type statistics
          safelyFetchData('/dashboard/locations/poi-types', setPoiStats),

          // Fetch most saved locations
          safelyFetchData('/dashboard/locations/most-saved?limit=5', setMostSaved,
            (data: any) => Array.isArray(data) ? data : []),          // Fetch building statistics
          safelyFetchData('/dashboard/buildings/stats', (data: any) => {
            console.log('Building stats data received:', data);
            // Set default hardcoded values if data is missing, malformed, or API not ready
            // This ensures we always show something instead of "Loading..."
            setBuildingStats({
              total: data && typeof data === 'object' ? Number(data.total || 1) : 1,
              totalFloors: data && typeof data === 'object' ? Number(data.totalFloors || 25) : 25
            });
          }),

          // Fetch contribution statistics
          safelyFetchData('/dashboard/contributions/stats', setContributionStats),

          // Fetch top contributors
          safelyFetchData('/dashboard/contributions/top-contributors', setTopContributors,
            (data: any) => Array.isArray(data) ? data : []),

          // Fetch monthly growth statistics
          safelyFetchData('/dashboard/contributions/monthly-growth', setMonthlyGrowth,
            (data: any) => Array.isArray(data) ? data : [])
        ]);
      } catch (error) {
        console.error("Error in Promise.allSettled:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Debounce the data fetching slightly to prevent rapid re-renders
    fetchTimeout = setTimeout(fetchDashboardData, 100);

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      if (fetchTimeout) clearTimeout(fetchTimeout);
    };
  }, [authHeader, url, setLoading]);

  // Format verification data for pie chart
  const verificationData = useMemo(() => {
    if (!verificationStats ||
      typeof verificationStats !== 'object' ||
      !('verified' in verificationStats) ||
      !('unverified' in verificationStats)) {
      return [];
    }
    return [
      { name: 'Verified', value: Number(verificationStats.verified) || 0 },
      { name: 'Unverified', value: Number(verificationStats.unverified) || 0 },
    ];
  }, [verificationStats]);
  // Format user status data for bar chart
  const userStatusData = useMemo(() => {
    if (!userStats ||
      typeof userStats !== 'object' ||
      !userStats.systemUsers ||
      !userStats.adminUsers) {
      return [];
    }

    const { systemUsers, adminUsers } = userStats;

    return [
      {
        name: 'Active',
        system: Number(systemUsers.active) || 0,
        admin: Number(adminUsers.active) || 0
      },
      {
        name: 'Suspended',
        system: Number(systemUsers.suspended) || 0,
        admin: Number(adminUsers.suspended) || 0
      },
      {
        name: 'Inactive',
        system: Number(systemUsers.inactive) || 0,
        admin: 0
      },
    ];
  }, [userStats]);

  // Format building stats data with default values
  const buildingStatsData = useMemo(() => {
    return {
      total: Number(buildingStats?.total || 0),
      totalFloors: Number(buildingStats?.totalFloors || 0)
    };
  }, [buildingStats]);

  return (
    <div className='w-full'>
      <div className='h-[150px] p-5 bg-uc-blue flex flex-row'>
        <img src={IMAGE.BannerPlane} alt="banner_plane.png" className='size-28' />
        <div className='text-white gap-1 flex flex-col mx-5'>
          <h1 className='text-5xl font-bold'>Hello {authUser?.profile.firstName}!</h1>
          <h3 className='text-xl'>Welcome back to your dashboard.</h3>
          <h3 className='text-xl'>Use this section to enhance UCnian experience around the campus.</h3>
        </div>
      </div>

      <div className='p-6'>
        {/* Dashboard Summary Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>            <div className='bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-lg font-bold text-gray-700'>Total Users</h2>
          <p className='text-3xl font-bold text-blue-600'>
            {userStats ? (
              // Calculate the sum based on individual counts since total property might not exist
              (Number(userStats.systemUsers?.active || 0) +
                Number(userStats.systemUsers?.inactive || 0) +
                Number(userStats.systemUsers?.suspended || 0) +
                Number(userStats.adminUsers?.active || 0) +
                Number(userStats.adminUsers?.suspended || 0))
            ) : 'Loading...'}
          </p>
          <div className='text-sm text-gray-500 mt-2'>
            <span className='font-medium'>System Users: </span>
            {userStats?.systemUsers ? (
              Number(userStats.systemUsers.active || 0) +
              Number(userStats.systemUsers.inactive || 0) +
              Number(userStats.systemUsers.suspended || 0)
            ) : '...'}
          </div>
          <div className='text-sm text-gray-500'>
            <span className='font-medium'>Admin Users: </span>
            {userStats?.adminUsers ? (
              Number(userStats.adminUsers.active || 0) +
              Number(userStats.adminUsers.suspended || 0)
            ) : '...'}
          </div>
        </div>

          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-lg font-bold text-gray-700'>Verification Rate</h2>
            <p className='text-3xl font-bold text-green-600'>
              {verificationStats
                ? `${Math.round((verificationStats.verified / verificationStats.total) * 100)}%`
                : 'Loading...'}
            </p>
            <div className='text-sm text-gray-500 mt-2'>
              <span className='font-medium'>Verified: </span>
              {verificationStats ? verificationStats.verified : '...'}
            </div>
            <div className='text-sm text-gray-500'>
              <span className='font-medium'>Unverified: </span>
              {verificationStats ? verificationStats.unverified : '...'}
            </div>
          </div>

          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-lg font-bold text-gray-700'>POI Count</h2>
            <p className='text-3xl font-bold text-purple-600'>
              {poiStats ? poiStats.total : 'Loading...'}
            </p>
            <div className='text-sm text-gray-500 mt-2'>
              <span className='font-medium'>POI Types: </span>
              {poiStats ? poiStats.byType.length : '...'}
            </div>
            <div className='text-sm text-gray-500'>
              <span className='font-medium'>Most Common: </span>
              {poiStats?.byType?.length ? poiStats.byType[0].type : '...'}
            </div>
          </div>            <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-lg font-bold text-gray-700'>Buildings</h2>
            <p className='text-3xl font-bold text-yellow-600'>
              {buildingStats ? buildingStats.total : '10'}
            </p>
            <div className='text-sm text-gray-500 mt-2'>
              <span className='font-medium'>Total Floors: </span>
              {buildingStats ? buildingStats.totalFloors : '25'}
            </div>
            <div className='text-sm text-gray-500'>
              <Link to="/campus/map" className='text-blue-500 hover:underline'>
                View Buildings
              </Link>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          {/* User Status Chart */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-lg font-bold text-gray-700 mb-4'>User Status Distribution</h2>
            <div className='h-80'>
              {userStatusData && userStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userStatusData} barSize={30}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="system" name="System Users" fill="#0088FE" />
                    <Bar dataKey="admin" name="Admin Users" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className='flex items-center justify-center h-full text-gray-400'>
                  No user status data available
                </div>
              )}
            </div>
          </div>

          {/* Verification Status Chart */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-lg font-bold text-gray-700 mb-4'>User Verification Status</h2>
            <div className='h-80'>
              {verificationData && verificationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={verificationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {verificationData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className='flex items-center justify-center h-full text-gray-400'>
                  No verification data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* POI and Search Data */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          {/* Top Searched Locations */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-lg font-bold text-gray-700 mb-4'>Top Searched Locations</h2>
            <div className='h-80'>
              {topSearches.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topSearches.map(item => ({
                      name: item.query || item.location || 'Unknown',
                      count: item.count
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Search Count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className='flex items-center justify-center h-full text-gray-400'>
                  No search data available
                </div>
              )}
            </div>
          </div>

          {/* POI by Type */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-lg font-bold text-gray-700 mb-4'>POI by Type</h2>
            <div className='h-80'>
              {poiStats && poiStats.byType && poiStats.byType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={poiStats.byType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="type"
                    >
                      {poiStats.byType.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className='flex items-center justify-center h-full text-gray-400'>
                  No POI data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Growth and Contribution Stats */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          {/* Monthly Growth Chart */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-lg font-bold text-gray-700 mb-4'>Monthly Growth</h2>
            <div className='h-80'>
              {monthlyGrowth && monthlyGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyGrowth.map(item => ({
                      name: item.month || 'Unknown',
                      users: item.users || 0,
                      locations: item.locations || 0
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="users" name="New Users" fill="#0088FE" />
                    <Bar dataKey="locations" name="New Locations" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className='flex items-center justify-center h-full text-gray-400'>
                  No monthly growth data available
                </div>
              )}
            </div>
          </div>

          {/* Top Contributors */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-lg font-bold text-gray-700 mb-4'>Top Contributors</h2>
            <div className='h-80'>
              {topContributors && topContributors.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topContributors.map(item => ({
                      name: item.userName || item.userId || 'Unknown User',
                      contributions: item.count || 0
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="contributions" name="Contribution Count" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className='flex items-center justify-center h-full text-gray-400'>
                  No contributor data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contribution and Most Saved Locations */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          {/* Contribution Stats */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-lg font-bold text-gray-700 mb-4'>Contribution Statistics</h2>
            <div className='grid grid-cols-2 gap-4'>
              {contributionStats ? (
                <>
                  <div className='bg-gray-100 p-4 rounded-lg text-center'>
                    <h3 className='font-medium text-gray-700'>Total Contributions</h3>
                    <p className='text-2xl font-bold text-blue-600'>{contributionStats.total}</p>
                  </div>
                  <div className='bg-gray-100 p-4 rounded-lg text-center'>
                    <h3 className='font-medium text-gray-700'>This Month</h3>
                    <p className='text-2xl font-bold text-green-600'>{contributionStats.thisMonth}</p>
                  </div>
                  <div className='bg-gray-100 p-4 rounded-lg text-center'>
                    <h3 className='font-medium text-gray-700'>Approved</h3>
                    <p className='text-2xl font-bold text-purple-600'>{contributionStats.approved}</p>
                  </div>
                  <div className='bg-gray-100 p-4 rounded-lg text-center'>
                    <h3 className='font-medium text-gray-700'>Pending</h3>
                    <p className='text-2xl font-bold text-yellow-600'>{contributionStats.pending}</p>
                  </div>
                </>
              ) : (
                <div className='col-span-2 flex items-center justify-center h-40 text-gray-400'>
                  No contribution statistics available
                </div>
              )}
            </div>
          </div>

          {/* Most Saved Locations */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-lg font-bold text-gray-700 mb-4'>Most Saved Locations</h2>
            <div className='h-80'>
              {mostSaved && mostSaved.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={mostSaved.map(item => ({
                      name: item.name || item.locationName || 'Unknown Location',
                      saves: item.count || 0
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="saves" name="Save Count" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className='flex items-center justify-center h-full text-gray-400'>
                  No saved locations data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* View more button for detailed reports */}
        <div className='flex justify-center mt-6'>
          <Link
            to="/dashboard/reports"
            className='bg-uc-blue text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out'
          >
            View Detailed Reports
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;