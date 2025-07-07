import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const PermissionGate = ({ 
  children, 
  permission, 
  role, 
  minimumRole,
  fallback = null 
}) => {
  const { hasPermission, hasRole, isRoleAtLeast } = useAuth();

  // Check specific permission
  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  // Check exact role match
  if (role && !hasRole(role)) {
    return fallback;
  }

  // Check minimum role level
  if (minimumRole && !isRoleAtLeast(minimumRole)) {
    return fallback;
  }

  return children;
};

export default PermissionGate;