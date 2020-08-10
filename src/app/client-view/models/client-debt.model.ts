
export class ClientDebt {
  id: string;
  name: string;
  currentBalance: number;
  annualInterestRate: number;
  interestRateType: number;
  offsetAccountBalance: number;
  associatedAsset: string;
  repayment: number;
  repaymentFrequency: number;
  status: number;
  debtType: number;
  annualPayment: number;
  primaryClientId: string;

  // new api
  primaryClientFirstName: string;
  primaryClientLastName: string;
  dataFeedsConnected: boolean;

  // new api
  ownershipType: number;
  debtCategory: number;
  householdId: string;
}