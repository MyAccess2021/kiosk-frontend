import { request } from './api';

export const login = (credentials) => {
  return request('/api/login/', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};