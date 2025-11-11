import { request } from './api';

export const getRoles = () => request('/api/roles/');
export const createRole = (body) => request('/api/roles/', { method: 'POST', body: JSON.stringify(body) });
export const updateRole = (id, body) => request(`/api/roles/${id}/`, { method: 'PUT', body: JSON.stringify(body) });

export const getPermissions = () => request('/api/permissions/');

export const getUsers = (showDeleted = false) => {
  const query = showDeleted ? '?show_deleted=true' : '';
  return request(`/api/users/${query}`);
};

export const createUser = (body) => request('/api/users/', { method: 'POST', body: JSON.stringify(body) });
export const updateUser = (id, body) => request(`/api/users/${id}/`, { method: 'PATCH', body: JSON.stringify(body) });
export const deleteUser = (id) => request(`/api/users/${id}/`, { method: 'DELETE' });
export const restoreUser = (id) => request(`/api/users/${id}/restore/`, { method: 'POST' });