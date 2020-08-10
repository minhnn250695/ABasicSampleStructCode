

export class GetClientRequest {
    index: number;
    limit:  number;
    orderby: string;
    sortby: string;
    keyWord: string = null;
    state: string = null;
    serviceCategory: number = null;
    ageRange: any = null //[30,40]     
}