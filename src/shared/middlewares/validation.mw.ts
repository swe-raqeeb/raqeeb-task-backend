//3rd party dependinces
import HttpException from '../exceptions/http.exception';
import logger from '../../config/logger';

import Joi from 'joi';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

export function validate(schema: Joi.ObjectSchema, target: 'body' | 'query' | 'params' = 'body'): RequestHandler {
  return (req: Request, _: Response, next: NextFunction) => {
    const dataToValidate = req[target]; // Dynamically select the part of the request
    const { error } = schema.validate(dataToValidate, { abortEarly: false });

    if (error) {
      logger.error(`Error validating request ${target}: ${error.message}`);
      const message = error.details.map(detail => detail.message).join(', ');
      return next(new HttpException(StatusCodes.BAD_REQUEST, message));
    }

    next();
  };
}
