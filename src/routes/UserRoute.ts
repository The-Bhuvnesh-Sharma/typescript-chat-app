import express from 'express';
const router = express.Router();
import users from '../controller/UserController';

router.get('/list', users.getAll);

router.post('/newChat', users.getChat);

router.post('/chats', users.getAllConv);

router.post('/sendMessage', users.sendMessage);

router.post('/allMessages', users.allMessages);

router.post('/create-group', users.createGroup);

router.post('/add-member', users.addMember);

router.post('/mutual-groups', users.mutualGroups);

export = router;
