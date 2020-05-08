import express from 'express';
import { App } from '../app';

export const handlers = (app: App) => {
  const router = express.Router();
  return router;
};
