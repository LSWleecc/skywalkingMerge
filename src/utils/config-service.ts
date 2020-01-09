import axios from 'axios';
import auth from './auth';

const service: any = axios.create({
    timeout: 30000,
    // baseURL: config.serveBaseURL
});
service.interceptors.request.use((config: any) => {
    const token = auth.getToken();
    if (token) {
      config.headers['Authorization'] = token;
    }
  return config;
}, (error: any) => {
  return  Promise.reject(error);
});

service.interceptors.response.use((response: any) => {
  const data = response.data || {};
    if (data.code === 403 || data.code === 40317) {
        auth.clearToken();
        window.parent.postMessage(data.code,'*')
         return Promise.reject(data);
    } else {
      return response;
    }
}, (error: any) => {
    return Promise.reject(error);
});

export default service;
