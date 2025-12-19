// FILE: ./services/deviceService.js
import { request } from './api';

/**
 * Create a new device
 * POST {{kiosk_server_url}}/applications/devices/
 */
export const createDevice = (data) =>
  request('/applications/devices/', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Get devices list
 * Supports query strings like:
 *   "?is_active=true"
 *   "?application=38&is_active=true"
 */
export const getDevices = (queryString = '') =>
  request(`/applications/devices/${queryString}`);

/**
 * Get a single device by ID
 * GET {{kiosk_server_url}}/applications/devices/:id/
 */
export const getDeviceById = (id) =>
  request(`/applications/devices/${id}/`);

/**
 * Update a device (partial update)
 * PATCH {{kiosk_server_url}}/applications/devices/:id/
 */
export const updateDevice = (id, data) =>
  request(`/applications/devices/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

/**
 * Delete a device
 * DELETE {{kiosk_server_url}}/applications/devices/:id/
 */
export const deleteDevice = (id) =>
  request(`/applications/devices/${id}/`, {
    method: 'DELETE',
  });
// Send WRITE command to backend via HTTP
export const sendWriteCommand = (deviceToken, fieldName, type, value) => {
  return request(`/applications/push/${deviceToken}/`, {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "dict",
        value: {
          [fieldName]: {
            type,
            value
          }
        }
      }
    })
  });
};

