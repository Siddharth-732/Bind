import axios from "axios";

export const axiosInstance = axios.create({
  // Point this to your backend server
  baseURL: "http://localhost:5000/api/v1",
  
  // CRITICAL: This line tells Axios to send our HTTP-Only cookies with every request!
  withCredentials: true, 
});