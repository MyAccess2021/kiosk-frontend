// permissions.js - Centralized Permission Management
// This file handles all permission checks without API calls
// Just check localStorage data stored during login

/**
 * Get user permissions from localStorage
 * @returns {Array} Array of permission objects
 */
const getUserPermissions = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return [];
    
    const user = JSON.parse(userStr);
    if (!user.roles || !Array.isArray(user.roles)) return [];
    
    // Flatten all permissions from all roles
    const allPermissions = [];
    user.roles.forEach(role => {
      if (role.permissions && Array.isArray(role.permissions)) {
        allPermissions.push(...role.permissions);
      }
    });
    
    return allPermissions;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
};

/**
 * Check if user has a specific permission
 * @param {string} permissionShortName - The short_name of the permission (e.g., "user_view")
 * @returns {boolean} True if user has permission, false otherwise
 */
const hasPermission = (permissionShortName) => {
  const permissions = getUserPermissions();
  return permissions.some(perm => perm.short_name === permissionShortName);
};

/**
 * Check multiple permissions (user needs at least one)
 * @param {Array<string>} permissionShortNames - Array of permission short names
 * @returns {boolean} True if user has at least one permission
 */
const hasAnyPermission = (permissionShortNames) => {
  return permissionShortNames.some(name => hasPermission(name));
};

/**
 * Check multiple permissions (user needs all)
 * @param {Array<string>} permissionShortNames - Array of permission short names
 * @returns {boolean} True if user has all permissions
 */
const hasAllPermissions = (permissionShortNames) => {
  return permissionShortNames.every(name => hasPermission(name));
};

// ============================================
// USER PERMISSIONS
// ============================================
export const canViewUser = () => {
  return hasPermission("user_view");
};

export const canCreateUser = () => {
  return hasPermission("user_create");
};

export const canUpdateUser = () => {
  return hasPermission("user_update");
};

export const canDeleteUser = () => {
  return hasPermission("user_delete");
};

export const canRestoreUser = () => {
  return hasPermission("user_restore");
};

// ============================================
// ROLE PERMISSIONS
// ============================================
export const canViewRole = () => {
  return hasPermission("role_view");
};

export const canCreateRole = () => {
  return hasPermission("role_create");
};

export const canUpdateRole = () => {
  return hasPermission("role_update");
};

// ============================================
// CAMERA PERMISSIONS
// ============================================
export const canViewCamera = () => {
  return hasPermission("camera_view");
};

export const canCreateCamera = () => {
  return hasPermission("camera_create");
};

export const canUpdateCamera = () => {
  return hasPermission("camera_update");
};

export const canDeleteCamera = () => {
  return hasPermission("camera_delete");
};

// ============================================
// APPLICATION PERMISSIONS
// ============================================
export const canViewApplication = () => {
  return hasPermission("application_view");
};

export const canCreateApplication = () => {
  return hasPermission("application_create");
};

export const canUpdateApplication = () => {
  return hasPermission("application_update");
};

export const canDeleteApplication = () => {
  return hasPermission("application_delete");
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
/**
 * Get all permission names user has
 * @returns {Array<string>} Array of permission short names
 */
export const getAllUserPermissionNames = () => {
  const permissions = getUserPermissions();
  return permissions.map(perm => perm.short_name);
};

/**
 * Get user info from localStorage
 * @returns {Object|null} User object or null
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export const isLoggedIn = () => {
  return !!localStorage.getItem('accessToken');
};