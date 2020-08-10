import { Injectable } from '@angular/core';
import { ScriptLoaderComponent } from '../script-loader/script-loader-component'
declare var $: any;

@Injectable()
export class LiveCustomerSupportService {

    constructor(private scriptLoader: ScriptLoaderComponent) {
    }

    show(accountNumber: string) {
        var component = $(".LPMcontainer");
        if (component.length == 0) {
            var cafexScript = `<cafex-script>`;
            var scripts = [cafexScript];
            this.scriptLoader.load(scripts);
        } else {
            component.show();
        }
    }

    hide() {
        $(".LPMcontainer").hide();
    }
}
