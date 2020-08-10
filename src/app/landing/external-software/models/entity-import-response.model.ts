export class EntityImportResponse<T> {
    currentPage: number;
    totalCount: string;
    items: T[];
}
