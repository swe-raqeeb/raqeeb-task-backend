
import { Router } from 'express';
import RecordsController from './records/records.controller';

const restRouter = Router();
for (const controller of [
    RecordsController,
]) {
    const instance = new controller();
    restRouter.use('/', instance.router);
}

export default restRouter;