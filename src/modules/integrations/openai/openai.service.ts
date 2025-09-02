import OpenAI from "openai";

export default class OpenAIService {
    private client: OpenAI;
    private standardModel = "gpt-5-nano";

    private API_KEY = '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';

    constructor() {
        this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || this.API_KEY })
    }

    async gerarRelatorio(data: any) {
        const dados = JSON.stringify(data);
        const resposta = await this.client.chat.completions.create({
            model: this.standardModel,
            messages: [
                {
                    role: "system", content: "Você é um analista financeiro"
                },
                {
                    role: "user", content: `
                    
                    Gere um relatório de resumo financeiro com base nos dados abaixo: ${dados}
                    
                    Destaque em tópicos:
                    - O mês com maior gasto.
                    - Destaque a categoria com o maior gasto.
                    - Faça a avaliação se essa categoria pode conter gastos supérfluos.
                    - Faça a análise de risco financeiro.

                    Importante: gere o texto em html. Evite títulos muito grandes, limitando em um h6.
                    `
                }
            ],
        });

        return resposta.choices[0].message.content;
    }
    
}