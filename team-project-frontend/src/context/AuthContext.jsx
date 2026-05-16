import React, {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext(null);
 
function useAuth() { return useContext(AuthContext); }
 
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("voting_user") || "null"); } catch { return null; }
  });
 
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("voting_user", JSON.stringify(userData));
    localStorage.setItem("voting_token", userData.token);
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("voting_user");
    localStorage.removeItem("voting_token");
  };
  const isAdmin = user?.roles?.includes("Admin") || user?.role === "Admin";
 
  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
 
export { useAuth };