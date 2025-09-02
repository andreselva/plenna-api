import { Injectable } from '@nestjs/common';
import { IFinancialSummaryInput } from 'src/Shared/interfaces/IFinancialSummaryInput';
import FinancialSummaryService from './FinancialSummary/FinancialSummaryService';

@Injectable()
export class ReportsService {
    constructor(
        private readonly financialSummaryService: FinancialSummaryService
    ) {}
    
    getFinancialSummaryData(input: IFinancialSummaryInput) {
        return this.financialSummaryService.process(input);
    }
}
