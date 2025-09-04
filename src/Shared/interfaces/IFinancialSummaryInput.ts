import { AnalysisType } from "src/enum/analysis-type.enum";

export interface IFinancialSummaryInput {
  period: number;
  typeAnalysis: AnalysisType;
}