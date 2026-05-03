import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
    baseURL: API,
    headers: { "Content-Type": "application/json" },
});

export const getTools = () => api.get("/tools").then((r) => r.data);
export const getDevices = () => api.get("/devices").then((r) => r.data);
export const getIosVersions = () =>
    api.get("/ios-versions").then((r) => r.data.versions);
export const checkCompatibility = (device_id, ios_version) =>
    api
        .post("/compatibility", { device_id, ios_version })
        .then((r) => r.data);
export const getNews = () => api.get("/news").then((r) => r.data);
export const getTutorials = () => api.get("/tutorials").then((r) => r.data);
export const getFaq = () => api.get("/faq").then((r) => r.data);
export const getStats = () => api.get("/stats").then((r) => r.data);
export const subscribeNewsletter = (email) =>
    api.post("/newsletter", { email }).then((r) => r.data);
