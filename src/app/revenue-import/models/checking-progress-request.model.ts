
export class CheckingProgressRequest {
    
        constructor(id: string) {
            this.batchIdentifier = id;
        }
        batchIdentifier: string;
}