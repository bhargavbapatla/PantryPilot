import { authorizedAPI } from './api';
import { userLogin, userRegister } from './paths';

interface AuthPayload {
    email: string;
    password: string;
    name?: string;
}

const userSignup = async (payload: AuthPayload) => {
    const { email, password, name } = payload;
    const response = await authorizedAPI.post(userRegister, {
        email,
        password,
        name
    });
    return {data: response.data, status: response.status};
}

const loginUser = async (payload: AuthPayload) => {
    const { email, password } = payload;
    const response = await authorizedAPI.post(userLogin, {
        email,
        password,
    });
    console.log("response",response);
    return {data: response.data.data, status: response.status}
}

export { userSignup, loginUser };
