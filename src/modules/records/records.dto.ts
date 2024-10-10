import { OrderEnum, StatusEnum } from '../../shared/enums';
import Joi from 'joi';

export const querySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).default(10),
    sortBy: Joi.string().valid('created_at', 'username', 'leaked_sources').default('created_at'),
    order: Joi.string().valid(...Object.values(OrderEnum)).default(OrderEnum.ASC),
    status: Joi.string().valid(...Object.values(StatusEnum)).optional(),
    username: Joi.string().optional().allow(''),
    leaked_sources: Joi.number().integer().optional(),
    start: Joi.date().optional(),
    end: Joi.date().optional(),
});

export const searchSchema = Joi.object({
    search: Joi.string().required().allow(''),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).default(10),
    sortBy: Joi.string().valid('created_at', 'username', 'leaked_sources').default('created_at'),
    order: Joi.string().valid(...Object.values(OrderEnum)).default(OrderEnum.ASC),
    status: Joi.string().valid(...Object.values(StatusEnum)).optional(),
    username: Joi.string().optional().allow(''),
    leaked_sources: Joi.number().integer().optional(),
    start: Joi.date().optional(),
    end: Joi.date().optional(),
});