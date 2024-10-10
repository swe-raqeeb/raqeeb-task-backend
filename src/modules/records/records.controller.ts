// file dependinces
import { Controller } from '../../shared/interfaces/controller.interface';
import { InternalServerException, InvalidEnumValueException } from '../../shared/exceptions';
import logger from '../../config/logger';
import { OrderEnum, StatusEnum } from '../../shared/enums';
import { IFilterOptions, IRecordsPayload, IRecordsResponse } from './records.interface';
import RecordsService from './records.service';
import { querySchema, searchSchema } from './records.dto';
import { validate } from '../../shared/middlewares';
import { Record } from '../../shared/models/record';

// 3rd party dependencies
import express, { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';


export default class RecordsController implements Controller {
    router = express.Router();
    private _recordsService = new RecordsService(Record);
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.get(`/records`, validate(querySchema, "query"), this.getRecords);
        this.router.post(`/search`, validate(searchSchema, "body"), this.searchRecords);
    }

    public getRecords = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payload = await this._preparePayload(req, false);
            res.setHeader('Content-Type', 'application/json');
            const response: IRecordsResponse = await this._recordsService.getRecords(payload);
            return res.status(StatusCodes.OK).json(response);

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error('Error fetching records', error);
            if (error instanceof InvalidEnumValueException) {
                return next(error);
            }
            return next(new InternalServerException(error.message));
        }
    }

    public searchRecords = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payload = await this._preparePayload(req, true);
            res.setHeader('Content-Type', 'application/json');
            const response: IRecordsResponse = await this._recordsService.searchRecords(payload);
            return res.status(StatusCodes.OK).json(response).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error('Error searching records', error);
            return next(new InternalServerException(error.message));
        }
    }

    private async _preparePayload(req: Request, isSearch: boolean): Promise<IRecordsPayload> {
        const { page = 1, limit = 10, sortBy = 'created_at', order = OrderEnum.ASC, status, username, leaked_sources, start, end, search } = isSearch ? req.body : req.query;
        const sortOrder: 1 | -1 = order === OrderEnum.DESC ? -1 : 1;
        const skip = (Number(page) - 1) * Number(limit);

        // Build query filters based on query parameters
        const filters: IFilterOptions = {};
        if (status) {
            if (!Object.values(StatusEnum).includes(status as StatusEnum)) {
                throw new InvalidEnumValueException('status');
            }
            filters.status = isSearch ? req.body.status as StatusEnum : req.query.status as StatusEnum;
        }
        if (username) {
            filters.username = { $regex: isSearch ? req.body.username : req.query.username, $options: 'i' } as { $regex: string, $options: string }; // Case-insensitive search
        }
        if (leaked_sources) {
            filters.leaked_sources = Number(isSearch ? req.body.leaked_sources : req.query.leaked_sources);
        }

        // Check for start and end date range for created_at
        if (start || end) {
            filters.created_at = {};
            if (start) {
                filters.created_at.$gte = new Date(isSearch ? req.body.start : req.query.start as string);
            }
            if (end) {
                filters.created_at.$lte = new Date(isSearch ? req.body.end : req.query.end as string);
            }
        }

        const response = {
            skip,
            limit: Number(limit),
            sortBy: sortBy as string,
            order: sortOrder,
            filterOptions: filters,
        } as IRecordsPayload;
        if (isSearch) {
            response.search = search as string;
        }
        return response;
    }
}


