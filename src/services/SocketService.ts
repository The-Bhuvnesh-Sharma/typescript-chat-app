import User from '../models/User';
import Chat from '../models/Chat';
import moment from 'moment';
import Messsage from '../models/Messsage';

// export one function to be used in the server.ts file
export function initSocket(io: any) {
    io.on('connection', (socket: any) => {
        socket.on('setup', (userId: any) => {
            socket.join(userId.myId);

            handleStatus(userId.myId, 1);

            socket.emit('connected');
        });

        socket.on('join chat', async (room: any, userId: any) => {
            socket.join(room);
            const onlineUsers = await handleOnlineUsers(room, userId);
            socket.emit('online user', onlineUsers);
        });

        socket.on('typing', async (room: any) => {
            socket.in(room.chatId).emit('typing', { user: room.userId, chatId: room.chatId });
            const onlineUsers = await handleOnlineUsers(room.chatId, room.userId);
            socket.emit('online user', onlineUsers);
        });

        socket.on('stop typing', (room: any) => {
            socket.in(room.chatId).emit('stop typing', room.userId);
        });

        socket.on('new message', (newMessage: any) => {
            const chat = newMessage.chat;

            if (!chat.users) return console.log('Chat.users not defined');

            chat.users.forEach((user: any) => {
                if (user._id == newMessage.sender._id) return;

                socket.in(user._id).emit('message received', newMessage);
            });
        });

        // read all messages in chat
        socket.on('read message', (room: any) => {
            const nowTime = moment();

            // update all messages which have chatId
            Messsage.updateMany({ chat: room.chatId, sender: { $ne: room.userId }, isRead: false, createdAt: { $lt: nowTime } }, { $set: { isRead: true } }).then((result) => {
                socket.in(room.chatId).emit('read message', { chatId: room.chatId, userId: room.userId });
            });
        });

        socket.on('create chat', (chat: any) => {
            const users = chat.users;

            console.log('create group', users);

            if (!users) return console.log('Users not defined');

            users.forEach((user: any) => {
                socket.in(user).emit('chat created', chat);
            });
        });

        socket.on('close', (userId: any) => {
            console.log('User disconnected', userId);
            socket.leave(userId);
            handleStatus(userId, 0);
        });
    });
}

const handleStatus = async (userId: any, status: any) => {
    await User.findByIdAndUpdate(userId, { status: status, last_seen: status === 0 ? new Date() : null }).then((res) => {
        console.log('Status updated');
    });
};

const handleOnlineUsers = async (room: any, userId: any) => {
    let onlineUser = false;

    const chats = await Chat.findOne({ _id: room }).populate('users');

    const newList = chats?.users.forEach((user: any) => {
        if (user._id == userId) return;
        if (user.status == 1) {
            onlineUser = true;
        }
    });

    return onlineUser;
};
