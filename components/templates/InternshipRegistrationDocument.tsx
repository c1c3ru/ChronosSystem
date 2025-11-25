import React, { forwardRef } from 'react';

// Tipagem básica dos dados (ajuste conforme seu projeto)
interface DocumentProps {
    data: any;
}

export const InternshipRegistrationDocument = forwardRef<HTMLDivElement, DocumentProps>(({ data }, ref) => {

    // Helper para renderizar checkboxes marcados ou vazios visualmente
    const CheckBox = ({ checked, label }: { checked: boolean; label?: string }) => (
        <div className="flex items-center mr-4">
            <span className="font-mono text-sm mr-1">
                {checked ? '( X )' : '(   )'}
            </span>
            {label && <span className="text-[10px] uppercase">{label}</span>}
        </div>
    );

    // Helper para renderizar campos com label e valor
    const Field = ({ label, value, className = "" }: { label: string; value: string; className?: string }) => (
        <div className={`border-r border-black last:border-r-0 px-2 py-1 h-full ${className}`}>
            <div className="text-[9px] font-bold uppercase leading-none mb-1 text-gray-600">{label}</div>
            <div className="text-[11px] font-medium uppercase min-h-[16px] break-words leading-tight">
                {value || ''}
            </div>
        </div>
    );

    return (
        <div ref={ref} className="bg-white text-black font-sans box-border p-8 mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>

            {/* --- CABEÇALHO --- */}
            <header className="flex justify-between items-start mb-4">
                {/* Logo IFCE */}
                <div className="w-24 h-24 flex items-center justify-center">
                    <img src="/assets/logoifce.png" alt="Logo IFCE" className="max-w-full max-h-full object-contain" />
                </div>

                <div className="flex-1 text-center px-4">
                    <h1 className="text-sm font-bold uppercase">Pró-Reitoria de Extensão</h1>
                    <h2 className="text-sm font-bold uppercase">Coordenação de Estágios e Acompanhamento de Egressos</h2>
                    <div className="mt-2 text-sm uppercase">IFCE Campus Maracanaú</div>
                    <div className="text-sm uppercase">Setor de Acompanhamento de Estágio</div>
                    <h3 className="text-xl font-bold uppercase mt-4">Solicitação de Cadastro no Estágio</h3>
                </div>

                {/* Brasão da República */}
                <div className="w-24 h-24 flex items-center justify-center">
                    <img src="/assets/brasao.png" alt="Brasão" className="max-w-full max-h-full object-contain" />
                </div>
            </header>

            {/* --- CORPO DO FORMULÁRIO (Simulando Tabela com Bordas) --- */}
            <div className="border border-black text-xs">

                {/* Linha 1 */}
                <div className="flex border-b border-black">
                    <div className="w-[70%]"><Field label="Nome" value={data.student_name} /></div>
                    <div className="w-[30%]"><Field label="CPF" value={data.student_cpf} /></div>
                </div>

                {/* Linha 2 */}
                <div className="flex border-b border-black">
                    <div className="w-full"><Field label="Nome Social" value={data.student_social_name} /></div>
                </div>

                {/* Linha 3 */}
                <div className="flex border-b border-black">
                    <div className="w-[70%]"><Field label="Curso" value={data.student_course} /></div>
                    <div className="w-[30%]"><Field label="Matrícula" value={data.student_enrollment} /></div>
                </div>

                {/* Linha 4 */}
                <div className="flex border-b border-black">
                    <div className="w-[60%]"><Field label="Endereço (Logradouro, Número e Complemento)" value={data.student_address} /></div>
                    <div className="w-[40%]"><Field label="Bairro/Distrito" value={data.student_neighborhood} /></div>
                </div>

                {/* Linha 5 */}
                <div className="flex border-b border-black">
                    <div className="w-[40%]"><Field label="Município-UF" value={data.student_city_uf} /></div>
                    <div className="w-[20%]"><Field label="CEP" value={data.student_zip} /></div>
                    <div className="w-[40%]"><Field label="DDD + Telefone" value={data.student_phone} /></div>
                </div>

                {/* Linha 6 - Emails */}
                <div className="flex border-b border-black">
                    <div className="w-[50%]"><Field label="E-mail Institucional" value={data.student_email_institutional} /></div>
                    <div className="w-[50%]"><Field label="E-mail Pessoal" value={data.student_email_personal} /></div>
                </div>

                {/* Linha 7 - Checkboxes Complexos */}
                <div className="flex border-b border-black min-h-[100px]">
                    {/* Cor/Raça */}
                    <div className="w-[25%] border-r border-black p-2">
                        <div className="text-[9px] font-bold uppercase mb-2 text-center">Cor/Raça</div>
                        <div className="flex flex-col gap-1">
                            <CheckBox checked={data.student_race === 'amarelo'} label="Amarelo(a)" />
                            <CheckBox checked={data.student_race === 'branco'} label="Branco(a)" />
                            <CheckBox checked={data.student_race === 'indigena'} label="Indígena" />
                            <CheckBox checked={data.student_race === 'pardo'} label="Pardo(a)" />
                            <CheckBox checked={data.student_race === 'preto'} label="Preto(a)" />
                            <CheckBox checked={data.student_race === 'nao_declarar'} label="Prefiro não declarar" />
                        </div>
                    </div>

                    {/* Etnia */}
                    <div className="w-[35%] border-r border-black p-2 flex flex-col justify-between">
                        <div>
                            <div className="text-[9px] font-bold uppercase mb-2 text-center">Etnia</div>
                            <div className="flex flex-col gap-1">
                                <CheckBox checked={data.student_ethnicity === 'indigena'} label="Indígena" />
                                <CheckBox checked={data.student_ethnicity === 'quilombola'} label="Quilombola" />
                                <CheckBox checked={data.student_ethnicity === 'outra'} label="Outra" />
                                <CheckBox checked={data.student_ethnicity === 'nao_declarar'} label="Prefiro não declarar" />
                            </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-300">
                            <span className="text-[9px]">Informar comunidade se marcar etnia:</span>
                            <div className="border-b border-black mt-4 h-4 text-[11px]">{data.student_ethnicity_community}</div>
                        </div>
                    </div>

                    {/* Deficiência */}
                    <div className="w-[40%] p-2">
                        <div className="text-[9px] font-bold uppercase mb-2 text-center">Apenas para pessoa com deficiência e/ou AH/SD</div>
                        <div className="flex flex-col gap-1">
                            <CheckBox checked={data.student_disability === 'alta_habilidade'} label="Alta habilidade/superdotação" />
                            <CheckBox checked={data.student_disability === 'auditiva'} label="Deficiência auditiva" />
                            <CheckBox checked={data.student_disability === 'intelectual'} label="Deficiência intelectual" />
                            <CheckBox checked={data.student_disability === 'motora'} label="Deficiência motora" />
                            <CheckBox checked={data.student_disability === 'visual_baixa'} label="Deficiência visual/baixa visão" />
                            <CheckBox checked={data.student_disability === 'visual'} label="Deficiência visual" />
                            <CheckBox checked={data.student_disability === 'surdocegueira'} label="Surdocegueira" />
                        </div>
                    </div>
                </div>

                {/* --- DADOS DA EMPRESA --- */}
                <div className="flex border-b border-black bg-gray-100">
                    <div className="w-full px-2 py-1 text-[9px] font-bold uppercase text-center border-b border-black">Dados da Concedente</div>
                </div>

                <div className="flex border-b border-black">
                    <div className="w-full"><Field label="Razão Social" value={data.company_name} /></div>
                </div>
                <div className="flex border-b border-black">
                    <div className="w-full"><Field label="Nome de Fantasia ou de Pessoa Física" value={data.company_fantasy_name} /></div>
                </div>

                <div className="flex border-b border-black">
                    <div className="w-[30%]"><Field label="CNPJ ou Registro no Conselho" value={data.company_cnpj} /></div>
                    <div className="w-[70%]"><Field label="Endereço (Logradouro, Número e Complemento)" value={data.company_address} /></div>
                </div>

                <div className="flex border-b border-black">
                    <div className="w-[30%]"><Field label="Bairro" value={data.company_neighborhood} /></div>
                    <div className="w-[50%]"><Field label="Município-UF" value={data.company_city_uf} /></div>
                    <div className="w-[20%]"><Field label="CEP" value={data.company_zip} /></div>
                </div>

                <div className="flex border-b border-black">
                    <div className="w-[30%]"><Field label="DDD + Telefone" value={data.company_phone} /></div>
                    <div className="w-[70%]"><Field label="E-mail" value={data.company_email} /></div>
                </div>

                <div className="flex border-b border-black">
                    <div className="w-full"><Field label="Responsável Legal pela Instituição para este Fim" value={data.company_representative} /></div>
                </div>

                <div className="flex border-b border-black">
                    <div className="w-[60%]"><Field label="Cargo/Qualificação" value={data.company_representative_role} /></div>
                    <div className="w-[20%]"><Field label="CPF" value={data.company_representative_cpf} /></div>
                    <div className="w-[20%]"><Field label="DDD + Telefone" value={data.company_representative_phone} /></div>
                </div>

                <div className="flex border-b border-black">
                    <div className="w-full"><Field label="Supervisor do Estágio na Instituição Concedente" value={data.company_supervisor} /></div>
                </div>

                <div className="flex border-b border-black">
                    <div className="w-[60%]"><Field label="Cargo/Qualificação" value={data.company_supervisor_role} /></div>
                    <div className="w-[20%]"><Field label="CPF" value={data.company_supervisor_cpf} /></div>
                    <div className="w-[20%]"><Field label="DDD + Telefone" value={data.company_supervisor_phone} /></div>
                </div>

                <div className="flex border-b border-black">
                    <div className="w-full"><Field label="Setor de Realização do Estágio" value={data.company_sector} /></div>
                </div>

                {/* --- DADOS DO ESTÁGIO (Linha combinada) --- */}
                <div className="flex border-b border-black">
                    {/* Tipo */}
                    <div className="w-[20%] border-r border-black p-2">
                        <div className="text-[9px] font-bold uppercase mb-1">Tipo de Estágio</div>
                        <CheckBox checked={data.internship_type === 'obrigatorio'} label="Obrigatório" />
                        <CheckBox checked={data.internship_type === 'nao_obrigatorio'} label="Não Obrigatório" />
                    </div>
                    {/* Forma */}
                    <div className="w-[20%] border-r border-black p-2">
                        <div className="text-[9px] font-bold uppercase mb-1">Forma de Estágio</div>
                        <CheckBox checked={data.internship_mode === 'presencial'} label="Presencial" />
                        <CheckBox checked={data.internship_mode === 'remoto'} label="Remoto" />
                    </div>
                    {/* Datas */}
                    <div className="w-[15%] border-r border-black"><Field label="Data Inicial" value={data.start_date} /></div>
                    <div className="w-[25%] border-r border-black"><Field label="Carga Horária Semanal" value={data.weekly_hours ? `${data.weekly_hours} HORAS` : ''} /></div>
                    <div className="w-[20%]"><Field label="Data Final Prevista" value={data.end_date} /></div>
                </div>

                {/* --- TABELA DE HORÁRIOS --- */}
                <div className="border-b border-black">
                    <div className="text-[9px] font-bold uppercase text-center bg-gray-100 border-b border-black py-1">
                        Previsão de Distribuição da Carga Horária
                    </div>

                    {/* Cabeçalho da Tabela */}
                    <div className="flex text-[8px] font-bold uppercase text-center border-b border-black">
                        <div className="w-[10%] border-r border-black py-2 flex items-center justify-center rotate-180" style={{ writingMode: 'vertical-rl' }}>TURNO</div>
                        {['SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO', 'DOMINGO'].map((day, i) => (
                            <div key={day} className={`flex-1 ${i < 6 ? 'border-r border-black' : ''}`}>
                                <div className="border-b border-black py-1">{day}</div>
                                <div className="flex">
                                    <div className="w-1/2 border-r border-black py-1">INÍCIO</div>
                                    <div className="w-1/2 py-1">FINAL</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Linhas da Tabela (1º, 2º, 3º) */}
                    {['1º', '2º', '3º'].map((turno, idx) => {
                        const scheduleData = data.schedule ? JSON.parse(data.schedule) : {};
                        return (
                            <div key={turno} className="flex text-[10px] text-center border-b border-black h-8">
                                <div className="w-[10%] border-r border-black flex items-center justify-center font-bold bg-gray-50">{turno}</div>
                                {['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'].map((day, i) => (
                                    <div key={day} className={`flex-1 flex ${i < 6 ? 'border-r border-black' : ''}`}>
                                        <div className="w-1/2 border-r border-black flex items-center justify-center">
                                            {scheduleData[`${day}_start_${idx + 1}`] || ''}
                                        </div>
                                        <div className="w-1/2 flex items-center justify-center">
                                            {scheduleData[`${day}_end_${idx + 1}`] || ''}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>

                {/* --- ASSINATURAS --- */}
                <div className="flex h-32 border-b border-black">
                    <div className="w-1/2 border-r border-black relative">
                        <div className="absolute bottom-2 left-0 w-full px-8 text-center">
                            <div className="border-t border-black pt-1 text-[10px] font-bold uppercase">Solicitação em ____/____/____</div>
                            <div className="mt-6 border-t border-black pt-1 text-[10px] uppercase">Assinatura do Discente</div>
                        </div>
                    </div>
                    <div className="w-1/2 relative">
                        <div className="absolute bottom-2 left-0 w-full px-8 text-center">
                            <div className="border-t border-black pt-1 text-[10px] font-bold uppercase">Autorização em ____/____/____</div>
                            <div className="mt-6 border-t border-black pt-1 text-[10px] uppercase">Assinatura do Docente Orientador</div>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- RODAPÉ --- */}
            <div className="mt-4 text-xs font-bold text-justify">
                <span className="underline">Observação:</span> As atividades de estágio supervisionado só podem ser <span className="uppercase">iniciadas após o cadastro</span> do Termo de Compromisso de Estágio no sistema competente.
            </div>

        </div>
    );
});

InternshipRegistrationDocument.displayName = 'InternshipRegistrationDocument';
