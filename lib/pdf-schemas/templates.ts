import type { PDFDocumentSchema } from './schema'

const DEFAULT_HEADER = {
  showLogo: true,
  showBrasao: true,
  institution: 'PRÓ-REITORIA DE EXTENSÃO',
  subInstitution: 'COORDENAÇÃO DE ESTÁGIOS E ACOMPANHAMENTO DE EGRESSOS',
  campus: 'IFCE Campus Maracanaú',
  department: 'Setor de Acompanhamento de Estágio',
}

export function buildMonthlyReportSchema(): PDFDocumentSchema {
  return {
    title: 'Relatório Mensal de Atividades',
    header: DEFAULT_HEADER,
    sections: [
      {
        title: 'Dados do Discente e Estágio',
        type: 'table',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Nome do Discente', '{nome_estudante}'],
          ['Curso', '{curso_estudante}'],
          ['Matrícula', '{matricula_estudante}'],
          ['Supervisor do Estágio', '{nome_supervisor}'],
          ['Docente Orientador (IFCE)', '{nome_orientador}'],
          ['Data Inicial', '{inicio_periodo}'],
          ['Data Final', '{fim_periodo}'],
          ['Carga Horária no Período', '{horas_mes} h'],
        ],
      },
      {
        title: '1. Principais Atividades Desenvolvidas no Período',
        type: 'paragraph',
        content: '{atividades}',
      },
      {
        title: '2. Dificuldades Encontradas',
        type: 'paragraph',
        content: '{dificuldades}',
      },
      {
        title: '3. Soluções Adotadas',
        type: 'paragraph',
        content: '{solucoes}',
      },
    ],
    signatureLines: [{ label: 'Supervisor do Estágio' }, { label: 'Discente Estagiário' }],
  }
}

export function buildFinalReportSchema(): PDFDocumentSchema {
  return {
    title: 'Relatório Final de Estágio',
    header: DEFAULT_HEADER,
    sections: [
      {
        title: 'Dados do Discente e Estágio',
        type: 'table',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Nome do Discente', '{nome_estudante}'],
          ['Curso', '{curso_estudante}'],
          ['Matrícula', '{matricula_estudante}'],
          ['Supervisor do Estágio', '{nome_supervisor}'],
          ['Docente Orientador (IFCE)', '{nome_orientador}'],
          ['Período de Estágio', '{inicio_periodo} a {fim_periodo}'],
          ['C.H. Total', '{horas_total} h'],
        ],
      },
      {
        title: '1. Resumo das Atividades Desenvolvidas',
        type: 'paragraph',
        content: '{atividades}',
      },
      {
        title: '2. Competências Adquiridas',
        type: 'paragraph',
        content: '{competencias}',
      },
      {
        title: '3. Avaliação do Estágio',
        type: 'paragraph',
        content: '{avaliacao}',
      },
      {
        title: '4. Conclusão',
        type: 'paragraph',
        content: '{conclusao}',
      },
    ],
    signatureLines: [
      { label: 'Supervisor do Estágio' },
      { label: 'Discente Estagiário' },
      { label: 'Docente Orientador' },
    ],
  }
}

export function buildSemesterReportSchema(): PDFDocumentSchema {
  return {
    title: 'Relatório Semestral de Estágio',
    header: DEFAULT_HEADER,
    sections: [
      {
        title: 'Dados do Discente e Estágio',
        type: 'table',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Nome do Discente', '{nome_estudante}'],
          ['Curso', '{curso_estudante}'],
          ['Matrícula', '{matricula_estudante}'],
          ['Supervisor do Estágio', '{nome_supervisor}'],
          ['Docente Orientador (IFCE)', '{nome_orientador}'],
          ['Período', '{inicio_periodo} a {fim_periodo}'],
          ['C.H. Semestral', '{horas_semestre} h'],
        ],
      },
      {
        title: '1. Atividades Desenvolvidas no Semestre',
        type: 'paragraph',
        content: '{atividades}',
      },
      {
        title: '2. Dificuldades e Soluções',
        type: 'paragraph',
        content: '{dificuldades}',
      },
      {
        title: '3. Resultados Alcançados',
        type: 'paragraph',
        content: '{resultados}',
      },
    ],
    signatureLines: [{ label: 'Supervisor do Estágio' }, { label: 'Discente Estagiário' }],
  }
}

