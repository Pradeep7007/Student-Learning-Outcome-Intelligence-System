let API_BASE_URL = process.env.REACT_APP_API_URL;
if (!API_BASE_URL || API_BASE_URL === 'undefined') {
    API_BASE_URL = 'http://localhost:5000';
} else if (API_BASE_URL.endsWith('/')) {
    API_BASE_URL = API_BASE_URL.slice(0, -1);
}

export default API_BASE_URL;