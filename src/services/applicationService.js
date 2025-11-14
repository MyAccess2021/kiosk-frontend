import { request } from './api';

export const getApplications = () => request('/applications/applications/');
export const getApplicationById = (id) => request(`/applications/applications/${id}/`);
export const createApplication = (data) => request('/applications/applications/', { method: 'POST', body: JSON.stringify(data) });
export const updateApplication = (id, data) => request(`/applications/applications/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteApplication = (id) => request(`/applications/applications/${id}/`, { method: 'DELETE' });