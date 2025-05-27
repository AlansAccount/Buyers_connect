/*
  # Matchmaking System Schema

  1. New Tables
    - `agent_preferences` - Stores agent matching criteria
      - `id` (uuid, primary key)
      - `agent_id` (references agents)
      - `min_budget` (numeric)
      - `max_budget` (numeric) 
      - `preferred_locations` (text[])
      - `specialties` (text[])
      - `languages` (text[])
      - `created_at` (timestamp)

    - `lead_matches`
      - `id` (uuid, primary key) 
      - `lead_id` (references users)
      - `agent_id` (references agents)
      - `questionnaire_id` (references buyer_questionnaires)
      - `match_score` (numeric)
      - `status` (enum)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

-- Create agent preferences table
CREATE TABLE IF NOT EXISTS agent_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  min_budget numeric,
  max_budget numeric,
  preferred_locations text[],
  specialties text[],
  languages text[],
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_budget CHECK (min_budget <= max_budget)
);

-- Create lead matches table
CREATE TABLE IF NOT EXISTS lead_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES users(id),
  agent_id uuid REFERENCES agents(id),
  questionnaire_id uuid REFERENCES buyer_questionnaires(id),
  match_score numeric,
  status text CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE agent_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_preferences
CREATE POLICY "Agents can view own preferences"
  ON agent_preferences
  FOR SELECT
  TO authenticated
  USING (agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid()));

CREATE POLICY "Agents can update own preferences"
  ON agent_preferences
  FOR UPDATE
  TO authenticated
  USING (agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid()));

-- RLS Policies for lead_matches
CREATE POLICY "Users can view own matches"
  ON lead_matches
  FOR SELECT
  TO authenticated
  USING (
    lead_id = auth.uid() OR 
    agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid())
  );

CREATE POLICY "System can create matches"
  ON lead_matches
  FOR INSERT
  TO authenticated
  WITH CHECK (true);