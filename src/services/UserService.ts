import User, { IUser } from '../models/User';
import { Request, Response } from 'express';
import { NotFoundResponse, SuccessResponse } from '../lib/ApiResponse';
import { parseUser, parseUsers } from '../utils/UserUtils';
import RoleModel from '../models/Role';
import Chat from '../models/Chat';
import Message from '../models/Messsage';
import generatePaginationData from '../utils/GeneratePaginationData';
import { ObjectId } from 'mongoose';

const getUsers = async (req: Request, res: Response) => {
    const keyword = req.query.search
        ? {
              $or: [
                  {
                      first_name: {
                          $regex: req.query.search,
                          $options: 'i'
                      }
                  },
                  {
                      last_name: {
                          $regex: req.query.search,
                          $options: 'i'
                      }
                  }
              ]
          }
        : {};
    return await User.find(keyword)
        .find({ _id: { $ne: req.query.user_id } })
        .then((data) => {
            return new SuccessResponse('success', parseUsers(data)).send(res);
        })
        .catch((err: any) => {
            return new NotFoundResponse('Not Found').send(res);
        });
};

const getUser = async (req: Request, res: Response) => {
    return await User.findById(req.params.id)
        .populate('roles')
        .then((data: IUser | null) => {
            if (!data) return new NotFoundResponse('Not Found').send(res);
            else {
                return new SuccessResponse('success', parseUser(data)).send(res);
            }
        });
};

const updateUser = async (req: Request, res: Response) => {
    const id = req.params.id;
    const payload = req.body;
    return await User.findByIdAndUpdate(id, payload).then((data: any) => {
        if (!data) return new NotFoundResponse('Not Found').send(res);
        else {
            return new SuccessResponse('success', parseUser(data)).send(res);
        }
    });
};

const deleteUser = async (req: Request, res: Response) => {
    const id = req.params.id;
    return await User.findByIdAndDelete(id).then((data: any) => {
        if (!data) return new NotFoundResponse('Not Found').send(res);
        else {
            return new SuccessResponse('success', parseUser(data)).send(res);
        }
    });
};

const getUsersRole = async (filter: any) => {
    return await RoleModel.find(filter).then((data: any) => {
        return data;
    });
};

const saveUserRole = async (req: Request, res: Response) => {
    const role = req.body;
    const roleObject = new RoleModel(role);
    await roleObject.save().then((data) => {
        return new SuccessResponse('success', data).send(res);
    });
};

const getUserChat = async (req: Request, res: Response) => {
    const { userId, myId } = req.body;
    if (!userId) {
        return new NotFoundResponse('User Not Found').send(res);
    }

    const isChat = await Chat.find({
        isGroupChat: false,
        $and: [{ users: { $elemMatch: { $eq: userId } } }, { users: { $elemMatch: { $eq: myId } } }]
    })
        .populate('users', '-password')
        .populate('lastMessage');

    const newChat = await User.populate(isChat, { path: 'lastMessage.sender' });

    if (newChat.length > 0) {
        return new SuccessResponse('success', newChat[0]).send(res);
    } else {
        const chatData = {
            chatName: 'sender',
            isGroupChat: false,
            users: [userId, myId]
        };
        try {
            const createChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({ _id: createChat._id }).populate('users', '-password');

            return new SuccessResponse('success', fullChat).send(res);
        } catch (error) {
            return new NotFoundResponse('Chat Not Found').send(res);
        }
    }
};

const getAllConversations = async (req: Request, res: Response) => {
    const { myId } = req.body;
    if (!myId) {
        return new NotFoundResponse('User Not Found').send(res);
    }

    Chat.find({
        users: { $elemMatch: { $eq: myId } }
    })
        .populate('users', '-password')
        .populate('groupAdmin', '-password')
        .populate('lastMessage')
        .sort({ updatedAt: -1 })
        .then(async (data) => {
            await User.populate(data, { path: 'lastMessage.sender' }).then(async (data) => {
                // count unread messages

                const unreadMessages = await Promise.all(
                    data.map(async (item: any) => {
                        const count = await Message.countDocuments({ chat: item._id, isRead: false, sender: { $ne: myId } });

                        return {
                            ...item._doc,
                            unreadMessages: count
                        };
                    })
                );

                return new SuccessResponse(
                    'success',
                    unreadMessages?.map((item: any) => {
                        item.users.map((user: any) => {
                            if (user._id == myId) return;
                            item.chatName = item.isGroupChat ? item.chatName : user.first_name + ' ' + user.last_name;
                            item.groupImage = user.image;
                        });

                        return item;
                    })
                ).send(res);
            });
        });
};

