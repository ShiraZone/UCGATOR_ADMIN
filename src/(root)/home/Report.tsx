import { useState, useEffect, useRef } from 'react';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import axios from 'axios';
import { useLoading } from '@/context/LoadingProvider';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faChartPie, faChartLine, faChartBar, faCalendar } from '@fortawesome/free-solid-svg-icons';

// Utility for date formatting
const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
};

// Custom colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Report = () => {
    const authHeader = useAuthHeader();
    const { setLoading } = useLoading();
    const url = import.meta.env.VITE_API_URL;
    const chartRef = useRef<HTMLDivElement>(null);

    // Report configuration state
    const [reportType, setReportType] = useState<string>('users');
    const [dateRange, setDateRange] = useState<{ start: string, end: string }>({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    // Data state
    const [userStats, setUserStats] = useState<any>(null);
    const [locationStats, setLocationStats] = useState<any>(null);
    const [contributionStats, setContributionStats] = useState<any>(null);
    const [searchTrends, setSearchTrends] = useState<any[]>([]);
    const [monthlyGrowth, setMonthlyGrowth] = useState<any[]>([]);

    // Fetch data based on report type
    useEffect(() => {
        const fetchReportData = async () => {
            try {
                switch (reportType) {
                    case 'users':
                        // Fetch user statistics
                        const userStatsRes = await axios.get(`${url}/dashboard/users/stats`, {
                            headers: { Authorization: authHeader }
                        });
                        setUserStats(userStatsRes.data.data);

                        // Fetch verification status
                        const verificationRes = await axios.get(`${url}/dashboard/users/verification-status`, {
                            headers: { Authorization: authHeader }
                        });
                        if (verificationRes.data.data) {
                            setUserStats((prev: any) => ({ ...prev, verification: verificationRes.data.data }));
                        }
                        break;

                    case 'locations':
                        // Fetch top searched locations
                        const topSearchesRes = await axios.get(`${url}/dashboard/locations/top-searches?limit=10`, {
                            headers: { Authorization: authHeader }
                        });

                        // Fetch POI type statistics
                        const poiStatsRes = await axios.get(`${url}/dashboard/locations/poi-types`, {
                            headers: { Authorization: authHeader }
                        });

                        // Fetch most saved locations
                        const mostSavedRes = await axios.get(`${url}/dashboard/locations/most-saved?limit=10`, {
                            headers: { Authorization: authHeader }
                        });

                        // Fetch search trends
                        const searchTrendsRes = await axios.get(`${url}/dashboard/locations/search-trends`, {
                            headers: { Authorization: authHeader },
                            params: {
                                startDate: dateRange.start,
                                endDate: dateRange.end
                            }
                        });

                        setLocationStats({
                            topSearches: topSearchesRes.data.data || [],
                            poiStats: poiStatsRes.data.data || { byType: [] },
                            mostSaved: mostSavedRes.data.data || [],
                        });

                        setSearchTrends(searchTrendsRes.data.data || []);
                        break;

                    case 'contributions':
                        // Fetch contribution statistics
                        const contributionStatsRes = await axios.get(`${url}/dashboard/contributions/stats`, {
                            headers: { Authorization: authHeader }
                        });

                        // Fetch top contributors
                        const topContributorsRes = await axios.get(`${url}/dashboard/contributions/top-contributors`, {
                            headers: { Authorization: authHeader }
                        });

                        // Fetch contribution trends
                        const contributionTrendsRes = await axios.get(`${url}/dashboard/contributions/trends`, {
                            headers: { Authorization: authHeader },
                            params: {
                                startDate: dateRange.start,
                                endDate: dateRange.end
                            }
                        });

                        // Fetch location engagement
                        const locationEngagementRes = await axios.get(`${url}/dashboard/contributions/location-engagement`, {
                            headers: { Authorization: authHeader }
                        });

                        // Fetch monthly growth statistics
                        const monthlyGrowthRes = await axios.get(`${url}/dashboard/contributions/monthly-growth`, {
                            headers: { Authorization: authHeader }
                        });

                        setContributionStats({
                            stats: contributionStatsRes.data.data || {},
                            topContributors: topContributorsRes.data.data || [],
                            trends: contributionTrendsRes.data.data || [],
                            locationEngagement: locationEngagementRes.data.data || []
                        });

                        setMonthlyGrowth(monthlyGrowthRes.data.data || []);
                        break;
                }
            } catch (error) {
                console.error("Error fetching report data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, [reportType, dateRange, url, authHeader, setLoading]);
    // Export report as CSV
    const exportToCSV = () => {
        let csvContent = 'data:text/csv;charset=utf-8,';

        // Prepare data based on report type
        switch (reportType) {
            case 'users':
                if (!userStats) return;

                // Header
                csvContent += 'User Type,Status,Count\n';

                // System users data
                csvContent += `System Users,Active,${userStats.systemUsers.active}\n`;
                csvContent += `System Users,Suspended,${userStats.systemUsers.suspended}\n`;
                csvContent += `System Users,Inactive,${userStats.systemUsers.inactive}\n`;

                // Admin users data
                csvContent += `Admin Users,Active,${userStats.adminUsers.active}\n`;
                csvContent += `Admin Users,Suspended,${userStats.adminUsers.suspended}\n`;

                // Verification data
                if (userStats.verification) {
                    csvContent += '\nVerification Status,Count\n';
                    csvContent += `Verified,${userStats.verification.verified}\n`;
                    csvContent += `Unverified,${userStats.verification.unverified}\n`;
                }
                break;

            case 'locations':
                if (!locationStats) return;

                // Top searches
                if (locationStats.topSearches && locationStats.topSearches.length > 0) {
                    csvContent += 'Top Searched Locations\n';
                    csvContent += 'Location,Search Count\n';

                    locationStats.topSearches.forEach((item: any) => {
                        const name = item.query || item.location || 'Unknown';
                        csvContent += `${name},${item.count}\n`;
                    });

                    csvContent += '\n';
                }

                // POI by type
                if (locationStats.poiStats && locationStats.poiStats.byType) {
                    csvContent += 'POI by Type\n';
                    csvContent += 'Type,Count\n';

                    locationStats.poiStats.byType.forEach((item: any) => {
                        csvContent += `${item.type},${item.count}\n`;
                    });

                    csvContent += '\n';
                }

                // Most saved locations
                if (locationStats.mostSaved && locationStats.mostSaved.length > 0) {
                    csvContent += 'Most Saved Locations\n';
                    csvContent += 'Location,Save Count\n';

                    locationStats.mostSaved.forEach((item: any) => {
                        const name = item.name || 'Unknown';
                        csvContent += `${name},${item.count}\n`;
                    });
                }
                break;

            case 'contributions':
                if (!contributionStats) return;

                // Top contributors
                if (contributionStats.topContributors && contributionStats.topContributors.length > 0) {
                    csvContent += 'Top Contributors\n';
                    csvContent += 'Name,Role,Contribution Count\n';

                    contributionStats.topContributors.forEach((item: any) => {
                        csvContent += `${item.name},${item.role},${item.count}\n`;
                    });

                    csvContent += '\n';
                }

                // Location engagement
                if (contributionStats.locationEngagement && contributionStats.locationEngagement.length > 0) {
                    csvContent += 'Location Engagement\n';
                    csvContent += 'Location,Engagement Count\n';

                    contributionStats.locationEngagement.forEach((item: any) => {
                        csvContent += `${item.location},${item.count}\n`;
                    });
                }
                break;
        }

        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${reportType}_report_${formatDate(new Date())}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Export chart as PNG
    const exportChartAsPNG = () => {
        if (!chartRef.current) return;

        // Use html2canvas (imported in Dashboard.tsx)
        // @ts-ignore
        html2canvas(chartRef.current).then((canvas: any) => {
            const link = document.createElement('a');
            link.download = `${reportType}_chart_${formatDate(new Date())}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    };

    // Render different report content based on selected type
    const renderReportContent = () => {
        switch (reportType) {
            case 'users':
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">User Statistics Report</h2>

                        {userStats ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* User Status Chart */}
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h3 className="text-lg font-bold text-gray-700 mb-4">User Status Distribution</h3>
                                    <div className="h-80" ref={chartRef}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={[
                                                    { name: 'Active', system: userStats.systemUsers.active, admin: userStats.adminUsers.active },
                                                    { name: 'Suspended', system: userStats.systemUsers.suspended, admin: userStats.adminUsers.suspended },
                                                    { name: 'Inactive', system: userStats.systemUsers.inactive, admin: 0 }
                                                ]}
                                                barSize={30}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="system" name="System Users" fill="#0088FE" />
                                                <Bar dataKey="admin" name="Admin Users" fill="#00C49F" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Verification Status Chart */}
                                {userStats.verification && (
                                    <div className="bg-white rounded-lg shadow-md p-6">
                                        <h3 className="text-lg font-bold text-gray-700 mb-4">User Verification Status</h3>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Verified', value: userStats.verification.verified },
                                                            { name: 'Unverified', value: userStats.verification.unverified }
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        <Cell fill="#0088FE" />
                                                        <Cell fill="#00C49F" />
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}

                                {/* Table view of data */}
                                <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                                    <h3 className="text-lg font-bold text-gray-700 mb-4">User Data Table</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                                <tr>
                                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Type</th>
                                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" rowSpan={3}>System Users</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Active</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{userStats.systemUsers.active}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Suspended</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{userStats.systemUsers.suspended}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Inactive</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{userStats.systemUsers.inactive}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" rowSpan={2}>Admin Users</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Active</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{userStats.adminUsers.active}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Suspended</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{userStats.adminUsers.suspended}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64">
                                <p className="text-gray-500">Loading user statistics...</p>
                            </div>
                        )}
                    </div>
                );

            case 'locations':
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Location Statistics Report</h2>

                        {locationStats ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Top Searched Locations */}
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h3 className="text-lg font-bold text-gray-700 mb-4">Top Searched Locations</h3>
                                    <div className="h-80" ref={chartRef}>
                                        {locationStats.topSearches && locationStats.topSearches.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    layout="vertical"
                                                    data={locationStats.topSearches.map((item: any) => ({
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
                                            <div className="flex items-center justify-center h-full">
                                                <p className="text-gray-500">No search data available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* POI by Type */}
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h3 className="text-lg font-bold text-gray-700 mb-4">POI by Type</h3>
                                    <div className="h-80">
                                        {locationStats.poiStats && locationStats.poiStats.byType && locationStats.poiStats.byType.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={locationStats.poiStats.byType}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ type, percent }) =>
                                                            `${type}: ${(percent * 100).toFixed(0)}%`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="count"
                                                        nameKey="type"
                                                    >
                                                        {locationStats.poiStats.byType.map((_: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <p className="text-gray-500">No POI data available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Search Trends Over Time */}
                                <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                                    <h3 className="text-lg font-bold text-gray-700 mb-4">Search Trends Over Time</h3>
                                    <div className="h-80">
                                        {searchTrends && searchTrends.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={searchTrends}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="count" name="Search Count" stroke="#8884d8" activeDot={{ r: 8 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <p className="text-gray-500">No search trend data available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Most Saved Locations Table */}
                                <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                                    <h3 className="text-lg font-bold text-gray-700 mb-4">Most Saved Locations</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                                <tr>
                                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Building</th>
                                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Save Count</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {locationStats.mostSaved && locationStats.mostSaved.length > 0 ? (
                                                    locationStats.mostSaved.map((item: any, index: number) => (
                                                        <tr key={index}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name || 'Unknown'}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.building || 'N/A'}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.floor || 'N/A'}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.count}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center" colSpan={4}>
                                                            No data available
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64">
                                <p className="text-gray-500">Loading location statistics...</p>
                            </div>
                        )}
                    </div>
                );

            case 'contributions':
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Contributions Report</h2>

                        {contributionStats ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Top Contributors Chart */}
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h3 className="text-lg font-bold text-gray-700 mb-4">Top Contributors</h3>
                                    <div className="h-80" ref={chartRef}>
                                        {contributionStats.topContributors && contributionStats.topContributors.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={contributionStats.topContributors.map((item: any) => ({
                                                        name: item.name,
                                                        count: item.count
                                                    }))}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="count" name="Contribution Count" fill="#8884d8" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <p className="text-gray-500">No contributor data available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Location Engagement */}
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h3 className="text-lg font-bold text-gray-700 mb-4">Location Engagement</h3>
                                    <div className="h-80">
                                        {contributionStats.locationEngagement && contributionStats.locationEngagement.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    layout="vertical"
                                                    data={contributionStats.locationEngagement.map((item: any) => ({
                                                        name: item.location,
                                                        count: item.count
                                                    }))}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" />
                                                    <YAxis type="category" dataKey="name" width={150} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="count" name="Engagement Count" fill="#00C49F" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <p className="text-gray-500">No location engagement data available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Contribution Trends */}
                                <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                                    <h3 className="text-lg font-bold text-gray-700 mb-4">Contribution Trends</h3>
                                    <div className="h-80">
                                        {contributionStats.trends && contributionStats.trends.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={contributionStats.trends}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="count" name="Contribution Count" stroke="#8884d8" activeDot={{ r: 8 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <p className="text-gray-500">No contribution trend data available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Monthly Growth Chart */}
                                <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                                    <h3 className="text-lg font-bold text-gray-700 mb-4">Monthly Growth</h3>
                                    <div className="h-80">
                                        {monthlyGrowth && monthlyGrowth.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={monthlyGrowth}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="month" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="users" name="User Growth" stroke="#0088FE" />
                                                    <Line type="monotone" dataKey="contributions" name="Contribution Growth" stroke="#00C49F" />
                                                    <Line type="monotone" dataKey="searches" name="Search Growth" stroke="#FFBB28" />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <p className="text-gray-500">No growth data available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64">
                                <p className="text-gray-500">Loading contribution statistics...</p>
                            </div>
                        )}
                    </div>
                );

            default:
                return (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-gray-500">Please select a report type</p>
                    </div>
                );
        }
    };

    return (
        <div className="w-full">
            <div className="p-6 bg-gray-50">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Reports</h1>

                {/* Report controls */}
                <div className="flex flex-wrap gap-4 mb-8 bg-white p-4 rounded-lg shadow-md">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Report Type
                        </label>
                        <div className="flex gap-2">
                            <button
                                className={`px-4 py-2 rounded-md flex items-center gap-2 ${reportType === 'users' ? 'bg-uc-blue text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                onClick={() => setReportType('users')}
                            >
                                <FontAwesomeIcon icon={faChartPie} />
                                User Statistics
                            </button>
                            <button
                                className={`px-4 py-2 rounded-md flex items-center gap-2 ${reportType === 'locations' ? 'bg-uc-blue text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                onClick={() => setReportType('locations')}
                            >
                                <FontAwesomeIcon icon={faChartBar} />
                                Locations
                            </button>
                            <button
                                className={`px-4 py-2 rounded-md flex items-center gap-2 ${reportType === 'contributions' ? 'bg-uc-blue text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                onClick={() => setReportType('contributions')}
                            >
                                <FontAwesomeIcon icon={faChartLine} />
                                Contributions
                            </button>
                        </div>
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date Range
                        </label>
                        <div className="flex gap-2 items-center">
                            <div className="flex items-center">
                                <FontAwesomeIcon icon={faCalendar} className="text-gray-400 mr-2" />
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <span className="text-gray-500">to</span>
                            <div className="flex items-center">
                                <FontAwesomeIcon icon={faCalendar} className="text-gray-400 mr-2" />
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Export Options
                        </label>
                        <div className="flex gap-2">
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center gap-2 hover:bg-green-700"
                                onClick={exportToCSV}
                            >
                                <FontAwesomeIcon icon={faDownload} />
                                Export to CSV
                            </button>
                            <button
                                className="px-4 py-2 bg-purple-600 text-white rounded-md flex items-center gap-2 hover:bg-purple-700"
                                onClick={exportChartAsPNG}
                            >
                                <FontAwesomeIcon icon={faChartBar} />
                                Export Chart
                            </button>
                        </div>
                    </div>
                </div>

                {/* Report content */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    {renderReportContent()}
                </div>
            </div>
        </div>
    );
};

export default Report;