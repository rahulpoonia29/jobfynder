import axios, { AxiosInstance } from "axios";

// Create an instance of Axios with the base URL pointing to port 8000
const api: AxiosInstance = axios.create({
  baseURL: "https://api.jobfynder.com/api/v1",
  withCredentials: true,
});

export default api;
