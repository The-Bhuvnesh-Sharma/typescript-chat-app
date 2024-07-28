import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import './config/MongoDB';
import Logger from './lib/Logger';
import router from './routes/route';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocs from './lib/swagger.json';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { NotFoundError, ApiError, InternalError, ErrorType } from './lib/ApiError';

const app = express();
const port = process.env.PORT || 3001; // Use port 3001 as a default if PORT is not specified in .env

import http from 'http';
import { initSocket } from './services/SocketService';
const server = http.createServer(app);

app.use((req, res, next) => {
    /** Log the Request */
    Logger.info(`Incoming Method: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
    res.on('finish', () => {
        /** Log the Response */
        Logger.info(`Outgoing Method: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`);
    });
    next();
});

// Middleware
app.use(express.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: false }));
// Cookie Parser
app.use(cookieParser());
// Cors
app.use(cors({ credentials: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Requested-With, Accept, Authorization');
    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, DELETE, PATCH, GET');
    }
    next();
});

/** Route */
app.use('/api/v1', router); // Removed trailing slash for consistency

/** Health Check */
app.get('/api/v1/ping', (req, res) => {
    res.status(200).json({ message: 'Pong' });
});

// catch 404 and forward to error handler
app.use((req, res, next) => next(new NotFoundError()));

/** Error Handling */
app.use((err: any, req: any, res: any, next: any) => {
    Logger.error(err);
    return res.status(404).json({ message: err.message });
});

/** Swagger Initialization */
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Unknown Routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        ApiError.handle(err, res);
        if (err.type === ErrorType.INTERNAL) Logger.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    } else {
        Logger.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        Logger.error(err);
        if (process.env.NODE_ENV === 'DEV') {
            return res.status(500).send(err);
        }
        ApiError.handle(new InternalError(), res);
    }
});

// Socket Code

const io = require('socket.io')(server, {
    // Pass 'server' here instead of 'http'
    pingTimeout: 60000,
    cors: {
        origin: ['http://localhost:3000', 'https://commun.northfoxgroup.in/', 'https://commun.northfoxgroup.in']
    }
});

initSocket(io);

server.listen(port, () => console.log(`Server running on port: ${port}`));
