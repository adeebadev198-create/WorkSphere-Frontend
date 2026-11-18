// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('worksphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('worksphere_token'));
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    const saved = localStorage.getItem('worksphere_active_workspace');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Initialize or fetch current user & workspaces on load
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res?.data) {
            setUser(res.data.user);
            localStorage.setItem('worksphere_user', JSON.stringify(res.data.user));

            const wList = res.data.workspaces || [];
            setWorkspaces(wList);

            if (wList.length > 0) {
              // If active workspace is not set or not in current list, set first
              const currentActive = localStorage.getItem('worksphere_active_workspace');
              const parsedCurrent = currentActive ? JSON.parse(currentActive) : null;
              const exists = parsedCurrent && wList.some((w) => (w._id || w.id) === (parsedCurrent._id || parsedCurrent.id));

              if (!exists) {
                setActiveWorkspace(wList[0]);
                localStorage.setItem('worksphere_active_workspace', JSON.stringify(wList[0]));
              }
            }
          }
        } catch (err) {
          console.error('Failed to load profile:', err.message);
          // Token might be invalid or expired
          if (err.message.includes('authorized') || err.message.includes('expired')) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res?.data) {
      const { user: userData, token: userToken, workspaces: wsList } = res.data;
      setUser(userData);
      setToken(userToken);
      localStorage.setItem('worksphere_token', userToken);
      localStorage.setItem('worksphere_user', JSON.stringify(userData));

      if (wsList && wsList.length > 0) {
        setWorkspaces(wsList);
        setActiveWorkspace(wsList[0]);
        localStorage.setItem('worksphere_active_workspace', JSON.stringify(wsList[0]));
      }

      return res.data;
    }
  };

  const register = async (fullName, email, password, confirmPassword) => {
    const res = await api.post('/auth/register', {
      fullName,
      email,
      password,
      confirmPassword,
    });
    if (res?.data) {
      const { user: userData, token: userToken, workspace: newWorkspace } = res.data;
      setUser(userData);
      setToken(userToken);
      localStorage.setItem('worksphere_token', userToken);
      localStorage.setItem('worksphere_user', JSON.stringify(userData));

      if (newWorkspace) {
        setWorkspaces([newWorkspace]);
        setActiveWorkspace(newWorkspace);
        localStorage.setItem('worksphere_active_workspace', JSON.stringify(newWorkspace));
      }

      return res.data;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setWorkspaces([]);
    setActiveWorkspace(null);
    localStorage.removeItem('worksphere_token');
    localStorage.removeItem('worksphere_user');
    localStorage.removeItem('worksphere_active_workspace');
  };

  const switchWorkspace = (workspace) => {
    setActiveWorkspace(workspace);
    localStorage.setItem('worksphere_active_workspace', JSON.stringify(workspace));
    // Trigger page re-render / reload or event
    window.location.reload();
  };

  const refreshUserData = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      if (res?.data) {
        setUser(res.data.user);
        setWorkspaces(res.data.workspaces || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        workspaces,
        activeWorkspace,
        loading,
        login,
        register,
        logout,
        switchWorkspace,
        refreshUserData,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

