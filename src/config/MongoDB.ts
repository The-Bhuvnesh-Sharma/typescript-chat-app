import 'dotenv/config';
import mongoose from 'mongoose';
import Logger from '../lib/Logger';
const MONGODB_URI: string = process.env.MONGODB_URI!;

const connection = mongoose.createConnection(MONGODB_URI);
const options = {
    autoIndex: true, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};
mongoose
    .connect(MONGODB_URI, options)
    .then(() => {
        Logger.info(`Mongo DB Connected!!!. ${MONGODB_URI}`);
    })
    .catch((error) => {
        Logger.error(error);
    });

export default connection;
