import _ from 'lodash';

export const USERDATA = ['firstName', 'lastName', 'email', 'phone', 'roles', 'verified', 'status', 'avatar', 'createdAt'];

export const USERSDATA = ['_id', 'first_name', 'last_name', 'email', 'image', 'createdAt'];

export const parseUser = (data: any) => {
    return _.pick(data, USERDATA);
};

export const parseUsers = (data: any) => {
    return _.map(data, _.partialRight(_.pick, USERSDATA));
};

export const parseLogin = (data: any, token: any) => {
    const profile = _.pick(data, USERSDATA);
    return { profile, token };
};
