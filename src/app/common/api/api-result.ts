import { ApiError } from './api-error';

export class ApiResult
{
    success: boolean;
    error: ApiError;
}