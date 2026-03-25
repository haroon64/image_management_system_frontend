"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface UserType {
  id?: number;
  full_name?: string;
  email?: string;
  role?:string;

}

interface AuthContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  isLoggedIn: boolean;
  
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);

  

  return (
    <AuthContext.Provider value={{ user, setUser, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
