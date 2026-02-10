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
                    text: 'Content Volume by Pillar (Competito
