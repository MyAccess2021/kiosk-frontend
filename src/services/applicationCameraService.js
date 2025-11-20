import { request } from './api';

/**
 * Assign a camera to an application
 * @param {Object} data - { application, camera, description, is_primary }
 * @returns {Promise<Object>}
 */
export const assignCameraToApplication = (data) => 
  request('/applications/application-cameras/', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  });

/**
 * Get all cameras assigned to a specific application
 * @param {number} applicationId - Application ID
 * @returns {Promise<Object>}
 */
export const getApplicationCameras = (applicationId) => 
  request(`/applications/application-cameras/?application=${applicationId}`);

/**
 * Update camera assignment
 * @param {number} id - Assignment ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>}
 */
export const updateApplicationCamera = (id, data) => 
  request(`/applications/application-cameras/${id}/`, { 
    method: 'PATCH', 
    body: JSON.stringify(data) 
  });

/**
 * Remove camera assignment from application
 * @param {number} id - Assignment ID
 * @returns {Promise<void>}
 */
export const removeApplicationCamera = (id) => 
  request(`/applications/application-cameras/${id}/`, { 
    method: 'DELETE' 
  });