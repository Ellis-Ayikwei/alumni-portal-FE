import axios from 'axios';
import { getCookie } from './authAxiosInstance';

export const apiUrl = 'http://127.0.0.1:5004/alumni/api/v1';
//const apiUrl = 'http://172.20.10.4:5004/alumni/api/v1';

const axiosInstance = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getCookie('_auth');
        config.headers.Authorization = token || '';
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

type RefreshSubscriber = (accessToken: string) => void;

let isRefreshing = false;
let refreshSubscribers: RefreshSubscriber[] = [];

const onRefreshed = (accessToken: string): void => {
    refreshSubscribers.forEach((callback) => callback(accessToken));
    refreshSubscribers = [];
};

// axiosInstance.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         const originalRequest = error.config;

//         if (error.response?.status === 401 && !originalRequest._retry) {
//             if (isRefreshing) {
//                 return new Promise((resolve) => {
//                     refreshSubscribers.push((token) => {
//                         originalRequest.headers['Authorization'] = `Bearer ${token}`;
//                         resolve(axiosInstance(originalRequest));
//                     });
//                 });
//             }

//             originalRequest._retry = true;
//             isRefreshing = true;

//             try {
//                 const response = await axios.post(`${authApiUrl}/refresh_token`, null, {
//                     withCredentials: true,
//                 });

//                 const newAccessToken = response?.data?.accessToken;
//                 localStorage.setItem('accessToken', newAccessToken);
//                 originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
//                 onRefreshed(newAccessToken);

//                 return axiosInstance(originalRequest);
//             } catch (refreshError) {
//                 console.error('Token refresh failed. Redirecting to login...');
//                 window.location.href = '/login';
//                 return Promise.reject(refreshError);
//             } finally {
//                 isRefreshing = false;
//             }
//         }

//         console.error(`Error in ${error.config?.url}:`, error.message);
//         return Promise.reject(error);
//     }
// );

export default axiosInstance;

import useSignIn from 'react-auth-kit/hooks/useSignIn';
import authAxiosInstance from './authAxiosInstance';

export const refreshTokens = async (): Promise<{ accessToken: string; refreshToken: string }> => {
    try {
        const response = await authAxiosInstance.post('/refresh_token');
        const accessToken = response.headers['authorization']?.split(' ')[1];
        const refreshToken = response.headers['x-refresh-token'];
        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
    } catch (err) {
        throw new Error('Token refresh failed');
    }
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log('intercepting response');
        if (error.response.status === 401) {
            const signIn = useSignIn();
            try {
                console.log('refreshing token');
                const { accessToken, refreshToken } = await refreshTokens();
                signIn({
                    auth: {
                        token: accessToken,
                        type: 'Bearer',
                    },
                    refresh: refreshToken,
                });

                // Retry the original request
                error.config.headers['Authorization'] = `Bearer ${accessToken}`;
                const retryResponse = await authAxiosInstance.request(error.config);
                return retryResponse;
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
