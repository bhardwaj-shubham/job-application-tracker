const transformAnalysisForDB = (geminiAnalysis) => {
  return {
    matchScore: geminiAnalysis.matchScore,
    summary: geminiAnalysis.summary,

    matchingSkills: geminiAnalysis.matchingSkills,

    missingSkills: geminiAnalysis.missingSkills,

    relevantExperience: geminiAnalysis.relevantExperience,

    resumeImprovements: geminiAnalysis.resumeImprovements,

    keywordSuggestions: geminiAnalysis.keywordSuggestions,

    strengths: geminiAnalysis.strengths,

    concerns: geminiAnalysis.concerns,
  };
};

export { transformAnalysisForDB };
