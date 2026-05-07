// Replace with your Firebase config
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id",
    measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = firebaseModules.initializeApp(firebaseConfig);
export const db = firebaseModules.getFirestore(app);
export const analytics = firebaseModules.getAnalytics(app);
export const messaging = firebaseModules.getMessaging(app);
export const auth = firebaseModules.getAuth(app);

// Initialize Firebase modules
window.db = db;
window.analytics = analytics;
window.messaging = messaging;
window.auth = auth;
window.GoogleAuthProvider = firebaseModules.GoogleAuthProvider;