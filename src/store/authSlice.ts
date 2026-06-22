import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiService from "../services/api";
import { clearPersistedActiveRole, persistActiveRole, readPersistedActiveRole, ActiveRole } from "../utils/activeRole";

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
  loading: false,
  isAuthenticated: false,
};

// Helper to check and sync persisted role
const syncPersistedRole = async (user: User): Promise<User> => {
  try {
    // Admin accounts should not be switched to a non-admin persisted role
    if (user.roles.includes("admin")) {
      return user;
    }

    const persistedRole = readPersistedActiveRole();
    if (
      persistedRole &&
      user.roles.includes(persistedRole) &&
      user.currentRole !== persistedRole &&
      // Don't try to switch to admin via API (since API doesn't support it)
      persistedRole !== "admin"
    ) {
      // Switch to persisted role
      return await apiService.switchRole(persistedRole as "freelancer" | "client");
    }
  } catch (error) {
    console.error("Failed to sync persisted role, using current role:", error);
  }
  return user;
};

// Async thunks
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      if (apiService.isAuthenticated()) {
        apiService.clearUserCache(); // Clear cache to get fresh user
        // Add a timeout to the auth check
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Auth check timeout")), 5000)
        );

        const userPromise = apiService.getCurrentUser();
        let currentUser = await Promise.race([userPromise, timeoutPromise]) as any;
        currentUser = await syncPersistedRole(currentUser);
        return currentUser;
      }
      return null;
    } catch (error: any) {
      console.error("Auth check failed:", error);
      apiService.logout();
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
      apiService.clearUserCache(); // Clear cache to get fresh user
      let currentUser = await apiService.getCurrentUser();
      currentUser = await syncPersistedRole(currentUser);
      return currentUser;
    } catch (error: any) {
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
      password?: string;
      role?: "freelancer" | "client";
      roles?: string[];
      firstName?: string;
      lastName?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await apiService.register(userData);
      let currentUser = await apiService.getCurrentUser();
      // Only persist role if one was provided during registration
      if (userData.role) {
        persistActiveRole(userData.role);
      }
      return currentUser;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Registration failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const selectRole = createAsyncThunk(
  "auth/selectRole",
  async (role: "freelancer" | "client" | "admin", { rejectWithValue }) => {
    try {
      const response = await apiService.selectRole(role);
      let currentUser = await apiService.getCurrentUser();
      persistActiveRole(role);
      return currentUser;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to set role";
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
        apiService.clearUserCache(); // Clear cache to get fresh user
        let currentUser = await apiService.getCurrentUser();
        currentUser = await syncPersistedRole(currentUser);
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
      clearPersistedActiveRole();
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      if (action.payload?.roles?.includes("admin")) {
        persistActiveRole("admin");
      } else if (action.payload?.currentRole) {
        persistActiveRole(action.payload.currentRole as ActiveRole);
      }
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
        if (action.payload?.roles?.includes("admin")) {
          persistActiveRole("admin");
        } else if (action.payload?.currentRole) {
          persistActiveRole(action.payload.currentRole as ActiveRole);
        }
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
        if (action.payload?.roles?.includes("admin")) {
          persistActiveRole("admin");
        } else if (action.payload?.currentRole) {
          persistActiveRole(action.payload.currentRole as ActiveRole);
        }
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
        if (action.payload?.currentRole) {
          persistActiveRole(action.payload.currentRole as ActiveRole);
        }
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
      // Select Role
      .addCase(selectRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(selectRole.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(selectRole.rejected, (state) => {
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
        if (action.payload?.currentRole) {
          persistActiveRole(action.payload.currentRole as ActiveRole);
        }
      })
      .addCase(refreshUser.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { logout, setLoading, setUser } = authSlice.actions;
export default authSlice.reducer;