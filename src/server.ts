import express, { Request, Response } from 'express';
import socketIo from 'socket.io';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Action, ProjectData } from '@taskboar/model';

import { Model, errors } from './model';
import { Logger } from '../lib/log';

export interface Args {
  model: Model,
  logger: Logger,
}

export const HttpServer = ({ model, logger }: Args) => {
  const expressHttpServer = express();
  const baseHttpServer = require('http').createServer(expressHttpServer);
  const io = socketIo(baseHttpServer);

  io.origins('*:*'); // workaround cors
  io.on('connection', (socket) => {
  });

  expressHttpServer.use(cors());
  expressHttpServer.use(bodyParser.json());
  // expressHttpServer.post('/webhook', (req, res) => {
  // });


  // A request-middleware that extract that extracts the
  // a bearer token from the authorization header.
  // If none then it returns 401
  expressHttpServer.use((req: Request, res, next) => {
    const header = req.header('Authorization');
    if (!header) {
      return undefined;
    }

    const token = header.split(' ')[1];

    if (!token) {
      res.status(401).json();
      next();
    }

    req.app.set('token', token);
    next();
  });

  expressHttpServer.get('/projects', async (req, res, next) => {
    // ?owner={ownerId}
    const ownerId = req.query.owner as string;
    if (!ownerId) {
      res.status(404).json();
      next();
    }

    const token = req.app.get('token');

    try {
      const titles = await model.getPreviewsOfOwner(token, ownerId);
      res.status(200).json(titles);
    } catch (error) {
      handleError(error, res);
      next();
    }
  });

  expressHttpServer.post('/projects', async (req, res, next) => {
    const token = req.app.get('token');

    const { title } = req.body;

    try {
      const id = await model.createProject(token, title);
      res.status(200).json(id);
    } catch (error) {
      handleError(error, res);
      next();
    }
  });

  expressHttpServer.get('/projects/:id', async (req, res, next) => {
    const token = req.app.get('token');

    const { id } = req.params;

    try {
      const project = await model.getProject(token, id);

      if (!project) {
        res.status(404).send();
      }

      res.status(200).json(project);
    } catch (error) {
      handleError(error, res);
      next();
    }
  });

  expressHttpServer.patch('/projects/:id', async (req, res, next) => {
    const token = req.app.get('token');

    const { id } = req.params;
    const action = req.body as Action<ProjectData>;

    try {
      await model.updateProjectData(token, id, action);
      res.status(200).send();
    } catch (error) {
      handleError(error, res);
      next();
    }
  });

  expressHttpServer.use((req, res) => {
    if (res.statusCode === 500) {
      logger.error(res.locals.errorMessage)
    }
  });

  return expressHttpServer;
};

function handleError(error: Error, res: Response) {
  const status = ({
    [errors.DNE]: 404,
    [errors.UNAUTHORIZED]: 400,
  })[error.message] || 500;

  res.locals.errorMessage = error.message;
  res.status(status);
}
