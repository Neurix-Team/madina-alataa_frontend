//base url for api calls and headers
import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: 'http://api-givingchampion.dev.localhost:5128/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});