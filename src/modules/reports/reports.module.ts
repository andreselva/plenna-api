import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import FinancialSummaryService from './FinancialSummary/FinancialSummaryService';
import ReportsRepository from './reports.repository';

@Module({
  providers: [ReportsService, ReportsRepository, FinancialSummaryService],
  controllers: [ReportsController]
})
export class ReportsModule {}
