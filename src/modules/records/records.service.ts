import { Model, Document } from 'mongoose';
import { IRecord } from '../../shared/models/record';
import { IFilterOptions, IRecordsPayload, IRecordsResponse, ISafeRecord, } from './records.interface';
import logger from '../../config/logger';

export default class RecordsService {
    private readonly _recordModel: Model<IRecord & Document>;

    constructor(recordModel: Model<IRecord & Document>) {
        this._recordModel = recordModel;
    }

    public async getRecords(payload: IRecordsPayload): Promise<IRecordsResponse> {
        const { skip, limit, sortBy, order, filterOptions } = payload;
        try {
            const totalCount = await this._recordModel.countDocuments(filterOptions as IFilterOptions).exec();

            const query = this._recordModel.find(filterOptions as IFilterOptions)
                .select('-password') // Exclude password from the query
                .sort({ [sortBy]: order })
                .skip(skip as number)
                .limit(limit as number);

            const stream = query.cursor();
            const records: ISafeRecord[] = [];

            stream.on('data', (record) => {
                const safeRecord = {
                    url: record.url,
                    username: record.username,
                    leaked_sources: record.leaked_sources,
                    status: record.status,
                    created_at: record.created_at,
                    modified_at: record.modified_at,
                } as ISafeRecord;
                records.push(safeRecord);
            });

            return new Promise((resolve, reject) => {
                stream.on('end', () => {
                    resolve({ records, total: totalCount, pages: Math.ceil(totalCount / limit) });
                });

                stream.on('error', (error) => {
                    logger.error('Error streaming records', error);
                    reject(new Error('Error streaming records'));
                });
            });

        } catch (error) {
            logger.error('Error fetching records', error);
            throw new Error('Error fetching records');
        }
    }

    public async searchRecords(payload: IRecordsPayload): Promise<IRecordsResponse> {
        const { skip, limit, sortBy, order, filterOptions, search } = payload;
        try {
            const totalCount = await this._recordModel.countDocuments({
                $or: [
                    { username: { $regex: search as string, $options: 'i' } },
                    { url: { $regex: search as string, $options: 'i' } },
                    ],
                    ...filterOptions,
            }).exec();

            const query = this._recordModel
                .find({
                    $or: [
                        { username: { $regex: search as string, $options: 'i' } },
                        { url: { $regex: search as string, $options: 'i' } },
                    ],
                    ...filterOptions,
                })
                .select('-password')
                .sort({ [sortBy]: order })
                .skip(skip as number)
                .limit(limit as number);

            const stream = query.cursor();
            const records: ISafeRecord[] = [];

            stream.on('data', (record) => {
                const safeRecord = {
                    url: record.url,
                    username: record.username,
                    leaked_sources: record.leaked_sources,
                    status: record.status,
                    created_at: record.created_at,
                    modified_at: record.modified_at,
                } as ISafeRecord;
                records.push(safeRecord);
            });

            return new Promise((resolve, reject) => {
                stream.on('end', () => {
                    resolve({ records, total: totalCount, pages: Math.ceil(totalCount / limit) });
                });

                stream.on('error', (error) => {
                    logger.error('Error streaming records', error);
                    reject(new Error('Error streaming records'));
                });
            });
        } catch (error) {
            logger.error('Error searching records', error);
            throw new Error('Error searching records');
        }
    }
}
