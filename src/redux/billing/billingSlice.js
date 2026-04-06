import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSubscriptionPlans, getTopUpPacks, getMySubscription } from '../../services/billingServices';

/**
 * Thunk to fetch all available subscription plans
 */
export const fetchPlansAsync = createAsyncThunk(
    'billing/fetchPlans',
    async (_, { rejectWithValue }) => {
        const response = await getSubscriptionPlans();
        if (response.status === 'success') return response.data;
        return rejectWithValue(response.message || 'Failed to fetch plans');
    }
);

/**
 * Thunk to fetch all available top-up credit packs
 */
export const fetchTopUpsAsync = createAsyncThunk(
    'billing/fetchTopUps',
    async (_, { rejectWithValue }) => {
        const response = await getTopUpPacks();
        if (response.status === 'success') return response.data;
        return rejectWithValue(response.message || 'Failed to fetch top-up packs');
    }
);

/**
 * Thunk to fetch current user's subscription and credit info
 */
export const fetchMySubscriptionAsync = createAsyncThunk(
    'billing/fetchMySubscription',
    async (_, { rejectWithValue }) => {
        const response = await getMySubscription();
        if (response.status === 'success') return response.data;
        return rejectWithValue(response.message || 'Failed to fetch your subscription');
    }
);

const initialState = {
    plans: [],
    topUps: [],
    /** @type {any} */
    mySubscription: {
        credits: {
            monthly: 0,
            purchased: 0,
            total: 0,
            next_reset: null
        },
        plan: {
            slug: 'free',
            started_at: null,
            expires_at: null,
            details: null
        },
        subscription_status: 'inactive'
    },
    isLoading: false,
    /** @type {string | null} */
    error: null,
    isInitialized: false,
};

const billingSlice = createSlice({
    name: 'billing',
    initialState,
    reducers: {
        resetBillingState: () => initialState,
        clearBillingError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Plans
            .addCase(fetchPlansAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPlansAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.plans = action.payload;
            })
            .addCase(fetchPlansAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = /** @type {any} */(action.payload);
            })

            // Top-Ups
            .addCase(fetchTopUpsAsync.fulfilled, (state, action) => {
                state.topUps = action.payload;
            })

            // My Subscription
            .addCase(fetchMySubscriptionAsync.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchMySubscriptionAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.mySubscription = /** @type {any} */(action.payload);
                state.isInitialized = true;
            })
            .addCase(fetchMySubscriptionAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = /** @type {any} */(action.payload);
            });
    }
});

export const { resetBillingState, clearBillingError } = billingSlice.actions;

// Selectors
/** @param {{billing: typeof initialState}} state */
export const selectAllPlans = (state) => state.billing.plans;
/** @param {{billing: typeof initialState}} state */
export const selectTopUps = (state) => state.billing.topUps;
/** @param {{billing: typeof initialState}} state */
export const selectUserSubscription = (state) => state.billing.mySubscription;
/** @param {{billing: typeof initialState}} state */
export const selectBillingLoading = (state) => state.billing.isLoading;
/** @param {{billing: typeof initialState}} state */
export const selectBillingError = (state) => state.billing.error;

export default billingSlice.reducer;
