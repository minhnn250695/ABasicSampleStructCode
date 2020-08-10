import { Injectable } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { ConfirmationDialogService } from '../dialog/confirmation-dialog/confirmation-dialog.service';

@Injectable()
export class HandleErrorMessageService {

    constructor(
        private confirmationDialogService: ConfirmationDialogService
    ) { }

    public handleErrorResponse(res: any) {                
        if (res && res.sessionExpired) { return; }
        let errorCode = "5000"; //SERVER_INTERNAL_ERROR
        let errorMessage = "Sorry! Something unexpected has gone wrong.";
        let longMessage = "";
        if (res && res.error && res.error.errorCode != 1) {
            if (res.error.errorCode != 5000 && res.error.errorMessage) {
                errorMessage = res.error.errorMessage;
            }
            if (res.error.errorCode != 5000 && res.error.errorCode) {
                errorCode = res.error.errorCode;
            }
            longMessage = (errorMessage && errorMessage.length > 100) ? "..." : "";
        }
        console.log("Error response",res);
        let Isub: ISubscription = this.confirmationDialogService.showModal({
            title: "Error #" + errorCode,
            message: "" + errorMessage.slice(0, 100) + longMessage,
            btnOkText: "Ok"
        }).subscribe(() => { Isub.unsubscribe() })
    }
}