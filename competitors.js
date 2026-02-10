// Competitor Management

let currentCompetitors = [];

// Load competitors from Firebase
async function loadCompetitors() {
    try {
        const snapshot = await competitorsRef.get();
        currentCompetitors = [];
        
        snapshot.forEach(doc => {
            currentCompetitors.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        displayCompetitors();
        updateCompetitorDropdown();
    } catch (error) {
        console.error('Error loading competitors:', error);
    }
}

// Display competitors in grid
function displayCompetitors() {
    const container = document.getElementById('competitorsList');
    
    if (currentCompetitors.length === 0) {
        container.innerHTML = '<p class="empty-state">No competitors added yet. Click "Add Competitor" to get started.</p>';
        return;
    }
    
    container.innerHTML = currentCompetitors.map(comp => `
        <div class="competitor-card">
            <h3>${comp.name}</h3>
            <ul class="platform-list">
                ${comp.platforms?.blog?.url ? `<li class="active">📝 Blog</li>` : ''}
                ${comp.platforms?.instagram?.handle ? `<li class="active">📸 Instagram</li>` : ''}
                ${comp.platforms?.tiktok?.handle ? `<li class="active">🎵 TikTok</li>` : ''}
                ${comp.platforms?.email?.senderEmail ? `<li class="active">📧 Email</li>` : ''}
            </ul>
            <div class="actions">
                <button class="btn-small" onclick="editCompetitor('${comp.id}')">Edit</button>
                <button class="btn-small btn-danger" onclick="deleteCompetitor('${comp.id}', '${comp.name}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Update competitor dropdown in manual content form
function updateCompetitorDropdown() {
    const dropdown = document.getElementById('contentCompetitor');
    if (!dropdown) return;
    
    dropdown.innerHTML = '<option value="">Select competitor...</option>' +
        currentCompetitors.map(comp => 
            `<option value="${comp.id}">${comp.name}</option>`
        ).join('');
}

// Add competitor modal
const modal = document.getElementById('competitorModal');
const addBtn = document.getElementById('addCompetitor');
const closeBtn = document.querySelector('.close');

addBtn.onclick = () => {
    document.getElementById('competitorForm').reset();
    modal.style.display = 'block';
};

closeBtn.onclick = () => {
    modal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Save competitor
document.getElementById('competitorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const competitorData = {
        name: document.getElementById('compName').value,
        platforms: {
            blog: {
                url: document.getElementById('compBlog').value || null,
                active: !!document.getElementById('compBlog').value
            },
            instagram: {
                handle: document.getElementById('compInstagram').value || null,
                active: !!document.getElementById('compInstagram').value
            },
            tiktok: {
                handle: document.getElementById('compTiktok').value || null,
                active: !!document.getElementById('compTiktok').value,
                manualOnly: true
            },
            email: {
                senderEmail: document.getElementById('compEmail').value || null,
                active: !!document.getElementById('compEmail').value
            }
        },
        created: firebase.firestore.FieldValue.serverTimestamp(),
        lastScanned: null
    };
    
    try {
        await competitorsRef.add(competitorData);
        modal.style.display = 'none';
        loadCompetitors();
        alert('Competitor added successfully!');
    } catch (error) {
        console.error('Error adding competitor:', error);
        alert('Error adding competitor. Please try again.');
    }
});

// Delete competitor
async function deleteCompetitor(id, name) {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    
    try {
        await competitorsRef.doc(id).delete();
        loadCompetitors();
        alert('Competitor deleted successfully!');
    } catch (error) {
        console.error('Error deleting competitor:', error);
        alert('Error deleting competitor. Please try again.');
    }
}

// Edit competitor (simplified - just show alert for now)
function editCompetitor(id) {
    alert('Edit functionality coming soon! For now, delete and re-add to make changes.');
}

// Manual content form submission
document.getElementById('manualContentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const contentData = {
        competitorId: document.getElementById('contentCompetitor').value,
        platform: document.getElementById('contentPlatform').value,
        url: document.getElementById('contentUrl').value,
        title: document.getElementById('contentTitle').value,
        content: document.getElementById('contentSummary').value,
        publishDate: new Date(document.getElementById('contentDate').value),
        collectedDate: firebase.firestore.FieldValue.serverTimestamp(),
        manualEntry: true,
        analyzed: false
    };
    
    try {
        await contentItemsRef.add(contentData);
        document.getElementById('manualContentForm').reset();
        alert('Content added successfully!');
        loadRecentContent();
    } catch (error) {
        console.error('Error adding content:', error);
        alert('Error adding content. Please try again.');
    }
});

// Load recent manually added content
async function loadRecentContent() {
    try {
        const snapshot = await contentItemsRef
            .where('manualEntry', '==', true)
            .orderBy('collectedDate', 'desc')
            .limit(10)
            .get();
        
        const container = document.getElementById('recentContent');
        
        if (snapshot.empty) {
            container.innerHTML = '<p class="empty-state">No content added yet.</p>';
            return;
        }
        
        const items = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const competitor = currentCompetitors.find(c => c.id === data.competitorId);
            items.push(`
                <div class="content-item">
                    <div class="content-item-info">
                        <h4>${data.title}</h4>
                        <div class="content-item-meta">
                            ${competitor?.name || 'Unknown'} • ${data.platform} • 
                            ${data.publishDate?.toDate().toLocaleDateString() || 'No date'}
                        </div>
                    </div>
                </div>
            `);
        });
        
        container.innerHTML = items.join('');
    } catch (error) {
        console.error('Error loading recent content:', error);
    }
}
