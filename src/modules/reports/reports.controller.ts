import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe, ParseBoolPipe, ParseEnumPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AnalysisType } from 'src/enum/analysis-type.enum';
import { Roles } from 'src/common/decorators/roles.decoratos';
import { Role } from 'src/enum/role.enum';

@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('/financial-summary')
  @Roles(Role.ADMIN)
  getFinancialSummary(
    @Query('periodo', new DefaultValuePipe(1), ParseIntPipe) periodo: number,
    @Query('tipoAnalise', new DefaultValuePipe(false), new ParseEnumPipe(AnalysisType)) tipoAnalise: AnalysisType
  ) {
    return this.service.getFinancialSummaryData({
      period: periodo, 
      typeAnalysis: tipoAnalise
    });
  }
}
