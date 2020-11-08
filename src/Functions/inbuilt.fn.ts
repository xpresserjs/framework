import os from 'os';

export const getLocalExternalIp = (): string => {
    const values = Object.values(os.networkInterfaces());
    return ([].concat(...values as any[])
        .find((details: any) => details.family === 'IPv4' && !details.internal) as any)?.address;
};

export const randomStr = (length): string => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

