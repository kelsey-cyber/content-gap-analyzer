// AI Analysis Engine

let isAnalyzing = false;

// Run full gap analysis
async function runGapAnalysis() {
    if (isAnalyzing) {
        alert('Analysis already in progress...');
        return;
    }
    
    // Get Claude API key
    const settings = await settingsRef.doc('app-config').get();
    const apiKey = settings.data()?.claudeApiKey;
    
    if (!apiKey) {
        alert('Please add your Claude API key in Settings first!');
        switchTab('settings');
        return;
    }
    
    isAnalyzing = true;
    document.getElementById('loadingAnalysis').style.display = 'block';
    document.getElementById('reportContainer').style.display = 'none';
    document.getElementById('noDataMessage').style.display = 'none';
    
    try {
        // Step 1: Get all content from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const snapshot = await contentItemsRef
            .where('publishDate', '>=', thirtyDaysAgo)
            .get();
        
        if (snapshot.empty) {
            alert('No content found in the last 30 days. Add some content or wait for automated collection to run.');
            isAnalyzing = false;
            document.getElementById('loadingAnalysis').style.display = 'none';
            document.getElementById('noDataMessage').style.display = 'block';
            return;
        }
        
        // Step 2: Categorize uncategorized content
        const contentItems = [];
        const pillars = settings.data()?.contentPillars || [];
        
        for (const doc of snapshot.docs) {
            const data = doc.data();
            
            // If not analyzed, categorize it
            if (!data.analyzed) {
                const category = await categorizeContent(apiKey, data, pillars);
                
                // Update document
                await contentItemsRef.doc(doc.id).update({
                    pillar: category.pillar,
                    pillarConfidence: category.confidence,
                    themes: category.themes,
                    analyzed: true
                });
                
                contentItems.push({
                    id: doc.id,
                    ...data,
                    pillar: category.pillar,
                    themes: category.themes
                });
            } else {
                contentItems.push({
                    id: doc.id,
                    ...data
                });
            }
        }
        
        // Step 3: Organize content by pillar and competitor
        const organizedContent = organizeContentByPillar(contentItems);
        
        // Step 4: Generate gap analysis with Claude
        const gapReport = await generateGapReport(apiKey, organizedContent, pillars);
        
        // Step 5: Save report to Firebase
        await gapReportsRef.add({
            generatedDate: firebase.firestore.FieldValue.serverTimestamp(),
            dateRange: {
                start: thirtyDaysAgo,
                end: new Date()
            },
            pillarAnalysis: gapReport.pillarAnalysis,
            executiveSummary: gapReport.executiveSummary,
            topGaps: gapReport.topGaps,
            trendingThemes: gapReport.trendingThemes,
            recommendedContent: gapReport.recommendedContent
        });
        
        // Step 6: Display report
        displayGapReport(gapReport);
        
    } catch (error) {
        console.error('Analysis error:', error);
        alert('Error running analysis: ' + error.message);
    } finally {
        isAnalyzing = false;
        document.getElementById('loadingAnalysis').style.display = 'none';
    }
}

// Categorize single content item with Claude
async function categorizeContent(apiKey, content, pillars) {
    const prompt = `You are analyzing content from natural body care and bath product brands.

Content Pillars:
${pillars.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Analyze this content and assign it to ONE primary pillar. Also extract 2-5 theme keywords.

Content:
Platform: ${content.platform}
Title: ${content.title}
Body: ${content.content || 'No content available'}

Return ONLY valid JSON (no markdown, no explanation):
{
  "pillar": "exact pillar name from list above",
  "confidence": 0.85,
  "themes": ["theme1", "theme2", "theme3"]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            messages: [{
                role: 'user',
                content: prompt
            }]
        })
    });
    
    const data = await response.json();
    const text = data.content[0].text;
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if parsing fails
    return {
        pillar: pillars[0],
        confidence: 0.5,
        themes: ['uncategorized']
    };
}

// Organize content by pillar
function organizeContentByPillar(contentItems) {
    const organized = {};
    
    contentItems.forEach(item => {
        const pillar = item.pillar || 'Uncategorized';
        if (!organized[pillar]) {
            organized[pillar] = [];
        }
        
        const competitor = currentCompetitors.find(c => c.id === item.competitorId);
        organized[pillar].push({
            ...item,
            competitorName: competitor?.name || 'Unknown'
        });
    });
    
    return organized;
}

// Generate full gap report with Claude
async function generateGapReport(apiKey, organizedContent, pillars) {
    const contentSummary = Object.entries(organizedContent).map(([pillar, items]) => {
        const byCompetitor = {};
        items.forEach(item => {
            if (!byCompetitor[item.competitorName]) {
                byCompetitor[item.competitorName] = [];
            }
            byCompetitor[item.competitorName].push({
                title: item.title,
                platform: item.platform,
                themes: item.themes
            });
        });
        
        return {
            pillar,
            totalItems: items.length,
            byCompetitor
        };
    });
    
    const prompt = `You are a content strategist for a natural body care brand analyzing competitive content gaps.

Your brand's content pillars:
${pillars.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Competitor content from the last 30 days (organized by pillar):
${JSON.stringify(contentSummary, null, 2)}

Analyze and provide:
1. Executive summary (2-3 sentences)
2. Top 3 content gaps with specific recommendations
3. Trending themes across all content
4. Recommended content for next 30/60/90 days

Return ONLY valid JSON (no markdown):
{
  "executiveSummary": "text here",
  "topGaps": [
    {
      "pillar": "pillar name",
      "gap": "description of gap",
      "recommendation": "specific content idea",
      "competitorExamples": ["competitor name doing this well"]
    }
  ],
  "trendingThemes": ["theme1", "theme2", "theme3"],
  "recommendedContent": [
    {
      "title": "content idea",
      "pillar": "pillar name",
      "timeframe": "30 days",
      "rationale": "why this content"
    }
  ],
  "pillarAnalysis": {
    "Pillar Name": {
      "competitorAverage": 10,
      "topCompetitors": ["name1", "name2"],
      "recommendation": "what to do about this pillar"
    }
  }
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 3000,
            messages: [{
                role: 'user',
                content: prompt
            }]
        })
    });
    
    const data = await response.json();
    const text = data.content[0].text;
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse Claude response');
}

// Attach to run analysis button
document.getElementById('runAnalysis').addEventListener('click', runGapAnalysis);
