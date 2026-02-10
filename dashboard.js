// Dashboard Display Functions

let currentReport = null;

// Display gap report
function displayGapReport(report) {
    currentReport = report;
    
    document.getElementById('reportContainer').style.display = 'block';
    document.getElementById('noDataMessage').style.display = 'none';
    
    // Update last analysis time
    document.getElementById('lastAnalysis').textContent = 
        'Last updated: ' + new Date().toLocaleString();
    
    // Executive summary
    document.getElementById('executiveSummary').textContent = report.executiveSummary;
    
    // Top gaps
    displayTopGaps(report.topGaps);
    
    // Trending themes
    displayTrendingThemes(report.trendingThemes);
    
    // Recommended content
    displayContentCalendar(report.recommendedContent);
    
    // Pillar chart
    displayPillarChart(report.pillarAnalysis);
}

// Display top gaps
function displayTopGaps(gaps) {
    const container = document.getElementById('topGaps');
    
    if (!gaps || gaps.length === 0) {
        container.innerHTML = '<p>No significant gaps identified.</p>';
        return;
    }
    
    container.innerHTML = gaps.slice(0, 3).map((gap, index) => `
        <div class="gap-card">
            <h3>${index + 1}. ${gap.gap}</h3>
            <span class="pillar-tag">${gap.pillar}</span>
            <p><strong>Recommendation:</strong> ${gap.recommendation}</p>
            ${gap.competitorExamples && gap.competitorExamples.length > 0 ? `
                <div class="competitor-examples">
                    <strong>Competitors doing this well:</strong>
                    ${gap.competitorExamples.join(', ')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Display trending themes
function displayTrendingThemes(themes) {
    const container = document.getElementById('trendingThemes');
    
    if (!themes || themes.length === 0) {
        container.innerHTML = '<p>No trending themes detected.</p>';
        return;
    }
    
    container.innerHTML = themes.map((theme, index) => 
        `<span class="theme-tag ${index < 3 ? 'hot' : ''}">#${theme}</span>`
    ).join('');
}

// Display content calendar recommendations
function displayContentCalendar(recommendations) {
    const container = document.getElementById('contentCalendar');
    
    if (!recommendations || recommendations.length === 0) {
        container.innerHTML = '<p>No recommendations available.</p>';
        return;
    }
    
    // Group by timeframe
    const grouped = {
        '30 days': [],
        '60 days': [],
        '90 days': []
    };
    
    recommendations.forEach(rec => {
        const timeframe = rec.timeframe || '30 days';
        if (grouped[timeframe]) {
            grouped[timeframe].push(rec);
        }
    });
    
    container.innerHTML = Object.entries(grouped).map(([timeframe, items]) => {
        if (items.length === 0) return '';
        
        return `
            <div class="calendar-section">
                <h3>Next ${timeframe}</h3>
                ${items.map(item => `
                    <div class="calendar-item">
                        <h4>${item.title}</h4>
                        <span class="pillar-tag">${item.pillar}</span>
                        <p class="timeframe">${timeframe}</p>
                        <p>${item.rationale}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

// Display pillar performance chart
function displayPillarChart(pillarAnalysis) {
    const ctx = document.getElementById('pillarChart');
    
    if (!pillarAnalysis) {
        return;
    }
    
    const pillars = Object.keys(pillarAnalysis);
    const competitorAverages = pillars.map(p => pillarAnalysis[p].competitorAverage || 0);
    
    // Destroy existing chart if it exists
    if (window.pillarChartInstance) {
        window.pillarChartInstance.destroy();
    }
    
    window.pillarChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: pillars,
            datasets: [{
                label: 'Competitor Average',
                data: competitorAverages,
                backgroundColor: 'rgba(99, 102, 241, 0.7)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Content Pieces'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                },
                title: {
                    display: true,
                    text: 'Content Volume by Pillar (Competitors - Last 30 Days)'
                }
            }
        }
    });
}

// Export report as text (simplified version)
document.getElementById('exportReport').addEventListener('click', () => {
    if (!currentReport) {
        alert('No report to export. Run an analysis first!');
        return;
    }
    
    const reportText = `
CONTENT GAP ANALYSIS REPORT
Generated: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
${currentReport.executiveSummary}

TOP GAPS
${currentReport.topGaps?.map((gap, i) => `
${i + 1}. ${gap.gap}
   Pillar: ${gap.pillar}
   Recommendation: ${gap.recommendation}
   Leaders: ${gap.competitorExamples?.join(', ') || 'None'}
`).join('\n') || 'None'}

TRENDING THEMES
${currentReport.trendingThemes?.join(', ') || 'None'}

RECOMMENDED CONTENT
${currentReport.recommendedContent?.map(rec => `
- ${rec.title} (${rec.pillar}) - ${rec.timeframe}
  ${rec.rationale}
`).join('\n') || 'None'}
    `.trim();
    
    // Create downloadable file
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-gap-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

// Load most recent report on page load
async function loadLatestReport() {
    try {
        const snapshot = await gapReportsRef
            .orderBy('generatedDate', 'desc')
            .limit(1)
            .get();
        
        if (!snapshot.empty) {
            const reportData = snapshot.docs[0].data();
            displayGapReport({
                executiveSummary: reportData.executiveSummary,
                topGaps: reportData.topGaps,
                trendingThemes: reportData.trendingThemes,
                recommendedContent: reportData.recommendedContent,
                pillarAnalysis: reportData.pillarAnalysis
            });
            
            const date = reportData.generatedDate?.toDate();
            if (date) {
                document.getElementById('lastAnalysis').textContent = 
                    'Last updated: ' + date.toLocaleString();
            }
        } else {
            document.getElementById('noDataMessage').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading latest report:', error);
        document.getElementById('noDataMessage').style.display = 'block';
    }
}
// Export all content for manual Claude analysis
document.getElementById('exportAllContent').addEventListener('click', async () => {
    try {
        // Get all content items
        const snapshot = await contentItemsRef.orderBy('publishDate', 'desc').get();
        
        if (snapshot.empty) {
            alert('No content to export. Add some competitor content first!');
            return;
        }
        
        // Organize content
        const contentByCompetitor = {};
        const contentByPillar = {};
        let totalItems = 0;
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const competitor = currentCompetitors.find(c => c.id === data.competitorId);
            const competitorName = competitor?.name || 'Unknown';
            
            // By competitor
            if (!contentByCompetitor[competitorName]) {
                contentByCompetitor[competitorName] = [];
            }
            contentByCompetitor[competitorName].push(data);
            
            // By pillar (if categorized)
            if (data.pillar) {
                if (!contentByPillar[data.pillar]) {
                    contentByPillar[data.pillar] = [];
                }
                contentByPillar[data.pillar].push({
                    ...data,
                    competitorName
                });
            }
            
            totalItems++;
        });
        
        // Generate export text
        const exportText = `
COMPETITIVE CONTENT ANALYSIS
Export Date: ${new Date().toLocaleDateString()}
Total Content Items: ${totalItems}
Date Range: Last 30 days
Competitors Tracked: ${Object.keys(contentByCompetitor).join(', ')}

========================================
CONTENT PILLARS FOR ANALYSIS
========================================

1. Lifestyle/Self-Care
2. Seasonal/Gifting
3. Ingredient Education
4. Sustainability
5. Product Rituals
6. Sensory Experience
7. Problem-Solution

========================================
CONTENT BY COMPETITOR
========================================

${Object.entries(contentByCompetitor).map(([competitor, items]) => `
${competitor.toUpperCase()} (${items.length} items)
${'='.repeat(50)}

${items.map((item, index) => `
${index + 1}. ${item.title}
   Platform: ${item.platform}
   Date: ${item.publishDate?.toDate?.()?.toLocaleDateString() || 'No date'}
   ${item.pillar ? `Pillar: ${item.pillar}` : ''}
   
   Content: ${item.content || 'No summary'}
   URL: ${item.url}
   
`).join('\n')}
`).join('\n')}

========================================
ANALYSIS REQUEST FOR CLAUDE
========================================

Please analyze this competitive content and provide:

1. CONTENT GAP ANALYSIS
   - Which pillars are competitors investing in most heavily?
   - Which pillars am I underrepresented in?
   - What specific themes/topics are trending across competitors?

2. TOP 3 CONTENT GAPS
   - Identify the biggest opportunities
   - Provide specific content recommendations
   - Note which competitors are doing this well

3. TRENDING THEMES
   - What topics/hashtags appear most frequently?
   - Any seasonal opportunities coming up?
   - Emerging trends in natural body care?

4. RECOMMENDED CONTENT CALENDAR
   - Suggest 5-7 specific content ideas for the next 30 days
   - Organize by pillar
   - Include rationale for each recommendation

5. COMPETITOR INSIGHTS
   - Which competitor has the strongest content strategy overall?
   - What formats are performing best (video, carousel, blog)?
   - Any standout examples worth studying?

Please format your response with clear sections and actionable recommendations.
        `.trim();
        
        // Create downloadable file
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `competitor-content-export-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        alert(`Exported ${totalItems} content items!\n\nNext step: Open the downloaded file and copy everything into claude.ai for analysis.`);
        
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting content: ' + error.message);
    }
});
```

---

## **WORKFLOW: How to Use Your Free Competitive Intelligence System**

### **🎯 MONTHLY WORKFLOW (Recommended)**

#### **Week 1-3: Content Collection**

**Daily (5-10 minutes):**
1. Browse competitor social media (Instagram, TikTok)
2. Check competitor blogs for new posts
3. Watch your dedicated Gmail inbox for competitor newsletters

**When you find interesting content:**
1. Open your Content Gap Analyzer app
2. Click **"Add Content"** tab
3. Fill out the form:
   - Select competitor
   - Choose platform
   - Paste URL
   - Add title & quick summary (2-3 sentences)
   - Set publish date
4. Click "Add Content"

**Aim for:** 15-20 competitor content pieces per month across all competitors

---

#### **Week 4: Monthly Analysis**

**Step 1: Export Your Data (2 minutes)**
1. Open your Content Gap Analyzer
2. Click **"Dashboard"** tab
3. Click **"📤 Export All Content"** button
4. Save the .txt file that downloads

**Step 2: Analyze with Claude (10 minutes)**
1. Go to **claude.ai** (free tier)
2. Start new conversation
3. Open your exported .txt file
4. Copy **everything** from the file
5. Paste it into Claude
6. Hit send

**Step 3: Review & Save Insights (10 minutes)**
1. Claude will give you:
   - Content gap analysis by pillar
   - Top 3 opportunities
   - Trending themes
   - Recommended content calendar
   - Competitor insights

2. Copy Claude's response
3. Save it in a Google Doc or notes app
4. Title it: "Content Analysis - [Month] [Year]"

**Step 4: Plan Your Content (15 minutes)**
1. Review the recommended content calendar
2. Add ideas to your actual content planning tool
3. Prioritize based on your bandwidth
4. Assign to your creative team

---

### **🔄 QUARTERLY WORKFLOW (Optional Deep Dive)**

**Every 3 months:**
1. Export all content from the quarter
2. Ask Claude to compare trends month-over-month
3. Identify which competitors are gaining momentum
4. Spot seasonal patterns for future planning

**Prompt for Claude:**
```
I'm giving you 3 months of competitor content data. 
Please analyze:
- How have content themes evolved over the quarter?
- Which competitors increased output in which pillars?
- What seasonal patterns do you see?
- What should I prepare for next quarter?
