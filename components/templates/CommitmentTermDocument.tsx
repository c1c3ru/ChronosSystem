import React, { forwardRef } from 'react'

interface CommitmentTermDocumentProps {
    data: {
        // Instituição Concedente
        company_name: string
        company_fantasy_name: string
        company_cnpj: string
        company_address: string
        company_neighborhood: string
        company_city_state: string
        company_zip: string
        company_phone: string
        company_email: string
        company_representative: string
        company_representative_role: string
        company_representative_cpf: string
        company_representative_phone: string

        // Discente
        student_name: string
        student_cpf: string
        student_social_name: string
        student_course: string
        student_id: string
        student_address: string
        student_neighborhood: string
        student_city_state: string
        student_zip: string
        student_phone: string
        student_email_institutional: string
        student_email_personal: string

        // Estágio
        modality: string
        start_date: string
        end_date: string

        // Seguro e Bolsa
        insurance_policy: string
        insurance_company: string
        grant_value: string
        transport_value: string
        has_grant: string
        has_transport: string

        // Docente Orientador
        advisor_name: string
        advisor_siape: string
        advisor_phone: string
        advisor_email: string

        // Supervisor
        supervisor_name: string
        supervisor_education: string
        supervisor_cpf: string
        supervisor_phone: string
        supervisor_email: string

        // Plano de Atividades
        activities_description: string
        expected_results: string
        weekly_hours: string
        schedule: string
    }
}

