import logger from '../logger';
import { MONGO_URI } from '../../shared/constants';

// 3rd party dependencies
import mongoose, { ConnectOptions } from 'mongoose';
mongoose.set('debug', true);

export const initDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI as string, {
        } as ConnectOptions);
        logger.info('Connected to MongoDB successfully');
    } catch (error) {
        logger.error('Failed to connect to MongoDB:', error);
    }
};

export const closeConnection = async () => {
    try {
        await mongoose.connection.close();
        logger.info('Closed MongoDB connection');
    } catch (error) {
        logger.error('Failed to close MongoDB connection:', error);
    }
}