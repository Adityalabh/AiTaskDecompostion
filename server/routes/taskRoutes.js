import express from 'express';
import { handleDecomposition, startExecution } from '../controllers/taskController.js';

const router = express.Router();

router.get('/test', (req, res) => {
  res.json("server running");
});

router.post('/decompose', handleDecomposition);
router.post('/execute', startExecution); // New route

export default router;