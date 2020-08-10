

export class FileFolderEntity {
    childrenFileFolders: FileFolderEntity[];
    pathFolder: string;
    isFolder: boolean;
    lastModifiedDateTime: string; //"0001-01-01T00:00:00"
    name: string; // 
    ownerId: string;
    parentPathFolder: string
    size: string
    isSelected: boolean;
}