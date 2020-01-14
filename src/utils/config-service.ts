import axios from 'axios';
import auth from './auth';

const service: any = axios.create({
    timeout: 30000,
    // baseURL: config.serveBaseURL
});
service.interceptors.request.use((config: any) => {
    const token = auth.getToken();
    if (token) {
      // config.headers['Authorization'] = token;
    }
    config.headers['Authorization'] = 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ3dXp6MTYiLCJhdXRob3JpdGllcyI6InVzZXIiLCJleHAiOjE1NzkyNDkxNzd9.tgXmUgXy-VIWSkFPNUTMRh0F_pwTzifpNKatfmSQoeEY3Rr1JhNo50Fqh7SVG0oGYfS1uo7vQ-muFL9W0nOQ3A';
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
