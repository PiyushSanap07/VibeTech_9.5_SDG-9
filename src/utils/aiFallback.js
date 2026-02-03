/**
 * Utility functions to generate mock data when AI services are unavailable.
 * This ensures the frontend doesn't break when the API quota is exhausted.
 */

export const getMockProfileHelp = (domain, skills) => {
    return {
        bio: `Dynamic professional specializing in ${domain || 'Innovation'} with expertise in ${skills?.[0] || 'strategic development'}. Proven track record of driving impactful projects and fostering sustainable growth. Dedicated to leveraging cutting-edge solutions to solve complex challenges.`,
        suggestedSkills: ['Strategic Planning', 'Project Management', 'Data Analysis', 'Leadership', 'Innovation Management']
    };
};

export const getMockInvestmentStrategy = (preferences) => {
    const domain = preferences?.domains?.[0] || 'Tech';
    return {
        domains: [domain, 'Sustainable Energy', 'AI & Automation'],
        rationale: `Based on your interest in ${domain} and balanced risk profile, we recommend diversifying into emerging sustainable technologies which show strong long-term growth potential.`
    };
};

export const getMockProposalAnalysis = (proposalId) => {
    return {
        score: 85,
        summary: "This proposal shows strong alignment with current market trends. The technical feasibility is high, though the go-to-market strategy could be more detailed.",
        strengths: ["Innovative technical approach", "Experienced team", "Clear scalability potential"],
        weaknesses: ["Competitive landscape analysis is brief", "Initial budget requirements are high"],
        verdict: "Recommended for further due diligence."
    };
};

export const getMockRiskAssessment = (proposalId) => {
    return {
        level: "Medium",
        factors: [
            { name: "Market Risk", score: 60, description: "Moderate competition in the target sector." },
            { name: "Technical Risk", score: 40, description: "Proven technology stack, low implementation risk." },
            { name: "Financial Risk", score: 55, description: "Steady cash flow projections but dependent on initial adoption." }
        ]
    };
};

export const getMockFunderRecommendations = (funders) => {
    // Return random 3 funders as matches with high scores
    const shuffled = [...funders].sort(() => 0.5 - Math.random());
    const matches = shuffled.slice(0, 3).map(f => ({
        funderId: f.id,
        matchScore: Math.floor(Math.random() * (98 - 85 + 1)) + 85,
        matchReason: `High alignment with your domain interests. ${f.name} has a strong track record in this sector.`
    }));
    return matches;
};

export const getMockFundUtilization = () => {
    return {
        timingWarnings: ["AI projects show 30% higher completion rate in this portfolio.", "Funds are being deployed 15% faster than industry average."]
    };
};

export const getMockProposalRankings = (proposals) => {
    return proposals.map(p => ({
        id: p.id,
        matchScore: Math.floor(Math.random() * (99 - 75 + 1)) + 75,
        reason: "Strong strategic fit based on your past investment patterns."
    }));
};

export const getMockPortfolioAnalytics = (investments) => {
    return {
        generalInsight: "Your portfolio is well-balanced across high-growth sectors. Consider increasing exposure to Green Energy to maximize long-term returns.",
        projects: investments.map(p => ({
            id: p.id,
            successProbability: Math.floor(Math.random() * (95 - 70 + 1)) + 70,
            isAtRisk: Math.random() < 0.2 // 20% chance of being at risk
        }))
    };
};
