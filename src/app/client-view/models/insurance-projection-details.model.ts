export class InsuranceProjectionDetails {
    ownerName: string;
    policyName: string;
    policyNumber: number;
    personalInsurancePeriods: {
        year: number;        
        totalPremiums: number,
    }[] = [];
}