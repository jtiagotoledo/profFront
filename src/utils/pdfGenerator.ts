import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const gerarEPDFDeNotas = async (alunos: any[], titulo: string) => {
  try {
    const todasAsDatas = new Set<string>();
    alunos.forEach(aluno => {
      aluno.notas?.forEach((nota: any) => todasAsDatas.add(nota.data));
    });
    
    const datasOrdenadas = Array.from(todasAsDatas).sort();

    const linhasTabela = alunos.map(aluno => {
      let notasHtml = datasOrdenadas.map(data => {
        const notaDoDia = aluno.notas?.find((n: any) => n.data === data);
        const valor = notaDoDia ? notaDoDia.valor : '-';
        return `<td>${valor}</td>`;
      }).join('');

      return `
        <tr>
          <td>${aluno.numeroChamada || '-'}</td>
          <td>${aluno.nome || 'Aluno'}</td>
          <td>${aluno.classe?.nome || ''}</td>
          ${notasHtml}
          <td><strong>${aluno.media || 0}</strong></td>
        </tr>
      `;
    }).join('');

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Helvetica, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #2E7D32; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; color: #333; }
            td:nth-child(2) { text-align: left; }
          </style>
        </head>
        <body>
          <h1>Relatório de Notas - ${titulo.replace(/_/g, ' ')}</h1>
          <table>
            <thead>
              <tr>
                <th>Nº</th>
                <th>Nome do Aluno</th>
                <th>Turma</th>
                ${datasOrdenadas.map(d => `<th>${d}</th>`).join('')}
                <th>Média</th>
              </tr>
            </thead>
            <tbody>
              ${linhasTabela}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // 1. Gera o PDF em segundo plano
    const { uri } = await Print.printToFileAsync({
      html: html,
      base64: false
    });

    // 2. Abre a janela nativa para o professor partilhar no WhatsApp, Email, ou Guardar
    if (uri) {
      await Sharing.shareAsync(uri, {
        dialogTitle: 'Exportar Relatório de Notas',
        mimeType: 'application/pdf',
      });
    }

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};