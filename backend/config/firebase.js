const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

let serviceAccount;

// Check if FIREBASE_SERVICE_ACCOUNT_JSON exists and parse it
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    // Parse the JSON string if it's a string
    const jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    serviceAccount =
      typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;

    // Fix the private key if it contains escaped newlines
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(
        /\\n/g,
        "\n",
      );
    }
  } catch (error) {
    console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:", error);
    // Fallback to individual env vars
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };
  }
} else {
  // Use individual env vars as fallback
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log(`✅ Firebase Admin SDK Initialized: ${serviceAccount.project_id || serviceAccount.projectId}`);
  } catch (error) {
    console.error('❌ Firebase Admin SDK Initialization Error:', error.message);
  }
}

module.exports = admin;
