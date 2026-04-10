import OpenAI from "openai";

export default class OpenAIService {
    private _client: OpenAI | null = null;
    private standardModel = "gpt-5-nano";

    private get client(): OpenAI {
        if (!this._client) {
            this._client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }
        return this._client;
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

                    Importante: de espaçamento e quebras de linhas corretamente entre os tópicos.
                    `
                }
            ],
        });

        return resposta.choices[0].message.content;
    }
    
}