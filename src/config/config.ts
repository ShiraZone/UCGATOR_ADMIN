import axios from 'axios';

export const url = import.meta.env.VITE_API_URL // || 'http://localhost:5500/api/v1';

export const testConnection = async () => {
    try {
        const response = await axios.get(`${url}/`);
        console.log('Server response:', response.data);
    } catch (error: any) {
        console.error('Connection failed:', error.response?.data?.error);
    }
};