export function buildCommitmentTermSchema(): PDFDocumentSchema {
  return {
    title: 'Termo de Compromisso de Estágio',
    header: DEFAULT_HEADER,
    sections: [
      {
        title: 'Dados do Discente',
        type: 'table',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Nome do Discente', '{nome_estudante}'],
          ['Curso', '{curso_estudante}'],
          ['Matrícula', '{matricula_estudante}'],
          ['CPF', '{cpf_estudante}'],
          ['RG', '{rg_estudante}'],
          ['Data de Nascimento', '{data_nascimento}'],
        ],
      },
      {
        title: 'Dados da Instituição Concedente',
        type: 'table',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Empresa / Instituição Concedente', '{empresa_nome}'],
          ['CNPJ', '{empresa_cnpj}'],
          ['Endereço da Empresa', '{empresa_endereco}'],
          ['Setor de Estágio', '{empresa_setor}'],
          ['Área de Atuação', '{area_atuacao}'],
          ['Supervisor do Estágio', '{nome_supervisor}'],
          ['Cargo', '{cargo_supervisor}'],
        ],
      },
      {
        title: 'Dados do Plano de Estágio',
        type: 'table',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Docente Orientador (IFCE)', '{nome_orientador}'],
          ['Início do Estágio', '{inicio_estagio}'],
          ['Término do Estágio', '{fim_estagio}'],
          ['C.H. Semanal', '{horas_semanais} h'],
          ['Valor da Bolsa (R$)', '{valor_bolsa}'],
          ['Auxílio Transporte (R$)', '{valor_transporte}'],
        ],
      },
    ],
    signatureLines: [
      { label: 'Supervisor do Estágio' },
      { label: 'Discente Estagiário' },
      { label: 'Coordenador de Estágios' },
    ],
  }
}

export function buildAdditiveTermSchema(): PDFDocumentSchema {
  return {
    title: 'Termo Aditivo ao Contrato de Estágio',
    header: DEFAULT_HEADER,
    sections: [
      {
        title: 'Dados do Discente e Empresa',
        type: 'table',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Nome do Discente', '{nome_estudante}'],
          ['Curso', '{curso_estudante}'],
          ['Matrícula', '{matricula_estudante}'],
          ['Empresa / Instituição Concedente', '{empresa_nome}'],
        ],
      },
      {
        title: 'Alterações Contratuais',
        type: 'table',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Motivo do Aditivo', '{motivo_aditivo}'],
          ['Nova Data de Término', '{nova_data_fim}'],
          ['Nova C.H. Semanal', '{nova_carga_horaria} h'],
          ['Novo Valor da Bolsa (R$)', '{novo_valor_bolsa}'],
          ['Novo Aux. Transporte (R$)', '{novo_valor_transporte}'],
        ],
      },
      {
        title: 'Justificativa',
        type: 'paragraph',
        content: '{justificativa}',
      },
    ],
    signatureLines: [
      { label: 'Supervisor do Estágio' },
      { label: 'Discente Estagiário' },
      { label: 'Coordenador de Estágios' },
    ],
  }
}

export function buildExtensionDeclarationSchema(): PDFDocumentSchema {
  return {
    title: 'Declaração de Prorrogação de Estágio',
    header: DEFAULT_HEADER,
    sections: [
      {
        title: 'Dados do Discente e Empresa',
        type: 'table',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Nome do Discente', '{nome_estudante}'],
          ['Curso', '{curso_estudante}'],
          ['Matrícula', '{matricula_estudante}'],
          ['Empresa / Instituição Concedente', '{nome_empresa}'],
          ['Data Término Atual', '{data_final_atual}'],
          ['Nova Data de Término', '{nova_data_final}'],
        ],
      },
      {
        title: 'Declaração',
        type: 'paragraph',
        content:
          'A empresa {nome_empresa} declara para os devidos fins que o estágio do(a) discente {nome_estudante} será prorrogado até a data de {nova_data_final}.',
      },
    ],
    signatureLines: [
      { label: 'Representante da Empresa' },
      { label: 'Discente Estagiário' },
      { label: 'Coordenador de Estágios' },
    ],
  }
}

