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
