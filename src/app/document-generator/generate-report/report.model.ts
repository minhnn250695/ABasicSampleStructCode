export class Report {

    userId: string;
    templateId:string;
    templateName:string;
    clientName: string;
    clientId: string;
    scenarioId: string;

    constructor(templateName: string, templateId: string, clientId: string, clientName:string){
        this.templateName= templateName;
        this.templateId = templateId;
        this.clientId = clientId;
        this.clientName= clientName;
    }    
}