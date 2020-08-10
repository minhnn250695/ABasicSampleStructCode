import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";

import { MobileHouseholdLandingComponent } from "./mobile-household-landing/mobile-household-landing.component";
import { MobileOnBoardingComponent } from './mobile-on-boarding.component';
import { MobilePersonalInformationComponent } from './personal-information/mobile-personal-information.component';
import { MobileFamilyMemberComponent } from './family-member/mobile-family-member.component';
import { MobileFinancialSituationComponent } from './financial-situation/mobile-financial-situation.component';
import { MobileYourGoalComponent } from './your-goal/mobile-your-goal.component';
import { MobileCompletedOnBoardingComponent } from './completed-on-boarding/mobile-completed-on-boarding.component';
const childRouters: Routes = [
    {
        path: "",
        component: MobileHouseholdLandingComponent
    },
    {
        path: "personal-information",
        component: MobilePersonalInformationComponent
    },
    {
        path: "family-member",
        component: MobileFamilyMemberComponent
    },
    {
        path: "financial-situation",
        component: MobileFinancialSituationComponent
    },
    {
        path: "your-goal",
        component: MobileYourGoalComponent
    },
    {
        path: "completed",
        component: MobileCompletedOnBoardingComponent
    }
];

const routes: Routes = [
    {
        path: "",
        component: MobileOnBoardingComponent,
        children: childRouters
    }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule],
    declarations: []
})
export class MobileOnBoardingRoutingModule { }
