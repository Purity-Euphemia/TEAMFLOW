import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type User = {
  id: number;
  full_name: string;
  email: string;
};

export type Workspace = {
  id: number;
  name: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (ws: Workspace | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        // Send cookies with request
        credentials: 'include', 
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (data.workspace_id) {
          setCurrentWorkspace({ id: data.workspace_id, name: data.workspace_name });
        }
      } else {
        setUser(null);
        setCurrentWorkspace(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setCurrentWorkspace(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, checkAuth, setUser, currentWorkspace, setCurrentWorkspace }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
