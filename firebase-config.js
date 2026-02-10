// Firebase Configuration
// Replace these values with your Firebase project credentials

const firebaseConfig = {
  apiKey: "AIzaSyCv9KJtpw4cGQ6JFdPp6YGbFW-cR72IoHQ",
  authDomain: "content-gap-analyzer-6e816.firebaseapp.com",
  projectId: "content-gap-analyzer-6e816",
  storageBucket: "content-gap-analyzer-6e816.firebasestorage.app",
  messagingSenderId: "700143801700",
  appId: "1:700143801700:web:d6765fda0f61a2a2bd5671"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Collection references
const competitorsRef = db.collection('competitors');
const contentItemsRef = db.collection('contentItems');
const gapReportsRef = db.collection('gapReports');
const settingsRef = db.collection('settings');

// Initialize default settings if they don't exist
async function initializeSettings() {
    try {
        const settingsDoc = await settingsRef.doc('app-config').get();
        if (!settingsDoc.exists) {
            await settingsRef.doc('app-config').set({
                contentPillars: [
                    'Lifestyle/Self-Care',
                    'Seasonal/Gifting',
                    'Ingredient Education',
                    'Sustainability',
                    'Product Rituals',
                    'Sensory Experience',
                    'Problem-Solution'
                ],
                analysisFrequency: 'manual',
                claudeApiKey: '',
                gmailConnected: false,
                lastFullScan: null,
                created: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('Settings initialized');
        }
    } catch (error) {
        console.error('Error initializing settings:', error);
    }
}

// Run initialization
initializeSettings();
