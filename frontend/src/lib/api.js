import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
    baseURL: API,
    headers: { "Content-Type": "application/json" },
});

export const getTools = () => api.get("/tools").then((r) => r.data);
export const getToolDetail = (id) =>
    api.get(`/tools/${id}/detail`).then((r) => r.data);
export const getToolReleases = (id, refresh = false) =>
    api
        .get(`/tools/${id}/releases${refresh ? "?refresh=true" : ""}`)
        .then((r) => r.data);
export const getToolChangelog = (id, fromTag) =>
    api
        .get(
            `/tools/${id}/releases/changelog${fromTag ? `?from_tag=${encodeURIComponent(fromTag)}` : ""}`,
        )
        .then((r) => r.data);
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
export const sendChat = (message, session_id) =>
    api.post("/chat", { message, session_id }).then((r) => r.data);
export const getChatHistory = (session_id) =>
    api.get(`/chat/${session_id}`).then((r) => r.data);
