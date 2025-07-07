import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Define role hierarchy and permissions
const ROLES = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    level: 0,
    permissions: [
      'manage_users',
      'manage_roles',
      'manage_menu',
      'manage_stock',
      'view_reports',
      'manage_settings',
      'process_sales',
      'view_analytics',
      'manage_system'
    ]
  },
  ADMIN: {
    name: 'Admin',
    level: 1,
    permissions: [
      'manage_users',
      'manage_menu',
      'manage_stock',
      'view_reports',
      'manage_settings',
      'process_sales',
      'view_analytics'
    ]
  },
  MANAGER: {
    name: 'Manager',
    level: 2,
    permissions: [
      'manage_menu',
      'manage_stock',
      'view_reports',
      'process_sales',
      'view_analytics'
    ]
  },
  CASHIER: {
    name: 'Kasir',
    level: 3,
    permissions: [
      'process_sales',
      'view_reports'
    ]
  },
  BARISTA: {
    name: 'Barista',
    level: 4,
    permissions: [
      'view_menu',
      'manage_stock',
      'process_sales'
    ]
  }
};

// Demo users with roles
const DEMO_USERS = [
  {
    id: 1,
    username: 'superadmin',
    password: 'super123',
    name: 'Super Administrator',
    role: 'SUPER_ADMIN',
    email: 'super@kopibagus.com'
  },
  {
    id: 2,
    username: 'admin',
    password: 'admin123',
    name: 'Administrator',
    role: 'ADMIN',
    email: 'admin@kopibagus.com'
  },
  {
    id: 3,
    username: 'manager',
    password: 'manager123',
    name: 'Store Manager',
    role: 'MANAGER',
    email: 'manager@kopibagus.com'
  },
  {
    id: 4,
    username: 'kasir',
    password: 'kasir123',
    name: 'Kasir',
    role: 'CASHIER',
    email: 'kasir@kopibagus.com'
  },
  {
    id: 5,
    username: 'barista',
    password: 'barista123',
    name: 'Barista',
    role: 'BARISTA',
    email: 'barista@kopibagus.com'
  }
];

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('kopibagus_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (credentials) => {
    const foundUser = DEMO_USERS.find(
      u => u.username === credentials.username && u.password === credentials.password
    );

    if (foundUser) {
      // Attach role permissions to user data
      const userWithRole = {
        ...foundUser,
        permissions: ROLES[foundUser.role]?.permissions || [],
        roleLevel: ROLES[foundUser.role]?.level
      };
      setUser(userWithRole);
      localStorage.setItem('kopibagus_user', JSON.stringify(userWithRole));
      return { success: true, user: userWithRole };
    }
    
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kopibagus_user');
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  const isRoleAtLeast = (minimumRole) => {
    if (!user) return false;
    const userRoleLevel = ROLES[user.role]?.level;
    const minimumRoleLevel = ROLES[minimumRole]?.level;
    return userRoleLevel <= minimumRoleLevel;
  };

  const value = {
    user,
    login,
    logout,
    loading,
    hasPermission,
    hasRole,
    isRoleAtLeast,
    ROLES,
    DEMO_USERS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};