import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { OnBoardingComponent } from "./on-boarding.component";

import { PersonalInformationComponent } from "./personal-information/personal-information.component";
import { FamilyMemberComponent } from "./family-member/family-member.component";

import { HouseholdLandingComponent } from "./household-landing/household-landing.component";
import { FinancialSituationComponent } from "./financial-situation/financial-situation.component";
import { YourGoalComponent } from "./your-goal/your-goal.component";
import { CompletedOnBoardingComponent } from './completed-on-boarding/completed-on-boarding.component';
const childRouters: Routes = [
    {
        path: "",
        component: HouseholdLandingComponent
    },
    {
        path: "personal-information",
        component: PersonalInformationComponent
    },
    {
        path: "family-member",
        component: FamilyMemberComponent
    },
    {
        path: "financial-situation",
        component: FinancialSituationComponent
    },
    {
        path: "your-goal",
        component: YourGoalComponent
    },
    {
        path: "completed",
        component: CompletedOnBoardingComponent
    }

];

const routes: Routes = [
    {
        path: "",
        component: OnBoardingComponent,
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
export class OnBoardingRoutingModule { }