export const CommitmentTermDocument = forwardRef<HTMLDivElement, CommitmentTermDocumentProps>(({ data }, ref) => {
    const schedule = data.schedule ? JSON.parse(data.schedule) : {}

    const formatDate = (dateString: string) => {
        if (!dateString) return '___/___/_____'
        const [year, month, day] = dateString.split('-')
        return `${day}/${month}/${year}`
    }

    const formatCurrency = (value: string) => {
        if (!value) return '_____'
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
    }

    // Componentes auxiliares para manter o código limpo
    const Label = ({ children }: { children: React.ReactNode }) => (
        <span className="block text-[6pt] font-bold uppercase leading-tight">{children}</span>
    )

    const Value = ({ children }: { children: React.ReactNode }) => (
        <span className="block text-[8pt] leading-tight min-h-[14px]">{children}</span>
    )

    const TableRow = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
        <tr className={className}>{children}</tr>
    )

    const TableCell = ({ children, colSpan = 1, className = '', style = {} }: { children: React.ReactNode, colSpan?: number, className?: string, style?: React.CSSProperties }) => (
        <td colSpan={colSpan} className={`border border-black px-1 py-0.5 align-top ${className}`} style={style}>
            {children}
        </td>
    )

    const SectionHeader = ({ title }: { title: string }) => (
        <div className="w-full bg-gray-200 border border-black border-b-0 text-center font-bold text-[8pt] py-0.5 uppercase">
            {title}
        </div>
    )

    return (
        <div ref={ref} className="bg-white text-black font-sans box-border mx-auto" style={{ width: '210mm', padding: '10mm' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                    @media print {
                        @page { margin: 10mm; size: A4; }
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                    .official-table { width: 100%; border-collapse: collapse; border: 1px solid black; font-size: 8pt; margin-bottom: 10px; }
                    .official-table td { border: 1px solid black; padding: 2px 4px; vertical-align: top; }
                    .clause-title { font-weight: bold; margin-top: 10px; margin-bottom: 5px; text-transform: uppercase; font-size: 9pt; }
                    .clause-text { text-align: justify; margin-bottom: 5px; font-size: 9pt; line-height: 1.3; }
                    .list-item { margin-left: 15px; text-indent: -15px; padding-left: 15px; }
                `
            }} />

            {/* --- PÁGINA 1 --- */}

            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-4">
                <img src="/assets/logoifce.png" alt="Logo IFCE" className="h-16 object-contain" />
                <div className="text-center flex-1 px-4">
                    <h1 className="font-bold text-[10pt]">PRÓ-REITORIA DE EXTENSÃO</h1>
                    <h2 className="text-[9pt]">COORDENAÇÃO DE ESTÁGIOS E ACOMPANHAMENTO DE EGRESSOS</h2>
                    <h3 className="text-[9pt] mt-2">IFCE Campus Maracanaú</h3>
                    <h4 className="text-[9pt]">Setor de Acompanhamento de Estágio</h4>
                </div>
                <img src="/assets/brasao.png" alt="Brasão Brasil" className="h-16 object-contain" />
            </div>

            <h1 className="text-center font-bold text-[12pt] mb-4 uppercase">TERMO DE COMPROMISSO DE ESTÁGIO</h1>

            <p className="text-justify text-[9pt] mb-4">
                Nos termos da Lei nº 11.788, de 25/09/2008, e do Regulamento de Estágio do IFCE, os entes abaixo qualificados celebram entre si o presente <strong>Termo de Compromisso de Estágio</strong>, regrado pelas cláusulas que seguem:
            </p>

            {/* Instituição de Ensino */}
            <SectionHeader title="Instituição de Ensino – IFCE" />
            <table className="official-table">
                <tbody>
                    <TableRow>
                        <TableCell colSpan={3}>
                            <Label>CAMPUS</Label>
                            <Value>MARACANAÚ</Value>
                        </TableCell>
                        <TableCell>
                            <Label>CNPJ</Label>
                            <Value>10.744.098/0009-00</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)</Label>
                            <Value>AV. VICE PRESIDENTE JOSÉ DE ALENCAR, S/N</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Label>BAIRRO</Label>
                            <Value>JEREISSATI I</Value>
                        </TableCell>
                        <TableCell>
                            <Label>MUNICÍPIO</Label>
                            <Value>MARACANAÚ</Value>
                        </TableCell>
                        <TableCell>
                            <Label>CEP</Label>
                            <Value>61.939-140</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Label>DDD + TELEFONE</Label>
                            <Value>85 3512-8709</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>E-MAIL</Label>
                            <Value>gabmaracanau@ifce.edu.br</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>REPRESENTANTE PARA ESTE ESPECÍFICO FIM</Label>
                            <Value>ELDER KENED CARDOSO</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={3}>
                            <Label>CARGO/QUALIFICAÇÃO</Label>
                            <Value>ASSISTENTE EM ADMINISTRAÇÃO</Value>
                        </TableCell>
                        <TableCell>
                            <Label>SIAPE</Label>
                            <Value>1818968</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Label>E-MAIL</Label>
                            <Value>estagio.maracanau@ifce.edu.br</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>DDD+TELEFONE</Label>
                            <Value>85 3512-8706</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            {/* Instituição Concedente */}
            <SectionHeader title="Instituição Concedente de vaga de estágio – CONCEDENTE DO ESTÁGIO" />
            <table className="official-table">
                <tbody>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>RAZÃO SOCIAL</Label>
                            <Value>{data.company_name}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>NOME DE FANTASIA OU DE PESSOA FÍSICA</Label>
                            <Value>{data.company_fantasy_name}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Label>CNPJ OU REGISTRO NO CONSELHO</Label>
                            <Value>{data.company_cnpj}</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)</Label>
                            <Value>{data.company_address}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Label>BAIRRO</Label>
                            <Value>{data.company_neighborhood}</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>MUNICÍPIO-UF</Label>
                            <Value>{data.company_city_state}</Value>
                        </TableCell>
                        <TableCell>
                            <Label>CEP</Label>
                            <Value>{data.company_zip}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Label>DDD + TELEFONE</Label>
                            <Value>{data.company_phone}</Value>
                        </TableCell>
                        <TableCell colSpan={3}>
                            <Label>E-MAIL</Label>
                            <Value>{data.company_email}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>RESPONSÁVEL LEGAL PELA INSTITUIÇÃO PARA ESTE FIM</Label>
                            <Value>{data.company_representative}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Label>CARGO/QUALIFICAÇÃO</Label>
                            <Value>{data.company_representative_role}</Value>
                        </TableCell>
                        <TableCell>
                            <Label>CPF</Label>
                            <Value>{data.company_representative_cpf}</Value>
                        </TableCell>
                        <TableCell>
                            <Label>DDD + TELEFONE</Label>
                            <Value>{data.company_representative_phone}</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            {/* Discente */}
            <SectionHeader title="DISCENTE ESTAGIÁRIO(A)" />
            <table className="official-table">
                <tbody>
                    <TableRow>
                        <TableCell colSpan={3}>
                            <Label>NOME</Label>
                            <Value>{data.student_name}</Value>
                        </TableCell>
                        <TableCell>
                            <Label>CPF</Label>
                            <Value>{data.student_cpf}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>NOME SOCIAL</Label>
                            <Value>{data.student_social_name}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={3}>
                            <Label>CURSO</Label>
                            <Value>{data.student_course}</Value>
                        </TableCell>
                        <TableCell>
                            <Label>MATRICULA</Label>
                            <Value>{data.student_id}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)</Label>
                            <Value>{data.student_address}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Label>MUNICÍPIO-UF</Label>
                            <Value>{data.student_city_state}</Value>
                        </TableCell>
                        <TableCell>
                            <Label>CEP</Label>
                            <Value>{data.student_zip}</Value>
                        </TableCell>
                        <TableCell>
                            <Label>DDD + TELEFONE</Label>
                            <Value>{data.student_phone}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>E-MAIL INSTITUCIONAL</Label>
                            <Value>{data.student_email_institutional}</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            {/* --- PÁGINA 2 --- */}
            <div style={{ pageBreakBefore: 'always' }}></div>

            <div className="clause-title">CLÁUSULA PRIMEIRA – DO OBJETO, DE SUA QUALIFICAÇÃO E DA VIGÊNCIA DO CONTRATO</div>
            <div className="clause-text">
                I - O estágio supervisionado regrado por este termo será OBRIGATÓRIO, com atividades compatíveis com a formação recebida no curso do DISCENTE ESTAGIÁRIO, e realizadas de forma <strong>{data.modality ? data.modality.toUpperCase() : '_______'}</strong> (presencial, remota ou híbrida), tudo conforme plano de atividades constante da CLÁUSULA SEXTA.
            </div>
            <div className="clause-text">
                II - Este termo de compromisso terá vigência de <strong>{formatDate(data.start_date)}</strong> a <strong>{formatDate(data.end_date)}</strong>, podendo ser rescindido a qualquer tempo, unilateralmente, mediante comunicação formal, independente de pré-aviso.
            </div>
            <div className="clause-text">
                III - O aditamento deste termo será realizado em caso das necessidades previstas no Regulamento de Estágio do IFCE.
            </div>

            <div className="clause-title">CLÁUSULA SEGUNDA – DOS DIREITOS E DEVERES DO IFCE</div>
            <div className="clause-text">Caberá à unidade do IFCE onde o discente estuda:</div>
            <div className="clause-text list-item">I - Avaliar as instalações da CONCEDENTE DO ESTÁGIO e sua adequação às atividades previstas no plano de atividades;</div>
            <div className="clause-text list-item">II - Indicar Docente orientador como responsável pelo acompanhamento e avaliação das atividades do DISCENTE ESTAGIÁRIO;</div>
            <div className="clause-text list-item">III - Exigir do DISCENTE ESTAGIÁRIO a apresentação de relatório das atividades;</div>
            <div className="clause-text list-item">IV - Reorientar o DISCENTE ESTAGIÁRIO para outro local em caso de descumprimento de normas pertinentes ao estágio supervisionado;</div>
            <div className="clause-text list-item">V - Manter comunicação com a parte concedente do estágio para o bom desenvolvimento das atividades.</div>

            <div className="clause-title">CLÁUSULA TERCEIRA – DOS DIREITOS E DEVERES DA CONCEDENTE DO ESTÁGIO</div>
            <div className="clause-text">Caberá à Instituição Concedente da vaga de Estágio:</div>
            <div className="clause-text list-item">I - Oferecer ao DISCENTE ESTAGIÁRIO, inclusive aquele com deficiência, condições de desenvolvimento vivencial, treinamento prático e de relacionamento humano com observância do plano de atividades do estagiário que passa a ser parte integrante deste documento;</div>
            <div className="clause-text list-item">II - Proporcionar ao IFCE condições para o aprimoramento e avaliação do DISCENTE ESTAGIÁRIO;</div>
            <div className="clause-text list-item">III - Designar profissional com formação e/ou experiência profissional na área para supervisionar das atividades do estágio;</div>
            <div className="clause-text list-item">IV - Estabelecer nos períodos de atividades acadêmicas redução de, pelo menos, a metade da jornada a ser cumprida em estágio;</div>
            <div className="clause-text list-item">V - Conceder período de 30 dias de recesso ao DISCENTE ESTAGIÁRIO sempre que o estágio tenha duração igual ou superior a 01(um) ano ou proporcional quando de duração inferior, a ser gozado preferencialmente durante as férias escolares;</div>
            <div className="clause-text list-item">VI - Fornecer, por ocasião do encerramento do estágio, termo de realização do estágio com indicação resumida das atividades desenvolvidas, dos períodos e da avaliação de desempenho do DISCENTE ESTAGIÁRIO;</div>
            <div className="clause-text">
                PARÁGRAFO ÚNICO – A CONCEDENTE DO ESTÁGIO autoriza o IFCE ao uso de suas informações para cadastro em sistemas competentes.
            </div>

            <div className="clause-title">CLÁUSULA QUARTA – DOS DIREITOS E DEVERES DO DISCENTE ESTAGIÁRIO</div>
            <div className="clause-text">Caberá ao DISCENTE ESTAGIÁRIO:</div>
            <div className="clause-text list-item">I - Cumprir as atividades estabelecidas no plano de atividades;</div>
            <div className="clause-text list-item">II - Respeitar as normas internas da CONCEDENTE DO ESTÁGIO;</div>
            <div className="clause-text list-item">III - Respeitar a legislação pertinente ao estágio;</div>
            <div className="clause-text list-item">IV - Cumprir as orientações do Docente orientador e/ou do Supervisor do estágio.</div>

            <div className="clause-title">CLÁUSULA QUINTA – DO SEGURO OBRIGATÓRIO E DA REMUNERAÇÃO</div>
            <div className="clause-text list-item">
                I - A concedente neste ato contrata em favor do DISCENTE ESTAGIÁRIO seguro contra acidentes pessoais, com cobertura limitada ao local e período de estágio, mediante apólice da empresa <strong>{data.insurance_company || '________________________'}</strong>.
            </div>

            {data.has_grant === 'true' ? (
                <div className="clause-text list-item">
                    II - A CONCEDENTE DO ESTÁGIO remunerará mensalmente o DISCENTE ESTAGIÁRIO através de bolsa-auxílio no valor de <strong>{formatCurrency(data.grant_value)}</strong>.
                </div>
            ) : (
                <div className="clause-text list-item">
                    II - A CONCEDENTE DO ESTÁGIO não remunerará mensalmente o DISCENTE ESTAGIÁRIO.
                </div>
            )}

            <div className="clause-text text-red-500 text-[8pt] italic my-1">(apagar o inciso que não for utilizado e atentar quanto a numeração dos incisos)</div>

            {data.has_transport === 'true' ? (
                <div className="clause-text list-item">
                    III - A CONCEDENTE DO ESTÁGIO fornecerá ao DISCENTE ESTAGIÁRIO auxílio-transporte no valor de <strong>{formatCurrency(data.transport_value)}</strong>.
                </div>
            ) : (
                <div className="clause-text list-item">
                    III - A CONCEDENTE DO ESTÁGIO não fornecerá ao DISCENTE ESTAGIÁRIO auxílio-transporte.
                </div>
            )}

            <div className="clause-text text-red-500 text-[8pt] italic my-1">(apagar o inciso que não for utilizado e atentar quanto a numeração dos incisos)</div>

            {/* --- PÁGINA 3 --- */}
            <div style={{ pageBreakBefore: 'always' }}></div>

            <div className="clause-title">CLÁUSULA SEXTA – DO DOCENTE ORIENTADOR E DO SUPERVISOR DO ESTÁGIO</div>
            <div className="clause-text">
                I - O IFCE designa o(a) professor(a) a seguir qualificado(a) como Docente orientador do estágio, para cumprir funções previstas no Regulamento de Estágio do IFCE.
            </div>

            <SectionHeader title="DOCENTE ORIENTADOR" />
            <table className="official-table">
                <tbody>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>NOME</Label>
                            <Value>{data.advisor_name}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Label>SIAPE</Label>
                            <Value>{data.advisor_siape}</Value>
                        </TableCell>
                        <TableCell>
                            <Label>DDD + TELEFONE</Label>
                            <Value>{data.advisor_phone}</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>E-MAIL</Label>
                            <Value>{data.advisor_email}</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            <div className="clause-text">
                II - A CONCEDENTE DO ESTÁGIO designa o profissional a seguir qualificado(a) como Supervisor do Estágio, para cumprir funções previstas Regulamento de Estágio do IFCE.
            </div>

            <SectionHeader title="SUPERVISOR DO ESTÁGIO" />
            <table className="official-table">
                <tbody>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>NOME</Label>
                            <Value>{data.supervisor_name}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>FORMAÇÃO OU EXPERIÊNCIA PROFISSIONAL</Label>
                            <Value>{data.supervisor_education}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Label>CPF</Label>
                            <Value>{data.supervisor_cpf}</Value>
                        </TableCell>
                        <TableCell>
                            <Label>DDD + TELEFONE</Label>
                            <Value>{data.supervisor_phone}</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>E-MAIL</Label>
                            <Value>{data.supervisor_email}</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            <div className="clause-title">CLÁUSULA SÉTIMA – DO PLANO DE ATIVIDADES, DO CRONOGRAMA E DA CARGA HORÁRIA DO ESTÁGIO</div>
            <div className="clause-text">
                I - O <strong>Plano de Atividades</strong> do estágio é acordado entre o Docente Orientador, o Supervisor do Estágio e o DISCENTE ESTAGIÁRIO, e se configura conforme o quadro abaixo.
            </div>

            <SectionHeader title="ATIVIDADES A SEREM DESENVOLVIDAS" />
            <div className="border border-black p-2 min-h-[100px] text-[9pt] whitespace-pre-line mb-2">
                {data.activities_description}
            </div>

            <SectionHeader title="RESULTADOS ESPERADOS" />
            <div className="border border-black p-2 min-h-[100px] text-[9pt] whitespace-pre-line mb-4">
                {data.expected_results}
            </div>

            <div className="clause-text">
                II - A carga horária semanal de estágio será de <strong>{data.weekly_hours}</strong> horas, distribuídas conforme detalhado no quadro abaixo:
            </div>

            <table className="w-full border-collapse border border-black text-center text-[7pt] mb-4">
                <thead>
                    <tr>
                        <th className="border border-black p-1 bg-gray-100" rowSpan={2} style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', width: '20px' }}>TURNO</th>
                        <th className="border border-black p-1 bg-gray-100" colSpan={2}>SEGUNDA-FEIRA</th>
                        <th className="border border-black p-1 bg-gray-100" colSpan={2}>TERÇA-FEIRA</th>
                        <th className="border border-black p-1 bg-gray-100" colSpan={2}>QUARTA-FEIRA</th>
                        <th className="border border-black p-1 bg-gray-100" colSpan={2}>QUINTA-FEIRA</th>
                        <th className="border border-black p-1 bg-gray-100" colSpan={2}>SEXTA-FEIRA</th>
                        <th className="border border-black p-1 bg-gray-100" colSpan={2}>SÁBADO</th>
                        <th className="border border-black p-1 bg-gray-100" colSpan={2}>DOMINGO</th>
                    </tr>
                    <tr>
                        {Array(7).fill(null).map((_, i) => (
                            <React.Fragment key={i}>
                                <th className="border border-black p-0.5 w-10 text-[6pt]">INÍCIO</th>
                                <th className="border border-black p-0.5 w-10 text-[6pt]">FIM</th>
                            </React.Fragment>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {['morning', 'afternoon', 'night'].map((shift, idx) => {
                        const shiftLabels = { morning: '1º', afternoon: '2º', night: '3º' }
                        return (
                            <tr key={shift}>
                                <td className="border border-black p-1 font-bold">{shiftLabels[shift as keyof typeof shiftLabels]}</td>
                                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => {
                                    const time = schedule[shift]?.[day] || ''
                                    const [start, end] = time.includes('-') ? time.split('-') : ['', '']
                                    return (
                                        <React.Fragment key={day}>
                                            <td className="border border-black p-0.5 h-6">{start}</td>
                                            <td className="border border-black p-0.5 h-6">{end}</td>
                                        </React.Fragment>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {/* --- PÁGINA 4 --- */}
            <div style={{ pageBreakBefore: 'always' }}></div>

            <div className="clause-title">CLÁUSULA OITAVA – DO CANCELAMENTO DO ESTÁGIO</div>
            <div className="clause-text">Constituem motivos para cessação automática do presente Termo de Compromisso:</div>
            <div className="clause-text list-item">I - O não cumprimento das cláusulas estabelecidas neste documento;</div>
            <div className="clause-text list-item">II - A conclusão do curso;</div>
            <div className="clause-text list-item">III - O abandono do estágio, do semestre ou do curso;</div>
            <div className="clause-text list-item">IV - O cancelamento ou trancamento da matrícula no curso;</div>
            <div className="clause-text list-item">V - Pedido de rescisão por qualquer das partes definidas na inicial deste termo.</div>

            <div className="clause-title">CLÁUSULA NOVA – DAS DISPOSIÇÕES ESPECIAIS E DO FORO</div>
            <div className="clause-text list-item">I - A todos os partícipes no estágio compete zelar pelo cumprimento deste termo de compromisso.</div>
            <div className="clause-text list-item">II - As partes elegem o Foro da Justiça Federal de Fortaleza, Seção Judiciária do Estado do Ceará, renunciando, desde logo, a qualquer outro, por mais privilégios que venha a ter, para dirimir qualquer questão que se originar deste termo de compromisso e que não possa ser resolvido amigavelmente.</div>

            <p className="mt-8 mb-8 text-justify text-[9pt]">
                Estando de acordo com o que ficou acima expresso, vai o presente instrumento assinado pelas partes citadas, para que se cumpram os efeitos legais.
            </p>

            <p className="text-right mb-12 text-[9pt]">
                Maracanaú-CE, _____ de _______________ de 20_____.
            </p>

            <div className="space-y-12 mt-16">
                <div className="grid grid-cols-2 gap-8">
                    <div className="text-center">
                        <div className="border-t border-black w-full pt-1 text-[8pt]">Representante do IFCE</div>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-black w-full pt-1 text-[8pt]">Representante da CONCEDENTE DO ESTÁGIO</div>
                    </div>
                </div>

                <div className="text-center">
                    <div className="border-t border-black w-2/3 mx-auto pt-1 text-[8pt]">DISCENTE ESTAGIÁRIO(A)</div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="text-center">
                        <div className="border-t border-black w-full pt-1 text-[8pt]">Docente Orientador</div>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-black w-full pt-1 text-[8pt]">Supervisor do Estágio</div>
                    </div>
                </div>
            </div>
        </div>
    )
})

CommitmentTermDocument.displayName = 'CommitmentTermDocument'
