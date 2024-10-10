// 3rd-party dependencies
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer, Server as SecureServer } from 'https';
import { Server } from 'http';
import fs from 'fs';

// src imports & config
import './config/env'
import { ENV, PORT } from './shared/constants'; //will also trigger dotenv config procedure
import logger from './config/logger';
import { initDatabase, closeConnection } from './config/database/db-factory'; // close db connection
import { errorMiddleware, notFoundMiddleware, responseFormatter, loggerMiddleware } from './shared/middlewares';
import { prepareDatabase } from './shared/migrations/store-json-data';


// app container 
const APP = express();
let server: Server | SecureServer | null = null;
if (ENV === 'dev') {
  server = APP.listen(PORT, () => {
    logger.info(`⚡️[server]: Server is running at http://localhost:${PORT} in ${ENV} mode`);
  });
}
else {
  // Load SSL certificates
  const sslOptions = {
    key: fs.readFileSync('./certs/privkey1.pem'),
    cert: fs.readFileSync('./certs/fullchain1.pem'),
  };
  server = createServer(sslOptions, APP);
  server.listen(PORT, () => {
    logger.info(`⚡️[server]: Server is running at https://localhost:${PORT} in ${ENV} mode`);
  });
}

(async () => {
  try {

    // middlewares
    APP.use(express.json())
    APP.use(express.urlencoded({ extended: true })); // no need for body-parser
    APP.use(cors(
      {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type, Authorization, Origin, X-Requested-With, Accept',
      },
    ));
    APP.use(helmet());
    APP.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
      }),
    );
    APP.set('trust proxy', 1); // trust nginx

    // middlewares & routes
    APP.use(loggerMiddleware)
    APP.use(responseFormatter)
    const { default: restRouter } = await import('./modules/routes');
    APP.use('/api/v0.1/', restRouter);
    APP.use(errorMiddleware);
    APP.use(notFoundMiddleware);

    await initDatabase(); // initialize db connections
    await prepareDatabase(); // run migrations

  } catch (error) {
    logger.error('Unable to connect,', error);
    process.exit(1);
  }
})();

// graceful shutdown
process.on('SIGINT', async () => {
  server!.close(() => {
    logger.info('Server closed gracefully');
    closeConnection().then(() => {
      process.exit(0);
    });
  });
});

export const APP_SERVER = APP; // exports for testing
export const SERVER = server; 