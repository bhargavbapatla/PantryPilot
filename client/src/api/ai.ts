import { authorizedAPI } from './api';
import { ai, orders, Product } from './paths';
import type { RecipeItem } from '../store/slices/recipesSlice';

// Assuming Product maps to RecipeItem based on context
type ProductItem = RecipeItem;

export const askSousChefAi = async (query: string) => {
    try {
        const response = await authorizedAPI.post(`${ai}/ask`, { query });
        return { data: response.data.data, status: response.status, message: response.data.message || 'Sous Chef response received successfully' };

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