export function buildProfessionalDeclarationSchema(): PDFDocumentSchema {
  return {
    title: 'Declaração de Estágio',
    header: DEFAULT_HEADER,
    sections: [
      {
        title: 'Informações do Estagiário',
        type: 'table',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Nome do Discente', '{nome_estudante}'],
          ['Curso', '{curso_estudante}'],
          ['Matrícula', '{matricula_estudante}'],
          ['Período', '{inicio_estagio} a {fim_estagio}'],
          ['Total de Horas', '{horas_total} h'],
          ['Setor', '{setor}'],
          ['Supervisor', '{nome_supervisor}'],
        ],
      },
      {
        title: 'Declaração',
        type: 'paragraph',
        content:
          'Declaramos que {nome_estudante}, matriculado(a) no curso de {curso_estudante} sob o número de matrícula {matricula_estudante}, realizou estágio supervisionado nesta instituição no período de {inicio_estagio} a {fim_estagio}, totalizando {horas_total} horas.',
      },
    ],
    signatureLines: [{ label: 'Supervisor do Estágio' }, { label: 'Coordenador de Estágios IFCE' }],
  }
}

export function buildInternshipRegistrationSchema(): PDFDocumentSchema {
  return {
    title: 'Solicitação de Matrícula em Estágio Curricular',
    header: DEFAULT_HEADER,
    sections: [
      {
        title: 'Dados do Discente',
        type: 'table',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Nome do Discente', '{nome_estudante}'],
          ['Curso', '{curso_estudante}'],
          ['Matrícula', '{matricula_estudante}'],
          ['CPF', '{cpf_estudante}'],
          ['E-mail', '{email_estudante}'],
          ['Telefone', '{telefone_estudante}'],
          ['Semestre Atual', '{semestre_atual}'],
          ['Turno', '{turno}'],
        ],
      },
      {
        title: 'Dados da Empresa',
        type: 'table',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Empresa / Instituição Concedente', '{empresa_nome}'],
          ['Endereço da Empresa', '{empresa_endereco}'],
          ['Cidade', '{empresa_cidade}'],
          ['Início Pretendido', '{inicio_estagio}'],
          ['Fim Pretendido', '{fim_estagio}'],
          ['C.H. Semanal', '{horas_semanais} h'],
        ],
      },
    ],
    signatureLines: [{ label: 'Discente' }, { label: 'Coordenador de Estágios' }],
  }
}

export function buildInternshipRegistrationRequestSchema(): PDFDocumentSchema {
  return {
    title: 'Requerimento de Estágio Supervisionado',
    header: DEFAULT_HEADER,
    sections: [
      {
        title: 'Dados do Discente',
        type: 'table',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Nome do Discente', '{nome_estudante}'],
          ['Curso', '{curso_estudante}'],
          ['Matrícula', '{matricula_estudante}'],
          ['CPF', '{cpf_estudante}'],
          ['Telefone', '{telefone_estudante}'],
        ],
      },
      {
        title: 'Dados da Empresa',
        type: 'table',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Empresa / Instituição Concedente', '{empresa_nome}'],
          ['Supervisor do Estágio', '{nome_supervisor}'],
          ['Cargo', '{cargo_supervisor}'],
          ['Início', '{inicio_estagio}'],
          ['Término', '{fim_estagio}'],
          ['C.H. Semanal', '{horas_semanais} h'],
          ['Valor da Bolsa (R$)', '{valor_bolsa}'],
          ['Aux. Transporte (R$)', '{valor_transporte}'],
        ],
      },
      {
        title: 'Atividades Previstas',
        type: 'paragraph',
        content: '{atividades_previstas}',
      },
    ],
    signatureLines: [
      { label: 'Discente' },
      { label: 'Supervisor do Estágio' },
      { label: 'Coordenador de Estágios' },
    ],
  }
}

