import axios from "axios";

const api = axios.create({
    baseURL: "/api", // благодаря proxy запросы пойдут на https://localhost:5001/api
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
