import { Record, IRecord } from '../models/record';
import { BATCH_SIZE } from '../constants';
import logger from '../../config/logger';

// 3rd party dependencies
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import JSONStream from 'JSONStream';

async function _storeLargeJsonInMongo(filePath: string): Promise<void> {
    let batch: IRecord[] = [];
    let recordCount = 0;

    // Create a pipeline to read the file and process it in chunks
    const pipeline = fs.createReadStream(filePath)
        .pipe(JSONStream.parse('*'));

    pipeline.on('data', async (value) => {
        // logger.debug(`Processing record: ${JSON.stringify(value)}`);

        batch.push(value);
        recordCount++;
        if (batch.length === BATCH_SIZE) {
            logger.debug(`Inserting batch of ${BATCH_SIZE} records`);
            await Record.insertMany(batch);
            logger.info(`Inserted ${recordCount} records`);
            batch = []; // Clear the batch after insertion
        }
    });

    pipeline.on('end', async () => {
        // Insert any remaining records in the batch after streaming ends
        if (batch.length > 0) {
            await Record.insertMany(batch);
            logger.info(`Inserted final batch of ${batch.length} records`);
        }
        logger.info('Data stream completed');
    });

    pipeline.on('error', (error) => {
        logger.error('Error streaming data', error);
    });
}


export async function prepareDatabase(): Promise<void> {
    try {
        await mongoose.connection.dropCollection('records');
        logger.info('Database dropped successfully');

        const filePath = path.join(__dirname, '../../../data/data.json');
        await _storeLargeJsonInMongo(filePath);
    } catch (error) {
        logger.error('Error running migrations:', error);
    }
}