const sendMSG = async (req: Request, res: Response) => {
    try {
        const { chatId, content, myId } = req.body;

        // Check if required fields are provided
        if (!chatId || !content || !myId) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        // Create a new message
        const newMsg = {
            sender: myId,
            content: content,
            chat: chatId
        };

        // Create the message and populate sender field
        const message = await (await Message.create(newMsg)).populate('sender');

        // Populate the chat and its users
        const populatedMessage = await message.populate({
            path: 'chat',
            populate: {
                path: 'users'
            }
        });
console.log(populatedMessage)
        // Update the lastMessage field in the Chat model
        await Chat.findByIdAndUpdate(chatId, { lastMessage: populatedMessage });

        return new SuccessResponse('Message Send Successfully !', populatedMessage).send(res);
    } catch (error) {
        return new NotFoundResponse('Something went wrong. Please try again later. If the problem persists contact the administrator.').send(res);
    }
};

const allMSG = async (req: Request, res: Response) => {
    const { chatId, myId } = req.body;
    const skip: any = req.query.skip;
    const limit: any = req.query.limit;

    // Get the total count of messages for the chat
    const totalMessages = await Message.countDocuments({ chat: chatId });

    // Generate pagination data
    const paginationData = await generatePaginationData(req, totalMessages);

    const skipNumber = (skip - 1) * parseInt(limit);

    // Get the messages
    const messages = await Message.find({ chat: req.body.chatId }).populate('sender').populate('chat').sort({ createdAt: -1 }).skip(skipNumber).limit(limit);

    messages.reverse();

    const setMsg = messages.map((item: any) => {
        return {
            ...item._doc,
            sendByMe: item.sender._id == myId
        };
    });

    return new SuccessResponse('success', setMsg, paginationData).send(res);
};

const createGroupChat = async (req: Request, res: Response) => {
    try {
        const { userIds, myId, groupName } = req.body;

        // Check if required fields are provided
        if (!userIds || !myId || !groupName) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        if (userIds.length < 2) {
            return res.status(400).json({ error: 'Please select more than 2 users' });
        }

        const chatData = {
            chatName: groupName,
            isGroupChat: true,
            users: [...userIds, myId],
            groupAdmin: myId
        };

        const createChat = await Chat.create(chatData);
        const fullChat = await Chat.findOne({ _id: createChat._id }).populate('users', '-password');

        return new SuccessResponse('success', fullChat).send(res);
    } catch (error) {
        return new NotFoundResponse('Chat Not Found').send(res);
    }
};

const addMemberToGroup = async (req: Request, res: Response) => {
    try {
        const { userIds, myId, chatId } = req.body;

        // Check if required fields are provided
        if (!userIds || !myId || !chatId) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        // check if user is Admin of group
        const checkAdmin = await Chat.findOne({ _id: chatId, groupAdmin: myId });

        if (!checkAdmin) {
            return res.status(400).json({ error: 'You are not admin of this group' });
        }

        const newUsersList: any = [];

        // Use Promise.all with map to wait for all async operations to complete
        await Promise.all(
            userIds.map(async (item: any) => {
                const checkUser = await Chat.findOne({ _id: chatId, users: { $in: item } });

                if (checkUser === null) {
                    newUsersList.push(item);
                }
            })
        );

        // Now, newUsersList should contain the filtered users
        console.log(newUsersList);

        console.log(newUsersList);

        if (newUsersList.length < 1) {
            return res.status(400).json({ error: 'User already in group' });
        }

        const updateChat = await Chat.findByIdAndUpdate(chatId, { $push: { users: newUsersList } });

        if (!updateChat) {
            return new NotFoundResponse('Chat Not Found').send(res);
        }

        const fullChat = await Chat.findOne({ _id: updateChat?._id }).populate('users', '-password');

        return new SuccessResponse('success', fullChat).send(res);
    } catch (error) {
        return new NotFoundResponse('Chat Not Found').send(res);
    }
};

const mutualUserGroups = async (req: Request, res: Response) => {
    try {
        const { userId, myId } = req.body;

        // Check if required fields are provided
        if (!userId || !myId) {
            return new NotFoundResponse('Group Not Found').send(res);
        }

        const mutualGroups = await Chat.find({
            isGroupChat: true,
            $and: [{ users: { $elemMatch: { $eq: userId } } }, { users: { $elemMatch: { $eq: myId } } }]
        }).populate('users', '-password');

        return new SuccessResponse('success', mutualGroups).send(res);
    } catch (error) {
        return new NotFoundResponse('Group Not Found').send(res);
    }
};

export { getUsers, getUser, updateUser, deleteUser, getUsersRole, saveUserRole, getUserChat, getAllConversations, sendMSG, allMSG, createGroupChat, addMemberToGroup, mutualUserGroups };
