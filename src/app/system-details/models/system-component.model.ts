import { ComponentType } from './component-type.model';

export class SystemComponent {

    companyId: string;
    name: string;
    type: ComponentType;
    version: string;
    updated: boolean;
    whatsNewLink: string;
    checkedUpdates: boolean;
    lastUpdate: Date;
    updating: boolean;
    updateFailed: boolean;
    updateHasNotStarted: boolean;
    updateStarted: boolean;
    updateAllowed: boolean;

    SystemComponent() {
        this.checkedUpdates = false;
    }


    checkUpdates(): boolean {
        this.checkedUpdates = true;
        return this.checkedUpdates;
    }

    hasNewVersionAvailable(): boolean {
        return this.checkedUpdates && !this.updated;
    }

    isUpToDate(): boolean {
        return this.updateAllowed && this.checkedUpdates && this.updated;
    }

    getLastUpdate(): string {
        return this.lastUpdate && this.lastUpdate.toLocaleDateString('en-au') || "N/A";
    }

    showMoreInformationLink() {
        return !this.updateFailed && !this.updateHasNotStarted && this.whatsNewLink && this.whatsNewLink != null;
    }

    showNewVersionAvailableMessage() {
        return !this.updating && !this.updateFailed && !this.updateHasNotStarted;
    }

    showUpdateAction() {
        return !this.updateFailed && !this.updateHasNotStarted;
    }

    showCheckForUpdatesAction() {
        return this.updateAllowed && !this.checkedUpdates;
    }

    setFailedUpdate(hasNotStarted: boolean) {
        this.updating = false;
        if (hasNotStarted)
            this.updateHasNotStarted = true;
        else
            this.updateFailed = true;
    }

    initUpdate() {
        this.updating = true;
        this.updateFailed = false;
        this.updateHasNotStarted = false;
        this.updateStarted = false;
    }


}