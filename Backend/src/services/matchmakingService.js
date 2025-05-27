import pool from '../config/db.js';

const calculateMatchScore = async (questionnaire, agent) => {
  let score = 0;
  const weights = {
    budget: 30,
    location: 25,
    propertyType: 20,
    languages: 15,
    experience: 10
  };

  // Budget match (within agent's range)
  if (agent.min_budget <= questionnaire.budget && agent.max_budget >= questionnaire.budget) {
    score += weights.budget;
  }

  // Location match
  if (agent.preferred_locations.includes(questionnaire.location)) {
    score += weights.location;
  }

  // Property type match
  if (agent.specialties.includes(questionnaire.property_main_type)) {
    score += weights.propertyType;
  }

  // Language match
  const commonLanguages = questionnaire.languages_spoken.filter(lang => 
    agent.languages.includes(lang)
  );
  if (commonLanguages.length > 0) {
    score += weights.languages;
  }

  // Experience score (normalized to 10)
  const experienceScore = Math.min(agent.experience_years / 10, 1) * weights.experience;
  score += experienceScore;

  return score;
};

export const findMatches = async (questionnaireId) => {
  // Get questionnaire details
  const questionnaireResult = await pool.query(
    'SELECT * FROM buyer_questionnaires WHERE id = $1',
    [questionnaireId]
  );
  const questionnaire = questionnaireResult.rows[0];

  // Get all verified agents with their preferences
  const agentsResult = await pool.query(`
    SELECT 
      a.*,
      ap.min_budget,
      ap.max_budget,
      ap.preferred_locations,
      ap.specialties,
      ap.languages
    FROM agents a
    JOIN agent_preferences ap ON a.id = ap.agent_id
    WHERE a.license_verified = true
  `);

  const matches = [];
  for (const agent of agentsResult.rows) {
    const score = await calculateMatchScore(questionnaire, agent);
    if (score > 50) { // Only include matches above 50%
      matches.push({
        agentId: agent.id,
        score,
        questionnaireId
      });
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);

  // Store top matches
  const topMatches = matches.slice(0, 5);
  for (const match of topMatches) {
    await pool.query(
      `INSERT INTO lead_matches (lead_id, agent_id, questionnaire_id, match_score, status)
       VALUES ($1, $2, $3, $4, 'pending')`,
      [questionnaire.user_id, match.agentId, match.questionnaireId, match.score]
    );
  }

  return topMatches;
};

export default findMatches