import { authorizedAPI } from './api';

export const testingDataGet = async() => {
    const response = await authorizedAPI.get('/user/test');
    return response.data;
}