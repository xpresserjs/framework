import os from 'os';

export const getLocalExternalIp = (): string => {
    const values = Object.values(os.networkInterfaces());
    return ([].concat(...values as any[])
        .find((details: any) => details.family === 'IPv4' && !details.internal) as any)?.address;
};

