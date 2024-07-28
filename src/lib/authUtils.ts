import { AuthFailureError, InternalError } from '../lib/ApiError';

export const getAccessToken = (authorization?: string) => {
    if (!authorization) throw new AuthFailureError('Invalid Authorization');
    if (!authorization.startsWith('Bearer ')) throw new AuthFailureError('Invalid Authorization');
    return authorization.split(' ')[1];
};
