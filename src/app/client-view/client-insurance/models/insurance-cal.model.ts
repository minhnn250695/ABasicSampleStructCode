import { FinanceUtil } from '../../../common/utils';
import { ClientCalculation, PersonalInsuranceOutcomes } from '../../models';
import { InsuranceObjective } from './insurance-objective.model';

export class InsuranceCal {
  private financeUtil: FinanceUtil = new FinanceUtil();

  isThumpsUp(objective: InsuranceObjective,
    outcome: PersonalInsuranceOutcomes,
    clientCalculation: ClientCalculation) {

    return this.isLifeGapCurrentThumpsUp(objective, outcome, clientCalculation) &&
      this.isTPDGapCurrentThumpsUp(objective, outcome, clientCalculation) &&
      this.isTraumadGapCurrentThumpsUp(objective, outcome, clientCalculation);
    }

  /**
   * Term of
   */
  isLifeGapCurrentThumpsUp(objective: InsuranceObjective,
    outcome: PersonalInsuranceOutcomes,
    clientCalculation: ClientCalculation) {
    if (!objective || !outcome || !clientCalculation) { return false; }

    let netDebt = clientCalculation && clientCalculation.getCurrentNetDebt();

    let currentCover = outcome.lifeInsuranceTotal || 0;
    let clearDebt = (objective.deathDebtPaid || 0) / 100 * (netDebt || 0);
    let totalCapitalNeeds = clearDebt + objective.deathAdditionalExpenses || 0;
    let emergencySpending = objective.deathAdditionalExpenses;

    let incomeNeed = this.financeUtil.PV(outcome.returnCashRate / 100 || 0,
      objective.deathIncomeTimeYears || 0, (objective.deathIncomeReplaced || 0) * -1, 0);

    let coverRequired = totalCapitalNeeds + (incomeNeed || 0) - objective.deathSelfInsurance;

    let insuranceGap = coverRequired - currentCover || 0;
    return (insuranceGap || 0) <= 0;
  }

  isTPDGapCurrentThumpsUp(objective: InsuranceObjective,
    outcome: PersonalInsuranceOutcomes,
    clientCalculation: ClientCalculation) {
    if (!objective || !outcome) { return; }

    // total needs
    let netDebt = clientCalculation && clientCalculation.getCurrentNetDebt();
    let clearDebt = (objective.tpdDebtPaidPercentage || 0) / 100 * (netDebt || 0);

    let emergencySpending = objective.tpdAdditionalExpenses || 0;
    let totalCapitalNeeds = clearDebt + emergencySpending || 0;
    // income need
    let incomeNeed = this.financeUtil.PV(outcome.returnCashRate / 100 || 0,
      objective.tpdIncomeTimeYears || 0, (objective.tpdIncomeReplaced || 0) * -1, 0);
    // cover required
    let coverRequired = totalCapitalNeeds + incomeNeed - objective.tpdSelfInsurance;

    //
    let currentCover = outcome && outcome.tpdInsuranceTotal || 0;

    let insuranceGap = coverRequired - currentCover;
    return (insuranceGap || 0) <= 0;
  }

  isTraumadGapCurrentThumpsUp(objective: InsuranceObjective,
    outcome: PersonalInsuranceOutcomes,
    clientCalculation: ClientCalculation) {

    if (!objective || !outcome) { return; }

    // total needs
    let netDebt = clientCalculation && clientCalculation.getCurrentNetDebt();
    let clearDebt = (objective.traumaDebtPaidPercentage || 0) / 100 * (netDebt || 0);

    let emergencySpending = objective.traumaAdditionalExpenses || 0;
    let totalCapitalNeeds = clearDebt + emergencySpending || 0;
    // income need
    let incomeNeed = this.financeUtil.PV(outcome.returnCashRate / 100 || 0, objective.traumaIncomeTimeYears || 0,
      (objective.traumaIncomeReplaced || 0) * -1, 0);
    // cover required
    let coverRequired = totalCapitalNeeds + incomeNeed - objective.traumaSelfInsurance;
    //
    let currentCover = outcome && outcome.traumaInsuranceTotal || 0;

    let insuranceGap = coverRequired - currentCover;
    return (insuranceGap || 0) <= 0;
  }

}