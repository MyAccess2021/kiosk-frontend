import { request } from './api';

export const getCameras = (isActive = null) => {
  const url = isActive !== null ? `/cameraapi/cameras/?is_active=${isActive}` : `/cameraapi/cameras/`;
  return request(url);
};

export const createCamera = (data) => request('/cameraapi/cameras/', { method: 'POST', body: JSON.stringify(data) });
export const updateCamera = (id, data) => request(`/cameraapi/cameras/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCamera = (id) => request(`/cameraapi/cameras/${id}/`, { method: 'DELETE' });