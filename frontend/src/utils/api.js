import axios from "axios";

/**
 * Axios instance configured for the Local Connect API.
 * Automatically attaches JWT token from localStorage to all requests.
 * Handles 401 responses by clearing token and redirecting.
 *
 * For production, use VITE_API_URL environment variable.
 * Default points to local backend for development.
 */
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://localconnect-mn7a.onrender.com/api",
});

console.log(`🚀 Frontend connected to Backend API at: ${api.defaults.baseURL}`);

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Optionally trigger a re-render or redirect
    }
    return Promise.reject(error);
  },
);

// ── Auth API ──────────────────────────────────────────────────────────────

export const firebaseLogin = async (idToken) => {
  const response = await api.post("/auth/firebase-login", { idToken });
  console.log("✅ Firebase Authentication successful");
  console.log(`🔑 Logged in as: ${response.data.user.name}`);

  // Store token
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }

  return response.data;
};

/**
 * Register a new user with email/password.
 */
export const signup = async (userData) => {
  const response = await api.post("/auth/signup", userData);
  if (response.data.token) localStorage.setItem("token", response.data.token);
  return response.data;
};

/**
 * Login with email/password.
 */
export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  if (response.data.token) localStorage.setItem("token", response.data.token);
  return response.data;
};

/**
 * Request OTP via Twilio.
 */
export const requestOTP = async (phone) => {
  const response = await api.post("/auth/request-otp", { phone });
  return response.data;
};

/**
 * Verify Twilio OTP.
 */
export const verifyOTP = async (phone, otp) => {
  const response = await api.post("/auth/verify-otp", { phone, otp });
  if (response.data.token) localStorage.setItem("token", response.data.token);
  return response.data;
};

// ── Profile API ───────────────────────────────────────────────────────────

/**
 * Get current user's profile.
 * @returns {Promise<{success, user, profile}>}
 */
export const getProfile = async () => {
  const response = await api.get("/profile/me");
  console.log(
    "✅ Profile successfully fetched from Database Collection: profile_info",
  );
  return response.data;
};

/**
 * Update current user's profile.
 * Supports multipart form data for profile image upload.
 * @param {FormData|object} data - Profile data (FormData for image upload)
 * @returns {Promise<{success, user, profile}>}
 */
export const updateProfile = async (data) => {
  const isFormData = data instanceof FormData;
  const response = await api.put("/profile/update", data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  console.log(
    "✅ Profile updated and connected to Database Collection: profile_info",
  );
  return response.data;
};

// ── Posts API ──────────────────────────────────────────────────────────────

/**
 * Create a new marketplace listing.
 * @param {FormData} formData - Post data with images/video files
 * @returns {Promise<{success, post}>}
 */
export const createPost = async (formData) => {
  const response = await api.post("/posts/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  console.log(
    "✅ Card data successfully connected to Database Collection: farmer_post",
  );
  console.log(`✨ Post created: ${response.data.post.cropName}`);
  return response.data;
};

/**
 * Get all marketplace listings.
 * @returns {Promise<{success, count, posts}>}
 */
export const getAllPosts = async () => {
  const response = await api.get("/posts/all");
  console.log(
    `✅ ${response.data.posts.length} Posts successfully fetched from Database Collection: farmer_post`,
  );
  return response.data;
};

/**
 * Get a single post by ID.
 * @param {string} id - Post ID
 * @returns {Promise<{success, post}>}
 */
export const getPostById = async (id) => {
  const response = await api.get(`/posts/${id}`);
  return response.data;
};

/**
 * Update a post.
 * @param {string} id - Post ID
 * @param {FormData} formData - Updated post data
 * @returns {Promise<{success, post}>}
 */
export const updatePost = async (id, formData) => {
  const response = await api.put(`/posts/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Delete a post.
 * @param {string} id - Post ID
 * @returns {Promise<{success, message}>}
 */
export const deletePost = async (id) => {
  const response = await api.delete(`/posts/${id}`);
  return response.data;
};

export default api;
