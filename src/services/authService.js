//logic for auth service
//take api and return data
import { axiosClient } from './axiosClient';

const AUTH_API_URL = '/api/auth';

export const authService = {

  register: async (payload) => {
    const requestBody = {
      email: payload.email,
      password: payload.password,
      fullname: payload.fullname,
      birthDate: payload.birthDate,
    };

    console.log('REGISTER REQUEST BODY:', requestBody);

    const response = await axiosClient.post(`${AUTH_API_URL}/register`, requestBody);

    console.log('REGISTER REAL API RESPONSE:', response.data);

    return response.data;
  },
};
