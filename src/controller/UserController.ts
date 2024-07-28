import { Request, Response } from 'express';
import { addMemberToGroup, allMSG, createGroupChat, deleteUser, getAllConversations, getUser, getUserChat, getUsers, mutualUserGroups, sendMSG, updateUser } from '../services/UserService';
import asyncHandler from '../lib/asynchHandler';

const get = asyncHandler(async (req: Request, res: Response) => {
    return await getUser(req, res);
});
const update = asyncHandler(async (req: Request, res: Response) => {
    return await updateUser(req, res);
});
const remove = asyncHandler(async (req: Request, res: Response) => {
    return await deleteUser(req, res);
});
const getAll = asyncHandler(async (req: Request, res: Response) => {
    return await getUsers(req, res);
});

const getChat = asyncHandler(async (req: Request, res: Response) => {
    return await getUserChat(req, res);
});

const getAllConv = asyncHandler(async (req: Request, res: Response) => {
    return await getAllConversations(req, res);
});

const sendMessage = asyncHandler(async (req: Request, res: Response) => {
    return await sendMSG(req, res);
});

const allMessages = asyncHandler(async (req: Request, res: Response) => {
    return await allMSG(req, res);
});

const createGroup = asyncHandler(async (req: Request, res: Response) => {
    return await createGroupChat(req, res);
});

const addMember = asyncHandler(async (req: Request, res: Response) => {
    return await addMemberToGroup(req, res);
});

const mutualGroups = asyncHandler(async (req: Request, res: Response) => {
    return await mutualUserGroups(req, res);
});

export default { get, update, remove, getAll, getChat, getAllConv, sendMessage, allMessages, createGroup, addMember, mutualGroups };
