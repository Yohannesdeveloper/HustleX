import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiService from "../services/api";

interface User {
  _id: string;
  email: string;
  roles: string[];
  currentRole: string;
  role: string; // For backward compatibility
  profile?: any;
  hasCompanyProfile?: boolean; // For client profile completion check
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: true,
  isAuthenticated: false,
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
    } catch (error: any) {
      apiService.logout();
      // Don't reject - just return null for failed auth checks
      return null;
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
    } catch (error: any) {
      // Extract serializable error message instead of passing the whole error object
      const errorMessage = error?.response?.data?.message || error?.message || "Login failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    userData: {
      email: string;
      password: string;
      role: "freelancer" | "client";
      roles?: string[];
      firstName?: string;
      lastName?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await apiService.register(userData);
      const currentUser = await apiService.getCurrentUser();
      return currentUser;
    } catch (error: any) {
      // Extract serializable error message instead of passing the whole error object
      const errorMessage = error?.response?.data?.message || error?.message || "Registration failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const switchRole = createAsyncThunk(
  "auth/switchRole",
  async (role: "freelancer" | "client", { rejectWithValue }) => {
    try {
      const updatedUser = await apiService.switchRole(role);
      return updatedUser;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to switch role";
      return rejectWithValue(errorMessage);
    }
  }
);

export const addRole = createAsyncThunk(
  "auth/addRole",
  async (role: "freelancer" | "client", { rejectWithValue }) => {
    try {
      const updatedUser = await apiService.addRole(role);
      return updatedUser;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to add role";
      return rejectWithValue(errorMessage);
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
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to refresh user";
      return rejectWithValue(errorMessage);
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
