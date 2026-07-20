import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const gerarEPDFDeNotas = async (alunos: any[], titulo: string) => {
  try {
    const formatarData = (dataStr: string) => {
      if (!dataStr) return '';
      const partes = dataStr.split('-');
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
      return dataStr;
    };

    const avaliacoesMap = new Map();

    alunos.forEach(aluno => {
      aluno.notas?.forEach((nota: any) => {
        const nomeAtividade = nota.titulo || 'Atividade';
        const chave = `${nota.data}_${nomeAtividade}`;
        
        if (!avaliacoesMap.has(chave)) {
          avaliacoesMap.set(chave, { data: nota.data, titulo: nomeAtividade });
        }
      });
    });
    
    const avaliacoesOrdenadas = Array.from(avaliacoesMap.values()).sort((a, b) => a.data.localeCompare(b.data));

    const cabecalhosHtml = avaliacoesOrdenadas.map(av => 
      `<th>${av.titulo}<br><span style="font-size: 11px; font-weight: normal; color: #555;">${formatarData(av.data)}</span></th>`
    ).join('');

    const linhasTabela = alunos.map(aluno => {
      let notasHtml = avaliacoesOrdenadas.map(av => {
        const notaExata = aluno.notas?.find((n: any) => n.data === av.data && (n.titulo || 'Atividade') === av.titulo);
        const valor = notaExata ? notaExata.valor : '-';
        return `<td>${valor}</td>`;
      }).join('');

      return `
        <tr>
          <td>${aluno.numeroChamada || '-'}</td>
          <td>${aluno.nome || 'Aluno'}</td>
          <td>${aluno.classe?.nome || ''}</td>
          ${notasHtml}
        </tr>
      `;
    }).join('');

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Helvetica, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #2E7D32; margin-bottom: 5px; }
            h3 { text-align: center; color: #555; margin-top: 0; font-weight: normal; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; color: #333; }
            td:nth-child(2) { text-align: left; }
          </style>
        </head>
        <body>
          <h1>Relatório de Notas</h1>
          <h3>${titulo.replace(/_/g, ' ')}</h3>
          <table>
            <thead>
              <tr>
                <th>Nº</th>
                <th>Nome do Aluno</th>
                <th>Turma</th>
                ${cabecalhosHtml}
                <!-- 4. Cabeçalho de Média removido daqui -->
              </tr>
            </thead>
            <tbody>
              ${linhasTabela}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html, base64: false });

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