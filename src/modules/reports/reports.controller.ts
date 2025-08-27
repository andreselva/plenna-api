import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe, ParseBoolPipe } from '@nestjs/common';

@Controller('reports')
export class ReportsController {

  @Get('/financial-summary')
  getDataFinancialSummary(
    @Query('periodo', new DefaultValuePipe(1), ParseIntPipe) periodo: number,
    @Query('considerarCategorias', new DefaultValuePipe(false), ParseBoolPipe) considerarCategorias: boolean,
    @Query('considerarFaturas',  new DefaultValuePipe(false), ParseBoolPipe) considerarFaturas: boolean,
  ) {
    const filtro = { tipo: 'meses', periodo };

    // Retorno mockado
    return {
      allLabels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      allIncomeData: [5000, 7000, 8000, 6500, 9000, 10000, 9500, 11000, 10500, 9800, 11500, 12000],
      allExpenseData: [4000, 5000, 6000, 4500, 7000, 6500, 7200, 6800, 7500, 8000, 7700, 8200],
      summary: `Analisado por ${filtro.tipo}${filtro.tipo === 'meses' ? ` (${filtro.periodo}m)` : ``}. ` +
               `Categorias: ${considerarCategorias ? 'sim' : 'não'}, Faturas: ${considerarFaturas ? 'sim' : 'não'}.`
    };
  }
}
