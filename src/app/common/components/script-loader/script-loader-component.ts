import { Injectable } from "@angular/core";

declare var document: any;

@Injectable()
export class ScriptLoaderComponent {

    private scripts: any = {};

    constructor() {

    }

    load(scripts: string[]) {
        var promises: any[] = [];
        scripts.forEach((script) => promises.push(this.loadScript(script)));
        return Promise.all(promises);
    }

    loadScript(source: string) {
        return new Promise((resolve, reject) => {
            let script = document.createElement('script');
            script.text = source;
            script.type = 'text/javascript';
            if (script.readyState) {  //IE
                script.onreadystatechange = () => {
                    if (script.readyState === "loaded" || script.readyState === "complete") {
                        script.onreadystatechange = null;
                        resolve({ loaded: true, status: 'Loaded' });
                    }
                };
            } else {  //Others
                script.onload = () => {
                    resolve({ loaded: true, status: 'Loaded' });
                };
            }
            script.onerror = (error: any) => resolve({ loaded: false, status: 'Loaded' });
            document.getElementsByTagName('head')[0].appendChild(script);
        });
    }

}