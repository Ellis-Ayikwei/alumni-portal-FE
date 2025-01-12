import axios from 'axios';

// const authApiUrl = 'https://127.0.0.1/sc/api/v1';
export const authApiUrl = 'http://127.0.0.1:5004/alumni/api/v1/auth';
//const authApiUrl = 'http://172.20.10.4:5004/alumni/api/v1/auth';

export const getCookie = (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift();
        return cookieValue ? decodeURIComponent(cookieValue) : undefined;
    }
    return undefined;
};


const authAxiosInstance = axios.create({
    baseURL: authApiUrl,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

authAxiosInstance.interceptors.request.use(
    (config) => {
        const token = getCookie('_auth');
        config.headers.Authorization = token ?? '';
        config.headers['X-Refresh-Token'] = getCookie('_auth_refresh') ?? '';

        if (!config.data) {
            config.data = {
                user_id: localStorage.getItem('userId') ?? 'default_user_id',
            };
        }
        return config;
    },
    (error) => {
        return Promise.reject(new Error(error.message));
    }
);

export default authAxiosInstance;
