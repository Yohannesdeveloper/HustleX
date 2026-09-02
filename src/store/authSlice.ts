import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiServiceModule from "../services/api-react-native";

// Handle both default export and named export patterns (for React Native/Metro bundler compatibility)
// Some bundlers wrap default exports, so we check both .default and the direct import
const apiService: any = (apiServiceModule as any)?.default || apiServiceModule || (apiServiceModule as any);

// Runtime check to ensure apiService is properly initialized
if (!apiService || typeof apiService.register !== 'function') {
  console.error('CRITICAL: apiService.register is not available. apiService:', apiService);
  throw new Error('API Service is not properly initialized. Methods available: ' + Object.keys(apiService || {}).join(', '));
}

interface User {
  _id: string;
  email: string;
  roles: string[];
  currentRole: string;
  role: string; // For backward compatibility
  profile?: any;
  hasCompanyProfile?: boolean; // For client profile completion check
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: true,
  isAuthenticated: false,
};

// Helper function to serialize errors for Redux
const serializeError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error?.message) {
    return error.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  return 'An error occurred';
};

// Async thunks
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      if (apiService.isAuthenticated()) {
        const currentUser = await apiService.getCurrentUser();
        return currentUser;
      }
      return null;
    } catch (error) {
      apiService.logout();
      return rejectWithValue(serializeError(error));
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      await apiService.login(email, password);
      const currentUser = await apiService.getCurrentUser();
      return currentUser;
    } catch (error) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    userData: {
      email: string;
      password: string;
      role: "freelancer" | "client" | "admin";
      roles?: string[];
      firstName?: string;
      lastName?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // Check if register method exists
      if (!apiService || typeof apiService.register !== 'function') {
        throw new Error('Registration service is not available. Please refresh the app.');
      }
      await apiService.register(userData);
      const currentUser = await apiService.getCurrentUser();
      return currentUser;
    } catch (error) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const switchRole = createAsyncThunk(
  "auth/switchRole",
  async (role: "freelancer" | "client" | "admin", { rejectWithValue }) => {
    try {
      const updatedUser = await apiService.switchRole(role);
      return updatedUser;
    } catch (error) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const addRole = createAsyncThunk(
  "auth/addRole",
  async (role: "freelancer" | "client" | "admin", { rejectWithValue }) => {
    try {
      const updatedUser = await apiService.addRole(role);
      return updatedUser;
    } catch (error) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const refreshUser = createAsyncThunk(
  "auth/refreshUser",
  async (_, { rejectWithValue }) => {
    try {
      if (apiService.isAuthenticated()) {
        const currentUser = await apiService.getCurrentUser();
        return currentUser;
      }
      return null;
    } catch (error) {
      return rejectWithValue(serializeError(error));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      apiService.logout();
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.loading = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(login.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(register.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      // Switch Role
      .addCase(switchRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(switchRole.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(switchRole.rejected, (state) => {
        state.loading = false;
      })
      // Add Role
      .addCase(addRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(addRole.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(addRole.rejected, (state) => {
        state.loading = false;
      })
      // Refresh User
      .addCase(refreshUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.loading = false;
      })
      .addCase(refreshUser.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
