import React, { forwardRef } from 'react'
import { OfficialHeader } from '@/components/OfficialFormTemplate'

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
    const schedule = JSON.parse(data.schedule || '{}')

    const formatDate = (dateString: string) => {
        if (!dateString) return '___/___/_____'
        const [year, month, day] = dateString.split('-')
        return `${day}/${month}/${year}`
    }

    const formatCurrency = (value: string) => {
        if (!value) return '_____'
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
    }

    return (
        <div ref={ref} className="bg-white text-black p-8 max-w-[210mm] mx-auto text-[10pt] font-serif leading-tight">
            {/* Cabeçalho Reutilizável */}
            <OfficialHeader
                title="TERMO DE COMPROMISSO DE ESTÁGIO"
                showLogos={true}
            />

            <p className="text-justify mb-4">
                Nos termos da Lei nº 11.788, de 25/09/2008, e do Regulamento de Estágio do IFCE, os entes abaixo qualificados celebram entre si o presente Termo de Compromisso de Estágio, regrado pelas cláusulas que seguem:
            </p>

            {/* Instituição de Ensino */}
            <div className="mb-4 border border-black">
                <div className="bg-gray-200 font-bold p-1 border-b border-black">Instituição de Ensino – IFCE</div>
                <div className="grid grid-cols-4 border-b border-black">
                    <div className="col-span-3 p-1 border-r border-black">
                        <span className="font-bold text-[8pt] block">CAMPUS</span>
                        MARACANAÚ
                    </div>
                    <div className="col-span-1 p-1">
                        <span className="font-bold text-[8pt] block">CNPJ</span>
                        10.744.098/0009-00
                    </div>
                </div>
                <div className="p-1 border-b border-black">
                    <span className="font-bold text-[8pt] block">ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)</span>
                    AV. VICE PRESIDENTE JOSÉ DE ALENCAR, S/N
                </div>
                <div className="grid grid-cols-4 border-b border-black">
                    <div className="col-span-2 p-1 border-r border-black">
                        <span className="font-bold text-[8pt] block">BAIRRO</span>
                        JEREISSATI I
                    </div>
                    <div className="col-span-1 p-1 border-r border-black">
                        <span className="font-bold text-[8pt] block">MUNICÍPIO</span>
                        MARACANAÚ
                    </div>
                    <div className="col-span-1 p-1">
                        <span className="font-bold text-[8pt] block">CEP</span>
                        61.939-140
                    </div>
                </div>
                <div className="grid grid-cols-2 border-b border-black">
                    <div className="p-1 border-r border-black">
                        <span className="font-bold text-[8pt] block">DDD + TELEFONE</span>
                        85 3512-8709
                    </div>
                    <div className="p-1">
                        <span className="font-bold text-[8pt] block">E-MAIL</span>
                        gabmaracanau@ifce.edu.br
                    </div>
                </div>
                <div className="p-1 border-b border-black">
                    <span className="font-bold text-[8pt] block">REPRESENTANTE PARA ESTE ESPECÍFICO FIM</span>
                    ELDER KENED CARDOSO
                </div>
                <div className="grid grid-cols-3 border-b border-black">
                    <div className="col-span-2 p-1 border-r border-black">
                        <span className="font-bold text-[8pt] block">CARGO/QUALIFICAÇÃO</span>
                        ASSISTENTE EM ADMINISTRAÇÃO
                    </div>
                    <div className="col-span-1 p-1">
                        <span className="font-bold text-[8pt] block">SIAPE</span>
                        1818968
                    </div>
                </div>
                <div className="grid grid-cols-2">
                    <div className="p-1 border-r border-black">
                        <span className="font-bold text-[8pt] block">E-MAIL</span>
                        estagio.maracanau@ifce.edu.br
                    </div>
                    <div className="p-1">
                        <span className="font-bold text-[8pt] block">DDD+TELEFONE</span>
                        85 3512-8706
                    </div>
                </div>
            </div>

            {/* Instituição Concedente */}
            <div className="mb-4 border border-black">
                <div className="bg-gray-200 font-bold p-1 border-b border-black">Instituição Concedente de vaga de estágio – CONCEDENTE DO ESTÁGIO</div>
                <div className="p-1 border-b border-black">
                    <span className="font-bold text-[8pt] block">RAZÃO SOCIAL</span>
                    {data.company_name}
                </div>
                <div className="p-1 border-b border-black">
                    <span className="font-bold text-[8pt] block">NOME DE FANTASIA OU DE PESSOA FÍSICA</span>
                    {data.company_fantasy_name}
                </div>
                <div className="p-1 border-b border-black">
                    <span className="font-bold text-[8pt] block">CNPJ OU REGISTRO NO CONSELHO</span>
                    {data.company_cnpj}
                </div>
                <div className="p-1 border-b border-black">
                    <span className="font-bold text-[8pt] block">ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)</span>
                    {data.company_address}
                </div>
                <div className="grid grid-cols-4 border-b border-black">
                    <div className="col-span-2 p-1 border-r border-black">
                        <span className="font-bold text-[8pt] block">BAIRRO</span>
                        {data.company_neighborhood}
                    </div>
                    <div className="col-span-1 p-1 border-r border-black">
                        <span className="font-bold text-[8pt] block">MUNICÍPIO-UF</span>
                        {data.company_city_state}
                    </div>
                    <div className="col-span-1 p-1">
                        <span className="font-bold text-[8pt] block">CEP</span>
                        {data.company_zip}
                    </div>
                </div>
                <div className="grid grid-cols-2 border-b border-black">
                    <div className="p-1 border-r border-black">
                        <span className="font-bold text-[8pt] block">DDD + TELEFONE</span>
                        {data.company_phone}
                    </div>
                    <div className="p-1">
                        <span className="font-bold text-[8pt] block">E-MAIL</span>
                        {data.company_email}
                    </div>
                </div>
                <div className="p-1 border-b border-black">
                    <span className="font-bold text-[8pt] block">RESPONSÁVEL LEGAL PELA INSTITUIÇÃO PARA ESTE FIM</span>
                    {data.company_representative}
                </div>
                <div className="grid grid-cols-3">
                    <div className="col-span-1 p-1 border-r border-black">
                        <span className="font-bold text-[8pt] block">CARGO/QUALIFICAÇÃO</span>
                        {data.company_representative_role}
                    </div>
                    <div className="col-span-1 p-1 border-r border-black">
                        <span className="font-bold text-[8pt] block">CPF</span>
                        {data.company_representative_cpf}
                    </div>
                    <div className="col-span-1 p-1">
                        <span className="font-bold text-[8pt] block">DDD + TELEFONE</span>
                        {data.company_representative_phone}
                    </div>
                </div>
            </div>

            {/* Discente */}
            <div className="mb-4 border border-black page-break-inside-avoid">
                <div className="bg-gray-200 font-bold p-1 border-b border-black">DISCENTE ESTAGIÁRIO(A)</div>
                <div className="grid grid-cols-3 border-b border-black">
                    <div className="col-span-2 p-1 border-r border-black">
                        <span className="font-bold text-[8pt] block">NOME</span>
                        {data.student_name}
                    </div>
                    <div className="col-span-1 p-1">
                        <span className="font-bold text-[8pt] block">CPF</span>
                        {data.student_cpf}
                    </div>
                </div>
                <div className="p-1 border-b border-black">
                    <span className="font-bold text-[8pt] block">NOME SOCIAL</span>
                    {data.student_social_name}
                </div>
                <div className="grid grid-cols-3 border-b border-black">
                    <div className="col-span-2 p-1 border-r border-black">
                        <span className="font-bold text-[8pt] block">CURSO</span>
                        {data.student_course}
                    </div>
                    <div className="col-span-1 p-1">
                        <span className="font-bold text-[8pt] block">MATRICULA</span>
                        {data.student_id}
                    </div>
                </div>
                <div className="p-1 border-b border-black">
                    <span className="font-bold text-[8pt] block">ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)</span>
                    {data.student_address}
                </div>
                <div className="grid grid-cols-4 border-b border-black">
                    <div className="col-span-2 p-1 border-r border-black">
                        <span className="font-bold text-[8pt] block">BAIRRO/DISTRITO</span>
                        {data.student_neighborhood}
                    </div>
                    <div className="col-span-1 p-1 border-r border-black">
                        <span className="font-bold text-[8pt] block">MUNICÍPIO-UF</span>
                        {data.student_city_state}
                    </div>
                    <div className="col-span-1 p-1">
                        <span className="font-bold text-[8pt] block">CEP</span>
                        {data.student_zip}
                    </div>
                </div>
                <div className="grid grid-cols-3 border-b border-black">
                    <div className="p-1 border-r border-black">
                        <span className="font-bold text-[8pt] block">DDD + TELEFONE</span>
                        {data.student_phone}
                    </div>
                    <div className="p-1 border-r border-black">
                        <span className="font-bold text-[8pt] block">E-MAIL INSTITUCIONAL</span>
                        {data.student_email_institutional}
                    </div>
                    <div className="p-1">
                        <span className="font-bold text-[8pt] block">E-MAIL PESSOAL</span>
                        {data.student_email_personal}
                    </div>
                </div>
            </div>

            {/* Cláusulas */}
            <div className="space-y-4 text-justify">
                <div>
                    <h3 className="font-bold mb-2">CLÁUSULA PRIMEIRA – DO OBJETO, DE SUA QUALIFICAÇÃO E DA VIGÊNCIA DO CONTRATO</h3>
                    <ul className="list-none pl-4 space-y-2">
                        <li>I - O estágio supervisionado regrado por este termo será OBRIGATÓRIO, com atividades compatíveis com a formação recebida no curso do Discente Estagiário, e realizadas de forma <strong>{data.modality.toUpperCase()}</strong> (presencial, remota ou híbrida), tudo conforme plano de atividades constante da CLÁUSULA SEXTA.</li>
                        <li>II - Este termo de compromisso terá vigência de <strong>{formatDate(data.start_date)}</strong> a <strong>{formatDate(data.end_date)}</strong>, podendo ser rescindido a qualquer tempo, unilateralmente, mediante comunicação formal, independente de pré-aviso.</li>
                        <li>III - O aditamento deste termo será realizado em caso das necessidades previstas no Regulamento de Estágio do IFCE.</li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold mb-2">CLÁUSULA SEGUNDA – DOS DIREITOS E DEVERES DO IFCE</h3>
                    <p className="mb-2">Caberá à unidade do IFCE onde o discente estuda:</p>
                    <ul className="list-none pl-4 space-y-1">
                        <li>I - Avaliar as instalações da CONCEDENTE DO ESTÁGIO e sua adequação às atividades previstas no plano de atividades;</li>
                        <li>II - Indicar Docente orientador como responsável pelo acompanhamento e avaliação das atividades do Discente Estagiário;</li>
                        <li>III - Exigir do Discente Estagiário a apresentação de relatório das atividades;</li>
                        <li>IV - Reorientar o Discente Estagiário para outro local em caso de descumprimento de normas pertinentes ao estágio supervisionado;</li>
                        <li>V - Manter comunicação com a parte concedente do estágio para o bom desenvolvimento das atividades.</li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold mb-2">CLÁUSULA TERCEIRA – DOS DIREITOS E DEVERES DA CONCEDENTE DO ESTÁGIO</h3>
                    <p className="mb-2">Caberá à Instituição Concedente da vaga de Estágio:</p>
                    <ul className="list-none pl-4 space-y-1">
                        <li>I - Oferecer ao Discente Estagiário, inclusive aquele com deficiência, condições de desenvolvimento vivencial, treinamento prático e de relacionamento humano com observância do plano de atividades do estagiário que passa a ser parte integrante deste documento;</li>
                        <li>II - Proporcionar ao IFCE condições para o aprimoramento e avaliação do Discente Estagiário;</li>
                        <li>III - Designar profissional com formação e/ou experiência profissional na área para supervisionar das atividades do estágio;</li>
                        <li>IV - Estabelecer nos períodos de atividades acadêmicas redução de, pelo menos, a metade da jornada a ser cumprida em estágio;</li>
                        <li>V - Conceder período de 30 dias de recesso ao Discente Estagiário sempre que o estágio tenha duração igual ou superior a 01(um) ano ou proporcional quando de duração inferior, a ser gozado preferencialmente durante as férias escolares;</li>
                        <li>VI - Fornecer, por ocasião do encerramento do estágio, termo de realização do estágio com indicação resumida das atividades desenvolvidas, dos períodos e da avaliação de desempenho do Discente Estagiário;</li>
                    </ul>
                    <p className="mt-2 pl-4">Parágrafo único – a CONCEDENTE DO ESTÁGIO autoriza o IFCE ao uso de suas informações para cadastro em sistemas competentes.</p>
                </div>

                <div className="page-break-before">
                    <h3 className="font-bold mb-2">CLÁUSULA QUARTA – DOS DIREITOS E DEVERES DO Discente Estagiário</h3>
                    <p className="mb-2">Caberá ao Discente Estagiário:</p>
                    <ul className="list-none pl-4 space-y-1">
                        <li>I - Cumprir as atividades estabelecidas no plano de atividades;</li>
                        <li>II - Respeitar as normas internas da CONCEDENTE DO ESTÁGIO;</li>
                        <li>III - Respeitar a legislação pertinente ao estágio;</li>
                        <li>IV - Cumprir as orientações do Docente orientador e/ou do Supervisor do estágio.</li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold mb-2">CLÁUSULA QUINTA – DO SEGURO OBRIGATÓRIO E DA REMUNERAÇÃO</h3>
                    <ul className="list-none pl-4 space-y-4">
                        <li>I - A concedente neste ato contrata em favor do Discente Estagiário seguro contra acidentes pessoais, com cobertura limitada ao local e período de estágio, mediante apólice <strong>{data.insurance_policy || '________________________'}</strong> da empresa <strong>{data.insurance_company || '________________________'}</strong>.</li>

                        {data.has_grant === 'true' ? (
                            <li>II - A CONCEDENTE DO ESTÁGIO remunerará mensalmente o Discente Estagiário através de bolsa-auxílio no valor de <strong>{formatCurrency(data.grant_value)}</strong>.</li>
                        ) : (
                            <li>II - A CONCEDENTE DO ESTÁGIO não remunerará mensalmente o Discente Estagiário.</li>
                        )}

                        {data.has_transport === 'true' ? (
                            <li>III - A CONCEDENTE DO ESTÁGIO fornecerá ao Discente Estagiário auxílio-transporte no valor de <strong>{formatCurrency(data.transport_value)}</strong>.</li>
                        ) : (
                            <li>III - A CONCEDENTE DO ESTÁGIO não fornecerá ao Discente Estagiário auxílio-transporte.</li>
                        )}
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold mb-2">CLÁUSULA SEXTA – DO DOCENTE ORIENTADOR E DO SUPERVISOR DO ESTÁGIO</h3>
                    <p className="mb-2">I - O IFCE designa o(a) professor(a) a seguir qualificado(a) como Docente orientador do estágio, para cumprir funções previstas no Regulamento de Estágio do IFCE.</p>

                    <div className="mb-4 border border-black">
                        <div className="bg-gray-200 font-bold p-1 border-b border-black">DOCENTE ORIENTADOR</div>
                        <div className="p-1 border-b border-black">
                            <span className="font-bold text-[8pt] block">NOME</span>
                            {data.advisor_name}
                        </div>
                        <div className="grid grid-cols-3">
                            <div className="p-1 border-r border-black">
                                <span className="font-bold text-[8pt] block">SIAPE</span>
                                {data.advisor_siape}
                            </div>
                            <div className="p-1 border-r border-black">
                                <span className="font-bold text-[8pt] block">DDD + TELEFONE</span>
                                {data.advisor_phone}
                            </div>
                            <div className="p-1">
                                <span className="font-bold text-[8pt] block">E-MAIL</span>
                                {data.advisor_email}
                            </div>
                        </div>
                    </div>

                    <p className="mb-2">II - A CONCEDENTE DO ESTÁGIO designa o profissional a seguir qualificado(a) como Supervisor do Estágio, para cumprir funções previstas Regulamento de Estágio do IFCE.</p>

                    <div className="mb-4 border border-black">
                        <div className="bg-gray-200 font-bold p-1 border-b border-black">SUPERVISOR DO ESTÁGIO</div>
                        <div className="p-1 border-b border-black">
                            <span className="font-bold text-[8pt] block">NOME</span>
                            {data.supervisor_name}
                        </div>
                        <div className="p-1 border-b border-black">
                            <span className="font-bold text-[8pt] block">FORMAÇÃO OU EXPERIÊNCIA PROFISSIONAL</span>
                            {data.supervisor_education}
                        </div>
                        <div className="grid grid-cols-3">
                            <div className="p-1 border-r border-black">
                                <span className="font-bold text-[8pt] block">CPF</span>
                                {data.supervisor_cpf}
                            </div>
                            <div className="p-1 border-r border-black">
                                <span className="font-bold text-[8pt] block">DDD + TELEFONE</span>
                                {data.supervisor_phone}
                            </div>
                            <div className="p-1">
                                <span className="font-bold text-[8pt] block">E-MAIL</span>
                                {data.supervisor_email}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="page-break-before">
                    <h3 className="font-bold mb-2">CLÁUSULA SÉTIMA – DO PLANO DE ATIVIDADES, DO CRONOGRAMA E DA CARGA HORÁRIA DO ESTÁGIO</h3>
                    <p className="mb-2">I - O Plano de Atividades do estágio é acordado entre o Docente Orientador, o Supervisor do Estágio e o Discente Estagiário, e se configura conforme o quadro abaixo.</p>

                    <div className="mb-4 border border-black">
                        <div className="bg-gray-200 font-bold p-1 border-b border-black text-center">ATIVIDADES A SEREM DESENVOLVIDAS</div>
                        <div className="p-2 min-h-[100px] whitespace-pre-line border-b border-black">
                            {data.activities_description}
                        </div>
                        <div className="bg-gray-200 font-bold p-1 border-b border-black text-center">RESULTADOS ESPERADOS</div>
                        <div className="p-2 min-h-[100px] whitespace-pre-line">
                            {data.expected_results}
                        </div>
                    </div>

                    <p className="mb-2">II - A carga horária semanal de estágio será de <strong>{data.weekly_hours}</strong> horas, distribuídas conforme detalhado no quadro abaixo:</p>

                    <table className="w-full border-collapse border border-black text-center text-[8pt]">
                        <thead>
                            <tr>
                                <th className="border border-black p-1" rowSpan={2}>TURNO</th>
                                <th className="border border-black p-1" colSpan={2}>SEGUNDA</th>
                                <th className="border border-black p-1" colSpan={2}>TERÇA</th>
                                <th className="border border-black p-1" colSpan={2}>QUARTA</th>
                                <th className="border border-black p-1" colSpan={2}>QUINTA</th>
                                <th className="border border-black p-1" colSpan={2}>SEXTA</th>
                                <th className="border border-black p-1" colSpan={2}>SÁBADO</th>
                            </tr>
                            <tr>
                                {Array(6).fill(null).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <th className="border border-black p-1 w-12">INÍCIO</th>
                                        <th className="border border-black p-1 w-12">FIM</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {['morning', 'afternoon', 'night'].map((shift, idx) => {
                                const shiftName = shift === 'morning' ? 'Manhã' : shift === 'afternoon' ? 'Tarde' : 'Noite'
                                return (
                                    <tr key={shift}>
                                        <td className="border border-black p-1 font-bold">{shiftName}</td>
                                        {['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(day => {
                                            const time = schedule[shift]?.[day] || ''
                                            const [start, end] = time.includes('-') ? time.split('-') : ['', '']
                                            return (
                                                <React.Fragment key={day}>
                                                    <td className="border border-black p-1 h-8">{start}</td>
                                                    <td className="border border-black p-1 h-8">{end}</td>
                                                </React.Fragment>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div>
                    <h3 className="font-bold mb-2">CLÁUSULA OITAVA – DO CANCELAMENTO DO ESTÁGIO</h3>
                    <p className="mb-2">Constituem motivos para cessação automática do presente Termo de Compromisso:</p>
                    <ul className="list-none pl-4 space-y-1">
                        <li>I - O não cumprimento das cláusulas estabelecidas neste documento;</li>
                        <li>II - A conclusão do curso;</li>
                        <li>III - O abandono do estágio, do semestre ou do curso;</li>
                        <li>IV - O cancelamento ou trancamento da matrícula no curso;</li>
                        <li>V - Pedido de rescisão por qualquer das partes definidas na inicial deste termo.</li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold mb-2">CLÁUSULA NOVA – DAS DISPOSIÇÕES ESPECIAIS E DO FORO</h3>
                    <ul className="list-none pl-4 space-y-1">
                        <li>I - A todos os partícipes no estágio compete zelar pelo cumprimento deste termo de compromisso.</li>
                        <li>II - As partes elegem o Foro da Justiça Federal de Fortaleza, Seção Judiciária do Estado do Ceará, renunciando, desde logo, a qualquer outro, por mais privilégios que venha a ter, para dirimir qualquer questão que se originar deste termo de compromisso e que não possa ser resolvido amigavelmente.</li>
                    </ul>
                </div>

                <p className="mt-8 mb-8 text-justify">
                    Estando de acordo com o que ficou acima expresso, vai o presente instrumento assinado pelas partes citadas, para que se cumpram os efeitos legais.
                </p>

                <p className="text-right mb-12">
                    Maracanaú-CE, _____ de _______________ de 20_____.
                </p>

                <div className="space-y-12 mt-16">
                    <div className="text-center">
                        <div className="border-t border-black w-2/3 mx-auto pt-2">Representante do IFCE</div>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-black w-2/3 mx-auto pt-2">Representante da CONCEDENTE DO ESTÁGIO</div>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-black w-2/3 mx-auto pt-2">DISCENTE ESTAGIÁRIO</div>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-black w-2/3 mx-auto pt-2">Docente Orientador</div>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-black w-2/3 mx-auto pt-2">Supervisor do estágio</div>
                    </div>
                </div>
            </div>
        </div>
    )
})

CommitmentTermDocument.displayName = 'CommitmentTermDocument'
