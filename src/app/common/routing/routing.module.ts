import { NgModule } from '@angular/core';
import { UIRouterModule } from "@uirouter/angular";

import { LoginContainerComponent } from '../../security/login-container/login-container.component';
import { LandingComponent } from '../../landing/landing.component';
import { TemplateManagerComponent } from '../../document-generator/template-manager/template-manager.component';
import { TemplateEditorComponent } from '../../document-generator/template-editor/template-editor.component';
import { UploadTemplateComponent } from '../../document-generator/upload-template/upload-template.component';
import { GenerateReportComponent } from '../../document-generator/generate-report/generate-report.component';
import { ReportManagerComponent } from '../../document-generator/report-manager/report-manager.component';
import { RouteState } from './route-state.model'
import { SecurityService } from '../../security/security.service'

const states: RouteState[] = [
    { name: 'login', url: '/login', component: LoginContainerComponent },
    { name: 'landing', url: '', component: LandingComponent },
    { name: 'template-manager', url: '/template-manager', component: TemplateManagerComponent },
    { name: 'template-editor', url: '/template-editor', component: TemplateEditorComponent },
    { name: 'upload-template', url: '/upload-template', component: UploadTemplateComponent },
    { name: 'generate-report', url: '/generate-report', component: GenerateReportComponent },
    { name: 'report-manager', url: '/report-manager', component: ReportManagerComponent }
];

@NgModule({
    imports: [
        UIRouterModule.forRoot({ states: buildAppStates(states), useHash: true })
    ],
    exports: [
        UIRouterModule
    ],
    providers: [
        SecurityService
    ]
})

export class AppRoutesModule { }

function buildAppStates(states: RouteState[]): any[] {

    let appStates = [];
    for (let state of states) {

        let appState: any = {
            name: state.name,
            url: state.url,
            component: state.component
        };

        if (state.authorize) {
            appState.onEnter = authorizeUserGuard;
            appState.data = { allowedRoles : state.authorize };
        }

        appStates.push(appState);
    }

    return appStates;
}


function authorizeUserGuard(transition) {

    const securityService = transition.injector().get(SecurityService);
    const targetStateName = transition.targetState().identifier();
    const targetState = transition.router.stateRegistry.states[targetStateName];
    const allowedRoles = targetState.data ? targetState.data.allowedRoles : [];

    if (!securityService.authorize(allowedRoles)) {
        
        return transition.router.stateService.go('');
    }

    return true;
}