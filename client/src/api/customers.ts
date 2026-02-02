import { authorizedAPI } from './api';
import { customer } from './paths';
import type { RecipeItem } from '../store/slices/recipesSlice';

// Assuming Product maps to RecipeItem based on context
type ProductItem = RecipeItem;

export const getCustomers = async () => {
    try {
        const response = await authorizedAPI.get(customer);
        return { data: response.data.data, status: response.status, message: response.data.message || 'Customers fetched successfully' };

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

export const getCustomerById = async (id: string) => {
    try {
        const response = await authorizedAPI.get(`${customer}/${id}`);
        return { data: response.data.data, status: response.status, message: response.data.message || 'Customer fetched successfully' };
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
export const createCustomer = async (customer: any) => {
    try {
        const response = await authorizedAPI.post(customer, customer);
        return { data: response.data.data, status: response.status, message: response.data.message || 'Customer posted successfully' };
    } catch (error: any) {
        if (error.response) {
            console.log("Error response data:", error.response.data);
            console.log("Error status:", error.response.status);

            return {
                success: false,
                message: error.response.data?.error,
                status: error.response.status
            };
        } else {
            console.error("Network Error:", error.message);
            return { success: false, status: 500, message: "Network Error" };
        }
    }
}

export const updateCustomerById = async (customer: ProductItem, id: string) => {
    try {
        const response = await authorizedAPI.put(`${customer}/${id}`, customer);
        return { data: response.data.data, status: response.status, message: response.data.message || 'Customer updated successfully' };
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

export const deleteCustomerById = async (id: string) => {
    try {
        const response = await authorizedAPI.delete(`${customer}/${id}`);
        return { data: response.data, status: response.status, message: response.data.message || 'Customer deleted successfully'};
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