export function buildRealizationTermSchema(): PDFDocumentSchema {
  return {
    title: 'Termo de Realização de Estágio',
    header: DEFAULT_HEADER,
    sections: [
      {
        title: 'Dados do Estágio',
        type: 'table',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Nome do Discente', '{nome_estudante}'],
          ['Curso', '{curso_estudante}'],
          ['Matrícula', '{matricula_estudante}'],
          ['Empresa / Instituição Concedente', '{empresa_nome}'],
          ['Supervisor do Estágio', '{nome_supervisor}'],
          ['Início', '{inicio_estagio}'],
          ['Término', '{fim_estagio}'],
          ['C.H. Total', '{horas_total} h'],
        ],
      },
      {
        title: 'Atividades Realizadas',
        type: 'paragraph',
        content: '{atividades}',
      },
    ],
    signatureLines: [{ label: 'Supervisor do Estágio' }, { label: 'Discente Estagiário' }],
  }
}

export function buildRescissionTermSchema(): PDFDocumentSchema {
  return {
    title: 'Termo de Rescisão de Estágio',
    header: DEFAULT_HEADER,
    sections: [
      {
        title: 'Dados do Discente e Empresa',
        type: 'table',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Nome do Discente', '{nome_estudante}'],
          ['Curso', '{curso_estudante}'],
          ['Matrícula', '{matricula_estudante}'],
          ['Empresa / Instituição Concedente', '{empresa_nome}'],
          ['Data de Início do Estágio', '{inicio_estagio}'],
          ['Data da Rescisão', '{data_rescisao}'],
        ],
      },
      {
        title: 'Motivo da Rescisão',
        type: 'paragraph',
        content: '{motivo_rescisao}',
      },
    ],
    signatureLines: [
      { label: 'Supervisor do Estágio' },
      { label: 'Discente Estagiário' },
      { label: 'Coordenador de Estágios' },
    ],
  }
}

export function buildEquivalenceRequestSchema(): PDFDocumentSchema {
  return {
    title: 'Pedido de Aproveitamento / Equivalência de Estágio',
    header: DEFAULT_HEADER,
    sections: [
      {
        title: 'Dados do Discente e Empresa',
        type: 'table',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Nome do Discente', '{nome_estudante}'],
          ['Curso', '{curso_estudante}'],
          ['Matrícula', '{matricula_estudante}'],
          ['Empresa / Instituição', '{empresa_nome}'],
          ['Período Atividades', '{inicio_atividades} a {fim_atividades}'],
          ['C.H. Total', '{total_hours} h'],
        ],
      },
      {
        title: 'Justificativa / Descrição das Atividades',
        type: 'paragraph',
        content: '{justificativa}',
      },
    ],
    signatureLines: [{ label: 'Discente' }, { label: 'Coordenador de Estágios' }],
  }
}

export function buildStudentEvaluationSchema(): PDFDocumentSchema {
  return {
    title: 'Ficha de Avaliação do Estagiário',
    header: DEFAULT_HEADER,
    sections: [
      {
        title: 'Dados do Estágio',
        type: 'table',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Nome do Discente', '{nome_estudante}'],
          ['Curso', '{curso_estudante}'],
          ['Matrícula', '{matricula_estudante}'],
          ['Empresa / Instituição', '{empresa_nome}'],
          ['Supervisor Avaliador', '{nome_supervisor}'],
          ['Cargo', '{cargo_supervisor}'],
          ['Período Avaliado', '{inicio_periodo} a {fim_periodo}'],
        ],
      },
      {
        title: '1. Pontualidade e Assiduidade',
        type: 'paragraph',
        content: '{avaliacao_pontualidade}',
      },
      {
        title: '2. Postura Profissional',
        type: 'paragraph',
        content: '{avaliacao_postura}',
      },
      {
        title: '3. Conhecimento Técnico',
        type: 'paragraph',
        content: '{avaliacao_tecnico}',
      },
      {
        title: '4. Relacionamento Interpessoal',
        type: 'paragraph',
        content: '{avaliacao_relacionamento}',
      },
      {
        title: '5. Considerações Gerais',
        type: 'paragraph',
        content: '{consideracoes}',
      },
    ],
    signatureLines: [{ label: 'Supervisor Avaliador' }, { label: 'Coordenador de Estágios' }],
  }
}
