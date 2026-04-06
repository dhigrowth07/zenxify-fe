import api from "./api";
import { handleApiError } from "../utils/APIErrorHandler";

/**
 * Fetch all available subscription plans
 * @returns {Promise<any>}
 */
export const getSubscriptionPlans = async () => {
    try {
        const response = await api.get("/api/billing/plans");
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Fetch all available top-up credit packs
 * @returns {Promise<any>}
 */
export const getTopUpPacks = async () => {
    try {
        const response = await api.get("/api/billing/top-ups");
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Get current user's active subscription and usage stats
 * @returns {Promise<any>}
 */
export const getMySubscription = async () => {
    try {
        // This endpoint might be under /me or /billing/my-plan
        // Based on routes.js, it could be implemented in billingController
        const response = await api.get("/api/billing/my-plan");
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

const billingServices = {
    getSubscriptionPlans,
    getTopUpPacks,
    getMySubscription
};

export default billingServices;
