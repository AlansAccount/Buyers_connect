import express from 'express';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { 
  verifyLead,
  verifyAgent,
  verifyFirm
} from '../controllers/verificationController.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect, adminOnly);

router.put('/leads/:leadId', verifyLead);
router.put('/agents/:agentId', verifyAgent);
router.put('/firms/:firmId', verifyFirm);

export default router;