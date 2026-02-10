# Content Gap Analyzer

AI-powered competitive content analysis tool for tracking and analyzing competitor content across multiple platforms.

## Features

- 📊 Competitor content tracking (Blogs, Instagram, TikTok, Email)
- 🤖 AI-powered content categorization using Claude
- 📈 Gap analysis by content pillar
- 📅 Automated content calendar recommendations
- 🔍 Trending theme detection
- 📥 Exportable reports

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: "Content Gap Analyzer"
3. Add a web app to your project
4. Copy the Firebase config values
5. Enable Firestore Database:
   - Go to Firestore Database
   - Click "Create database"
   - Start in production mode
   - Choose your region
6. Update `firebase-config.js` with your credentials

### 2. Get Claude API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create account or sign in
3. Generate API key
4. Copy the key (starts with `sk-ant-`)
5. Add it in the app Settings tab

### 3. Set Up Competitor Email Inbox

1. Create Gmail account: `yourcompany.contentgaps@gmail.com`
2. Subscribe to all competitor newsletters
3. Enable 2FA on that account
4. (Gmail API integration coming in v1.1)

### 4. Deploy to GitHub Pages

1. Create new repository on GitHub
2. Upload all files to the repository
3. Go to Settings → Pages
4. Source: Deploy from branch `main`
5. Save and wait for deployment
6. Your site will be live at: `https://yourusername.github.io/content-gap-analyzer`

## How to Use

### Add Competitors

1. Click "Competitors" tab
2. Click "Add Competitor"
3. Enter company name and platform URLs
4. Save

### Add Manual Content (TikTok)

1. Click "Add Content" tab
2. Select competitor
3. Paste TikTok URL
4. Add description
5. Submit

### Run Analysis

1. Click "Dashboard" tab
2. Click "Run Analysis"
3. Wait for AI processing (30-60 seconds)
4. View your gap report!

### Export Report

1. After running analysis
2. Click "Export Report"
3. Download text file

## Content Pillars

The app analyzes content across these pillars:
- Lifestyle/Self-Care
- Seasonal/Gifting
- Ingredient Education
- Sustainability
- Product Rituals
- Sensory Experience
- Problem-Solution

## Roadmap

### v1.1 (Coming Soon)
- Full Gmail API integration
- Instagram automation
- Historical trend tracking

### v1.2
- TikTok scraping
- Automated scheduling
- Team collaboration features

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Database: Firebase Firestore
- AI: Claude API (Anthropic)
- Hosting: GitHub Pages
- Charts: Chart.js

## Support

For issues or questions, create an issue in this repository.

## License

Personal use only
