import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (e) {
        console.error("Error loading user:", e);
        localStorage.removeItem("currentUser");
      }
    }
    setLoading(false);
  }, []);

  const register = (username, password) => {
    // Check if username already exists
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (users[username]) {
      return { success: false, error: "Username already exists" };
    }

    // Simple password hash (in production, use proper hashing)
    const hashedPassword = btoa(password); // Base64 encoding (not secure, but simple)
    
    // Store user
    users[username] = {
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("users", JSON.stringify(users));

    // Auto-login after registration
    const userData = { username, createdAt: users[username].createdAt };
    setUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));

    return { success: true };
  };

  const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    const user = users[username];

    if (!user) {
      return { success: false, error: "Username not found" };
    }

    // Check password
    const hashedPassword = btoa(password);
    if (user.password !== hashedPassword) {
      return { success: false, error: "Incorrect password" };
    }

    // Set current user
    const userData = { username, createdAt: user.createdAt };
    setUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}


