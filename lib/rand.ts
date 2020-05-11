import { v4 } from 'uuid';

export const randomString = () => Math.random().toString(36).slice(-5);

export const uuid = v4;
