import { ApiError } from './api-error';

export class ApiDataResult<TResource>
{
    success: boolean;
    error: ApiError;
    data: TResource;
}
