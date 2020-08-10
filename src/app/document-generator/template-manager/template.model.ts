export class Template {
    private DefaultAuthor: string = "00000000-0000-0000-0000-000000000000";

    id: string;
    name: string;
    authorName: string;
    authorId: string;
    creationDate: Date;
    path: string;
    isNew: boolean;
    isDefault: boolean;

    constructor(t?: Template) {
        if (t) {
            this.authorId = t.authorId;
            this.authorName = t.authorName;
            this.creationDate = new Date(t.creationDate);
            this.id = t.id;
            this.isNew = t.isNew;
            this.name = t.name;
            this.path = t.path;
            this.isDefault = t.authorId == this.DefaultAuthor;
        }
    }
}