import axios from "axios";

export const BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:5000" : "https://bind-g2s3.onrender.com";

export const axiosInstance = axios.create({
  // Point this to your backend server
  baseURL: `${BASE_URL}/api/v1`,
  
  // CRITICAL: This line tells Axios to send our HTTP-Only cookies with every request!
  withCredentials: true, 
});