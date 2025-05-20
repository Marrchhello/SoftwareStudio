import axios from 'axios';

// Show axios where backend is
const api = axios.create({

    baseURL: "http://localhost:8000"

});

// export api connection to be used in other files
export default api;