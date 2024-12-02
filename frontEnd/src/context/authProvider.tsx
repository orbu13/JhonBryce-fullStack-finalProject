import { createContext, useState, useContext, ReactNode, ReactElement, useEffect } from "react";

interface User {
  _id: string; 
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  loggedIn: boolean
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps): ReactElement {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  function login(userData: User): void {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }

  function logout(): void {
    if(user?.role === "admin") {
  fetch("http://localhost:5500/admin/logout",{
      method:"POST",
      headers:{
        "Content-Type": "application/json",
        role: user?.role,
        loggedIn: user?.loggedIn.toString()
      },
      body: JSON.stringify({email:user?.email})
    }).then(res=>{
      return res.json()
    })
    .then(data=>{
 setUser(null);
 localStorage.removeItem("user");
    })
    } else if(user?.role === "user") {
       fetch("http://localhost:5500/users/logout",{
      method:"POST",
      headers:{
        "Content-Type": "application/json",
        role: user?.role,
        loggedIn: user?.loggedIn.toString()
      },
      body: JSON.stringify({email:user?.email})
    }).then(res=>{
      return res.json()
    })
    .then(data=>{
 setUser(null);
 localStorage.removeItem("user");
    })
    }
  }

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider, useAuth };
