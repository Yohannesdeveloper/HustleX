import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./index";
import { useCallback } from "react";
import { login, register, logout, switchRole, addRole, refreshUser, checkAuth } from "./authSlice";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Auth selectors
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, loading, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      const result = await dispatch(login({ email, password }));
      if (login.fulfilled.match(result)) {
        return result.payload;
      }
      throw result.payload;
    },
    [dispatch]
  );

  const handleRegister = useCallback(
    async (userData: {
      email: string;
      password: string;
      role: "freelancer" | "client";
      roles?: string[];
      firstName?: string;
      lastName?: string;
    }) => {
      const result = await dispatch(register(userData));
      if (register.fulfilled.match(result)) {
        return result.payload;
      }
      throw result.payload;
    },
    [dispatch]
  );

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const handleSwitchRole = useCallback(
    async (role: "freelancer" | "client") => {
      const result = await dispatch(switchRole(role));
      if (switchRole.fulfilled.match(result)) {
        return result.payload;
      }
      throw result.payload;
    },
    [dispatch]
  );

  const handleAddRole = useCallback(
    async (role: "freelancer" | "client") => {
      const result = await dispatch(addRole(role));
      if (addRole.fulfilled.match(result)) {
        return result.payload;
      }
      throw result.payload;
    },
    [dispatch]
  );

  const handleRefreshUser = useCallback(async () => {
    const result = await dispatch(refreshUser());
    if (refreshUser.fulfilled.match(result)) {
      return result.payload;
    }
    throw result.payload;
  }, [dispatch]);

  const handleCheckAuth = useCallback(async () => {
    const result = await dispatch(checkAuth());
    if (checkAuth.fulfilled.match(result)) {
      return result.payload;
    }
    throw result.payload;
  }, [dispatch]);

  return {
    user,
    loading,
    isAuthenticated,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    switchRole: handleSwitchRole,
    addRole: handleAddRole,
    refreshUser: handleRefreshUser,
    checkAuth: handleCheckAuth,
  };
};
