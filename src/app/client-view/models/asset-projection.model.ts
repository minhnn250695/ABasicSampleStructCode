
export class AssetProjection {
    currentInvestments: number;
    currentProjectedWealth: number;
    currentProjectedWealthEquivalent: number;
    currentProjectedWealthEquivalentPlusMonthlyContribution: number;
    currentProjectedWealthPlusMonthlyContribution: number;
    parameters: {
        amountInvested: number;
        investmentReturns: number;
        yearsToInvest: number;
    };
    projectionYear: number;
}
