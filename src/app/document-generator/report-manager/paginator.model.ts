import { PageEvent, MatPaginator } from '@angular/material';

export class Paginator {
    
    length: number;

    constructor(private paginatorComponent: MatPaginator, private pageSize: number, private pageSizeOptions: number[]) {
        this.length = 0;
    }

    getNewPage(event: PageEvent): [number, number] {
        this.pageSize = event.pageSize;
        let start = event.pageIndex * event.pageSize;
        let end = start + event.pageSize;
        return [start, end];
    }

    getFirstPage(): [number, number] { 
        while (this.paginatorComponent.hasPreviousPage()) {
            this.paginatorComponent.previousPage();
        }
        let start = 0;
        let end = start + this.pageSize;
        return [start, end];
    }
}