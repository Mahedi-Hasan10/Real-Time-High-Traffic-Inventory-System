import { Router } from 'express';
import userRoutes from './user.routes.js';

const router = Router();

const defaultRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
