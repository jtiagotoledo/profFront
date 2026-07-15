const RNHTMLtoPDF = require('react-native-html-to-pdf');
import Share from 'react-native-share';

export const gerarEPDFDeNotas = async (alunos: any[], titulo: string) => {
  try {
    const todasAsDatas = new Set<string>();
    alunos.forEach(aluno => {
      aluno.notas.forEach((nota: any) => todasAsDatas.add(nota.data));
    });
    const datasOrdenadas = Array.from(todasAsDatas).sort();

    const linhasTabela = alunos.map(aluno => {
      let notasHtml = datasOrdenadas.map(data => {
        const notaDoDia = aluno.notas.find((n: any) => n.data === data);
        const valor = notaDoDia ? notaDoDia.valor : '-';
        return `<td>${valor}</td>`;
      }).join('');

      return `
        <tr>
          <td>${aluno.numeroChamada}</td>
          <td>${aluno.nome}</td>
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
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; color: #333; }
            td:nth-child(2) { text-align: left; } /* Nome alinhado à esquerda */
          </style>
        </head>
        <body>
          <h1>Relatório de Notas - ${titulo}</h1>
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

    let options = {
      html: html,
      fileName: `Notas_${titulo.replace(/\s+/g, '_')}`,
      directory: 'Documents',
    };

    let file = await RNHTMLtoPDF.convert(options);

    await Share.open({
      url: `file://${file.filePath}`,
      title: 'Exportar Relatório de Notas',
    });

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};