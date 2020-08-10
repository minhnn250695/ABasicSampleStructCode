import { Directive, ElementRef, Input, HostListener, OnChanges, SimpleChanges } from "@angular/core";
import { FileFolderEntity } from '../../client-view/client-doc-storage/models';
import { SecurityService } from '../../security/security.service';

@Directive({
    selector: '[folderModifyPermission]'
})
export class FolderModifyPermission implements OnChanges {
    constructor(private el: ElementRef, private securityService: SecurityService) {
    }
    @Input('folderModifyPermission') currentFolder: FileFolderEntity;
    @Input() currentChildFolder: FileFolderEntity;
    private navigatePathList: string[] = [];

    ngOnChanges(changes: SimpleChanges) {
        let userCanModify: boolean = false;
        let isUserAdminOrStaff = this.securityService.isClientAdminOrStaff();
        if (this.currentFolder) {
            this.updateNavigatePath(this.currentFolder);
            let folderNeedPermission = this.currentChildFolder ? this.currentChildFolder : this.currentFolder;
            if (!this.isRootPath() && (isUserAdminOrStaff || this.canModified(folderNeedPermission)))
                userCanModify = true;
            else userCanModify = false;
        }
        else { // No need to check root folder. Once user is admin that can delete
            userCanModify = isUserAdminOrStaff ? true : false;
        }
        this.el.nativeElement.style.visibility = userCanModify ? "visible" : "hidden";
    }

    canModified(folder: FileFolderEntity): boolean {
        if(!folder || !folder.pathFolder) return false;
        if (folder.name == "Miscellaneous" || folder.parentPathFolder == "Miscellaneous" || folder.pathFolder.includes("Miscellaneous"))
            return true;
        return false;
    }

    isRootPath(): boolean {
        if (this.navigatePathList.length == 0)
            return true;                
        return false;
    }

    private updateNavigatePath(folder: FileFolderEntity) {
        if (!folder || !folder.pathFolder) {
            this.navigatePathList = [];
        }
        if (folder && folder.pathFolder) {
            this.navigatePathList = folder.pathFolder.split("\\");
        }
    }
}