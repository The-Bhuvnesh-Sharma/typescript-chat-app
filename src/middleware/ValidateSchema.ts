import Joi, { ObjectSchema } from 'joi';
import { NextFunction, Response, Request } from 'express';
import Logger from '../lib/Logger';
import { IUser } from '../models/User';
import 'dotenv/config';
const ACCESS_TOKEN_PUBLIC_KEY: string = process.env.ACCESS_TOKEN_PUBLIC_KEY!;
const REFRESH_TOKEN_SECRET: string = process.env.REFRESH_TOKEN_SECRET!;

export const ValidateSchema = (schema: ObjectSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validateAsync(req.body);
            next();
        } catch (error) {
            Logger.error(error);
            return res.status(422).json({ error });
        }
    };
};

export const Schemas = {
    user: {
        create: Joi.object<IUser>({
            first_name: Joi.string().required(),
            email: Joi.string().min(3).email().required(),
            last_name: Joi.string().required()
        }),
        update: Joi.object<IUser>({
            email: Joi.string().required()
        })
    }
};
