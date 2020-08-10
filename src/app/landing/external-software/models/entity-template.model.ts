import { Field } from "./field.model";

export class ImportEntityTemplate {
    entityName: string;
    entityDisplayName: string;
    fields: Field[] = [];
    status: string;
    version: string;
}