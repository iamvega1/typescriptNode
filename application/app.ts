import express, { Application, RequestHandler, ErrorRequestHandler } from 'express';
import * as Sentry from '@sentry/node';
import morgan from 'morgan';
import logger from './utils/logger'

import connection from './models/db-connection'
// Import Routes
//import IndexRoutes from './routes/index';

export class App {
    private app: Application;

    constructor() {
        this.app = express();
        this.settings();
    }

    private addRoutes(): void {
        //this.app.use(IndexRoutes);
    }

    private settings(): void{
        const SENTRY_DSN = process.env.SENTRY_DSN;
        
        if(!process.env.PRODUCTION) this.app.use(morgan('dev'));
        Sentry.init({ dsn: SENTRY_DSN });
        this.app.use(Sentry.Handlers.requestHandler() as RequestHandler);
        this.addRoutes();
        this.app.use(Sentry.Handlers.errorHandler() as ErrorRequestHandler);

        connection.authenticate()
            .then(() => logger.info('Database connected...'))
            .catch((err: any) => logger.error('The error was: ', err) );
    }

    

    async listen(): Promise<void> {
        const PORT = process.env.PORT_APP || 3000;
        await this.app.listen(PORT);
        logger.info(`Server on port ${PORT}`);
    }
}