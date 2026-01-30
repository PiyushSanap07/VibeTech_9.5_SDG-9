const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

admin.initializeApp();
setGlobalOptions({ 
  maxInstances: 10,
  region: "us-central1"
});

// Helper to call Gemini
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY.value();
  
  if (!apiKey || apiKey === "dummy_key") {
    console.error("CRITICAL ERROR: GEMINI_API_KEY is not set in functions/.env.local or Secrets Manager");
    throw new HttpsError("internal", "AI Configuration Error: API Key missing");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
    
    console.log("Calling Gemini AI (gemini-2.5-flash)...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Gemini non-JSON response:", text);
      throw new Error("AI returned invalid data format. Please try again.");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini Execution Error:", error);
    throw new HttpsError("internal", error.message || "AI processing failed");
  }
}

// 0. Debug Ping Function
exports.ping = onCall({ cors: true }, async (request) => {
  return { status: "online", message: "Backend is reachable!", timestamp: new Date().toISOString() };
});

// 1. Suggest Investment Domains & Budget
exports.suggestInvestmentStrategy = onCall({ cors: true, secrets: [GEMINI_API_KEY] }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "User must be logged in");
  
  const { preferences } = request.data;
  const prompt = `As an AI investment advisor for an R&D platform, suggest 3 optimal investment domains and a balanced budget allocation for a funder with these preferences: ${JSON.stringify(preferences)}. Return response in JSON format: { "domains": [], "budgetAllocation": { "domain": percentage }, "rationale": "" }`;
  
  return await callGemini(prompt);
});

// 2. AI Matching - Rank Proposals
exports.rankProposals = onCall({ cors: true, secrets: [GEMINI_API_KEY] }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "User must be logged in");
  
  const { funderPrefs, proposals } = request.data;
  const prompt = `Match the following R&D proposals to the funder's investment preferences.
  
  FUNDER PREFERENCES:
  ${JSON.stringify(funderPrefs)}
  
  PROPOSALS TO RANK:
  ${JSON.stringify(proposals)}
  
  TASK:
  Rank these proposals. For each one, provide:
  1. matchScore: (Integer 0-100) how well it fits preferences.
  2. riskAlignmentScore: (Integer 0-100) how it fits the risk appetite.
  3. roiPotential: (String: "High", "Medium", or "Low").
  4. matchReason: (String: 1-sentence explanation).
  
  IMPORTANT: Return ONLY a valid JSON array of objects. No markdown, no preamble.
  FORMAT: [ { "id": "proposalId", "matchScore": 85, "riskAlignmentScore": 70, "roiPotential": "High", "matchReason": "..." } ]`;
  
  return await callGemini(prompt);
});

// 3. Proposal Review - Summarize and Flag
exports.reviewProposal = onCall({ cors: true, secrets: [GEMINI_API_KEY] }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "User must be logged in");
  
  const { proposal } = request.data;
  const prompt = `Review this R&D proposal and provide a summary, strengths, weaknesses, and flag high-risk sections.
  Proposal: ${JSON.stringify(proposal)}
  
  Return JSON: { "summary": "", "strengths": [], "weaknesses": [], "risks": { "budget": "Low/Med/High", "timeline": "", "feasibility": "" } }`;
  
  return await callGemini(prompt);
});

// 4. Decision Support
exports.getDecisionSupport = onCall({ cors: true, secrets: [GEMINI_API_KEY] }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "User must be logged in");
  
  const { proposal, funderPrefs } = request.data;
  const prompt = `Provide a decision recommendation (Accept/Reject) for this proposal based on funder preferences.
  Proposal: ${JSON.stringify(proposal)}
  Funder Prefs: ${JSON.stringify(funderPrefs)}
  
  Return JSON: { "recommendation": "Accept", "confidenceScore": 90, "rationale": "" }`;
  
  return await callGemini(prompt);
});

// 5. Portfolio Analytics & Insights
exports.getPortfolioInsights = onCall({ cors: true, secrets: [GEMINI_API_KEY] }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "User must be logged in");
  
  const { investments } = request.data;
  const prompt = `Analyze this investment portfolio and provide insights.
  Investments: ${JSON.stringify(investments)}
  
  Provide:
  - successProbability for each project
  - At-risk flags
  - Overall portfolio insight string
  
  Return JSON: { "projects": [ { "id": "", "successProbability": 80, "isAtRisk": false } ], "generalInsight": "" }`;
  
  return await callGemini(prompt);
});

// 6. Milestone Approval Assistance
exports.reviewMilestone = onCall({ cors: true, secrets: [GEMINI_API_KEY] }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "User must be logged in");
  
  const { milestone, projectPlan } = request.data;
  const prompt = `Review this milestone submission against the project plan.
  Submission: ${JSON.stringify(milestone)}
  Project Plan: ${JSON.stringify(projectPlan)}
  
  Return JSON: { "summary": "", "progressPercentage": 0, "isAligned": true, "riskWarnings": [] }`;
  
  return await callGemini(prompt);
});

// 7. Funding & Escrow Monitoring
exports.predictFundUtilization = onCall({ cors: true, secrets: [GEMINI_API_KEY] }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "User must be logged in");
  
  const { escrowData, milestones } = request.data;
  const prompt = `Predict fund utilization efficiency and suggest release timing warnings based on these milestones.
  Escrow Data: ${JSON.stringify(escrowData)}
  Milestones: ${JSON.stringify(milestones)}
  
  Return JSON: { "utilizationEfficiency": 0.85, "timingWarnings": [], "predictedReleaseDates": {} }`;
  
  return await callGemini(prompt);
});
