import pool from '../config/db.js';
import asyncHandler from 'express-async-handler';

// Verify a lead user
export const verifyLead = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  const { verified, notes } = req.body;

  await pool.query(
    `UPDATE users 
     SET verified = $1, verification_notes = $2, verified_at = NOW()
     WHERE id = $3 AND role = 'buyer'`,
    [verified, notes, leadId]
  );

  res.json({ message: 'Lead verification status updated' });
});

// Verify an agent
export const verifyAgent = asyncHandler(async (req, res) => {
  const { agentId } = req.params;
  const { verified, notes } = req.body;

  await pool.query(
    `UPDATE agents 
     SET license_verified = $1, verification_notes = $2, verified_at = NOW()
     WHERE id = $3`,
    [verified, notes, agentId]
  );

  res.json({ message: 'Agent verification status updated' });
});

// Verify a firm
export const verifyFirm = asyncHandler(async (req, res) => {
  const { firmId } = req.params;
  const { verified, notes } = req.body;

  await pool.query(
    `UPDATE firms 
     SET verified = $1, verification_notes = $2, verified_at = NOW()
     WHERE id = $3`,
    [verified, notes, firmId]
  );

  res.json({ message: 'Firm verification status updated' });
});