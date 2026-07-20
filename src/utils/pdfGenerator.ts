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

    const MAX_COLUNAS_POR_PAGINA = 5; // Ajuste este número se quiser mais ou menos notas por página
    const blocosDeAvaliacoes = [];
    
    for (let i = 0; i < avaliacoesOrdenadas.length; i += MAX_COLUNAS_POR_PAGINA) {
      blocosDeAvaliacoes.push(avaliacoesOrdenadas.slice(i, i + MAX_COLUNAS_POR_PAGINA));
    }

    let todasAsTabelasHtml = '';

    if (blocosDeAvaliacoes.length === 0) {
      const linhasVazias = alunos.map(aluno => `
        <tr>
          <td>${aluno.numeroChamada || '-'}</td>
          <td>${aluno.nome || 'Aluno'}</td>
          <td>${aluno.classe?.nome || ''}</td>
          <td>-</td>
        </tr>
      `).join('');

      todasAsTabelasHtml = `
        <h1>Relatório de Notas</h1>
        <h3>${titulo.replace(/_/g, ' ')}</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 30px;">Nº</th>
              <th>Nome do Aluno</th>
              <th>Turma</th>
              <th>Sem Avaliações</th>
            </tr>
          </thead>
          <tbody>${linhasVazias}</tbody>
        </table>
      `;
    } else {
      blocosDeAvaliacoes.forEach((bloco, index) => {
        const cabecalhosHtml = bloco.map(av => 
          `<th>${av.titulo}<br><span style="font-size: 10px; font-weight: normal; color: #555;">${formatarData(av.data)}</span></th>`
        ).join('');

        const linhasTabela = alunos.map(aluno => {
          let notasHtml = bloco.map(av => {
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

        const quebraDePagina = index > 0 ? '<div style="page-break-before: always;"></div>' : '';
        const subtituloParte = blocosDeAvaliacoes.length > 1 ? `<h4 style="text-align: center; color: #d32f2f; margin-top: -10px;">(Parte ${index + 1} de ${blocosDeAvaliacoes.length})</h4>` : '';

        todasAsTabelasHtml += `
          ${quebraDePagina}
          <h1>Relatório de Notas</h1>
          <h3>${titulo.replace(/_/g, ' ')}</h3>
          ${subtituloParte}
          <table>
            <thead>
              <tr>
                <th style="width: 30px;">Nº</th>
                <th>Nome do Aluno</th>
                <th>Turma</th>
                ${cabecalhosHtml}
              </tr>
            </thead>
            <tbody>
              ${linhasTabela}
            </tbody>
          </table>
        `;
      });
    }

    const html = `
      <html>
        <head>
          <style>
            @page { 
              size: A4 portrait; 
              margin: 10mm; 
            }
            body { 
              font-family: Helvetica, sans-serif; 
              font-size: 12px; 
            }
            h1 { text-align: center; color: #2E7D32; margin-bottom: 5px; font-size: 20px; }
            h3 { text-align: center; color: #555; margin-top: 0; font-weight: normal; font-size: 14px; }
            
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
              page-break-inside: auto; 
            }
            tr { page-break-inside: avoid; page-break-after: auto; }
            
            th, td { 
              border: 1px solid #ddd; 
              padding: 6px; 
              text-align: center; 
              word-wrap: break-word; 
            }
            th { background-color: #f2f2f2; color: #333; font-size: 11px; }
            td:nth-child(2) { text-align: left; }
          </style>
        </head>
        <body>
          ${todasAsTabelasHtml}
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