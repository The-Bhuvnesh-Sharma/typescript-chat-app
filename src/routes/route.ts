import express from 'express';
import http from 'http';
import userRoute from './UserRoute';
import authRoute from './AuthRoute';
import roleRoute from './RoleRoute';

const router = express();
router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/roles', roleRoute);

export = router;
