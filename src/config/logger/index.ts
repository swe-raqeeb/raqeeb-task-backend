import { devLogger } from './logger.dev';
import { prodLogger } from './logger.prod';
import { ENV } from '../../shared/constants';
import { Logger } from 'winston';
const logger = ENV === 'dev' ? devLogger : prodLogger;
export default logger as Logger;


// timezone printed is UTC