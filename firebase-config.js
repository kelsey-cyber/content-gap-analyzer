// Firebase Configuration
// Replace these values with your Firebase project credentials

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
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
