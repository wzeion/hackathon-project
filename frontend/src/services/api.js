/**
 * Re-export all API functions from utils/api.js
 * This file exists to satisfy the project structure requirement
 * of having API calls in a services/api.js file.
 */
export {
  default as api,
  firebaseLogin,
  signup,
  login,
  requestOTP,
  verifyOTP,
  getProfile,
  updateProfile,
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../utils/api";
