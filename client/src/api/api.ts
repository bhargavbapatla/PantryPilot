import axios from "axios";

export const baseURL: string =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const authorizedAPI = axios.create({
    baseURL,
})

authorizedAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// This is for un authorized routes
const unauthorizedAPI = axios.create({
    baseURL,
})

export { authorizedAPI, unauthorizedAPI };

