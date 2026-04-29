import { Router } from 'express';
import * as dropController from '../controllers/drop.controller.js';
const router = Router();
router.post('/initialize', dropController.initializeDrop);
router.get('/', dropController.getDashboardDrops);
export default router;
