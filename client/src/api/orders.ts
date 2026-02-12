import { authorizedAPI } from './api';
import { orders, Product } from './paths';
import type { RecipeItem } from '../store/slices/recipesSlice';

// Assuming Product maps to RecipeItem based on context
type ProductItem = RecipeItem;

export const getOrders = async () => {
    try {
        const response = await authorizedAPI.get(orders);
        return { data: response.data.data, status: response.status, message: response.data.message || 'Orders fetched successfully' };

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

export const getOrderById = async (id: string) => {
    try {
        const response = await authorizedAPI.get(`${orders}/${id}`);
        return { data: response.data.data, status: response.status, message: response.data.message || 'Order fetched successfully' };
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
export const createOrder = async (order: any) => {
    try {
        const response = await authorizedAPI.post(orders, order);
        return { data: response.data.data, status: response.status, message: response.data.message || 'Order posted successfully' };
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

export const updateOrderById = async (order: ProductItem, id: string) => {
    try {
        const response = await authorizedAPI.put(`${orders}/${id}`, order);
        return { data: response.data.data, status: response.status, message: response.data.message || 'Order updated successfully' };
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

export const deleteOrderById = async (id: string) => {
    try {
        const response = await authorizedAPI.delete(`${orders}/${id}`);
        return { data: response.data, status: response.status, message: response.data.message || 'Order deleted successfully'};
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
