import express from 'express';
import {
  getTasks,
  getTask,
  getTasksByStatus,
  getTasksByPriority,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  searchTasks,
  debugTasks
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Debug route
router.get('/debug', debugTasks);

// Task routes - specific routes first
router.get('/search', searchTasks);
router.get('/status/:status', getTasksByStatus);
router.get('/priority/:priority', getTasksByPriority);

// Generic routes
router.route('/')
  .get(getTasks)
  .post(createTask);

// ID-specific routes last
router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

export default router;