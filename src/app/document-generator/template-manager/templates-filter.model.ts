export class TemplatesFilter {

    author: string;
    name: string;
    periodFrom: Date;
    periodTo: Date;

    clear(): void {
        this.author = "";
        this.periodFrom = undefined;
        this.periodTo = undefined;
        this.name = "";
    }
}