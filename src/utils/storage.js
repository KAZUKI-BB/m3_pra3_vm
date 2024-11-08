export const saveToken = (token) => sessionStorage.setItem('authToken', token);
export const getToken = () => sessionStorage.getItem('authToken');
export const clearToken = () => sessionStorage.removeItem('authToken');