// //base url for api calls and headers

import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000, // 15s is more reasonable for dev
  headers: {
    'Content-Type': 'application/json',
  },
});


