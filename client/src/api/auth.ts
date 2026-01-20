import { unauthorizedAPI } from './api';
import { userGoogleLogin, userLogin, userRegister } from './paths';

interface AuthPayload {
    email: string;
    password: string;
    name?: string;
}

const userSignup = async (payload: AuthPayload) => {
    const { email, password, name } = payload;
    try {
        const response = await unauthorizedAPI.post(userRegister, {
            email,
            password,
            name
        });

        console.log("Success response", response);
        return {
            success: true,
            data: response.data,
            status: response.status
        };

    } catch (error: any) {
        if (error.response) {
            console.log("Error response data:", error.response.data);
            console.log("Error status:", error.response.status);

            return {
                success: false,
                message: error.response.data.message,
                status: error.response.status
            };
        } else {
            console.error("Network Error:", error.message);
            return { success: false, status: 500, message: "Network Error" };
        }
    }
}

const loginUser = async (payload: AuthPayload) => {
    const { email, password } = payload;

    try {
        const response = await unauthorizedAPI.post(userLogin, {
            email,
            password,
        });

        console.log("Success response", response);
        return {
            success: true,
            data: response.data.data,
            status: response.status,
            message: response.data.message || 'Login successful',
        };

    } catch (error: any) {
        if (error.response) {
            console.log("Error response data:", error.response.data);
            console.log("Error status:", error.response.status);

            return {
                success: false,
                message: error.response.data.message,
                status: error.response.status
            };
        } else {
            console.error("Network Error:", error.message);
            return { success: false, status: 500, message: "Network Error" };
        }
    }
}

const googleSSOLogin = async (token: string) => {
    try {
        console.log("googleSSOLogin token", token);
        const response = await unauthorizedAPI.post(userGoogleLogin, {
            googleToken: token,
        });

        console.log("Success response", response);
        return {
            success: true,
            data: response.data.data,
            status: response.status,
            message: response.data.message || 'Google Login successful',
        };
    } catch (error: any) {
        if (error.response) {
            console.log("Error response data:", error.response.data);
            console.log("Error status:", error.response.status);

            return {
                success: false,
                message: error.response.data.message,
                status: error.response.status
            };
        } else {
            console.error("Network Error:", error.message);
            return { success: false, status: 500, message: "Network Error" };
        }
    }
}
export { userSignup, loginUser, googleSSOLogin };
