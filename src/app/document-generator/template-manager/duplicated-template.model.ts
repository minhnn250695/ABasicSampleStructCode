import { Template } from './template.model';

export class DuplicatedTemplate {

    newAuthorId: string;
    template: Template;

    constructor(template: Template, newAuthorId: string) {
        this.newAuthorId = newAuthorId;
        this.template = template;
    }
}