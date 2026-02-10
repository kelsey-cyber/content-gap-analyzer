// Main App Initialization

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
}

// Settings - Save API Key
document.getElementById('saveApiKey').addEventListener('click', async () => {
    const apiKey = document.getElementById('claudeApiKey').value;
    
    if (!apiKey) {
        alert('Please enter an API key');
        return;
    }
    
    try {
        await settingsRef.doc('app-config').update({
            claudeApiKey: apiKey
        });
        alert('API key saved successfully!');
        document.getElementById('claudeApiKey').value = ''; // Clear for security
    } catch (error) {
        console.error('Error saving API key:', error);
        alert('Error saving API key. Please try again.');
    }
});

// Settings - Load pillars
async function loadPillars() {
    try {
        const settings = await settingsRef.doc('app-config').get();
        const pillars = settings.data()?.contentPillars || [];
        
        const container = document.getElementById('pillarsList');
        container.innerHTML = pillars.map(pillar => 
            `<div class="pillar-item">${pillar}</div>`
        ).join('');
    } catch (error) {
        console.error('Error loading pillars:', error);
    }
}

// Settings - Analysis frequency
document.getElementById('analysisFrequency').addEventListener('change', async (e) => {
    try {
        await settingsRef.doc('app-config').update({
            analysisFrequency: e.target.value
        });
        alert('Analysis frequency updated!');
    } catch (error) {
        console.error('Error updating frequency:', error);
    }
});

// Gmail connection (placeholder)
document.getElementById('connectGmail').addEventListener('click', () => {
    alert('Gmail integration setup coming in next version! For now, emails will be monitored through the backend script.');
});

// Initialize app on load
window.addEventListener('DOMContentLoaded', async () => {
    console.log('Content Gap Analyzer loaded');
    
    // Load data
    await loadCompetitors();
    await loadPillars();
    await loadRecentContent();
    await loadLatestReport();
    
    // Load saved analysis frequency
    try {
        const settings = await settingsRef.doc('app-config').get();
        if (settings.exists) {
            document.getElementById('analysisFrequency').value = 
                settings.data()?.analysisFrequency || 'manual';
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
});

// Add some helper CSS for pillars display
const style = document.createElement('style');
style.textContent = `
    .pillar-item {
        background: var(--bg);
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 8px;
        border-left: 3px solid var(--primary);
    }
    
    .calendar-section {
        margin-bottom: 30px;
    }
    
    .calendar-section h3 {
        color: var(--primary);
        margin-bottom: 15px;
    }
`;
document.head.appendChild(style);
