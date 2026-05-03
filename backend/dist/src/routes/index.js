import { Router } from 'express';
import userRoutes from './user.routes.js';
import dropRoutes from './drop.routes.js';
import authRoutes from './auth.routes.js';
const router = Router();
const defaultRoutes = [
    {
        path: '/users',
        route: userRoutes,
    },
    {
        path: '/drops',
        route: dropRoutes,
    },
    {
        path: '/auth',
        route: authRoutes,
    },
];
defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
export default router;
