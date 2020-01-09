export default {
    saveToken: (token: string) => {
      localStorage.setItem('token', token);
    },
    getToken: function() {
      return localStorage.getItem('token');
    },
    clearToken: function() {
      return localStorage.removeItem('token');
    },
    saveUseName:(username: string) => {
      localStorage.setItem('username', username);
    },
    getUserName: function() {
      return localStorage.getItem('username');
    },
    clearUserName: function() {
      return localStorage.getItem('username');
    },
  };
