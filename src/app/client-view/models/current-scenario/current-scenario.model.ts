import { ScenarioDebt, ScenarioAsset } from '../current-scenario/scenario-details.model';
import { AssetProjection } from '../asset-projection.model';
import { DebtProjection } from '../debt-projection.model';
import { GoalsModel } from '../goals.model';
import { CashFlowDetails } from './cash-flow-details.model';
import { RetirementProjectionModel } from './retirement-projection.model';
import { PersonalProtectionModel } from '..';
import { FamilyMembers } from '../../advice-builder/advice-builder.service';


export class CurrentScenarioModel {
    id: string;
    cashFlow: CashFlowDetails[] = [];
    cashFlowOnTrack: string;
    goals: GoalsModel[] = [];
    retirementProjections: RetirementProjectionModel = new RetirementProjectionModel();
    assets: ScenarioAsset = new ScenarioAsset();
    debt: ScenarioDebt = new ScenarioDebt();
    assetProjections: AssetProjection = new AssetProjection();
    debtProjections: DebtProjection = new DebtProjection();
    personalProtection: PersonalProtectionModel = new PersonalProtectionModel();
    familyMembers: FamilyMembers[] = [];
    strategyDuration: number;
}