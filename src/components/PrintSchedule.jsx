import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../services/supabase.js';
import { getFeriadosNacionais } from '../services/feriadosNacionais.js';
import '../styles/print-schedule.css';

const PrintSchedule = ({ turmaId, monthDate, onReady }) => {
    const [scheduleData, setScheduleData] = useState(null);
    const [loading, setLoading] = useState(true);

    // converte YYYY-MM-DD PARA Date corretamente sem UTC
    const parseISO = (iso) => {
        const [y, m, d] = iso.split('-').map(Number);
        return new Date(y, m - 1, d);
    };

    // gera YYYY-MM-DD sem risco de UTC
    const toISO = (y, m, d) =>
        `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const normalizeDate = (dateString) => {
        const [y, m, d] = dateString.split('-').map(Number);
        return toISO(y, m, d);
    };

    useEffect(() => {
        loadScheduleData();
    }, [turmaId, monthDate]);

    const loadScheduleData = async () => {
        if (!turmaId) {
            setLoading(false);
            return;
        }

        try {
            const year = monthDate.getFullYear();
            const month = monthDate.getMonth();

            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);

            // 1. Buscar turma
            const { data: turmaData } = await supabaseClient
                .from('turma')
                .select('idturma, turmanome, idinstrutor, idcurso, idturno')
                .eq('idturma', turmaId)
                .maybeSingle();

            // 2. Buscar nomes
            let instrutorNome = 'N/A';
            let cursoNome = 'N/A';
            let turnoNome = 'N/A';

            if (turmaData?.idinstrutor) {
                const { data } = await supabaseClient
                    .from('instrutores')
                    .select('nomeinstrutor')
                    .eq('idinstrutor', turmaData.idinstrutor)
                    .maybeSingle();
                instrutorNome = data?.nomeinstrutor || 'N/A';
            }

            if (turmaData?.idcurso) {
                const { data } = await supabaseClient
                    .from('cursos')
                    .select('nomecurso')
                    .eq('idcurso', turmaData.idcurso)
                    .maybeSingle();
                cursoNome = data?.nomecurso || 'N/A';
            }

            if (turmaData?.idturno) {
                const { data } = await supabaseClient
                    .from('turno')
                    .select('turno')
                    .eq('idturno', turmaData.idturno)
                    .maybeSingle();
                turnoNome = data?.turno || 'N/A';
            }

            // 3. Aulas
            const { data: aulasData } = await supabaseClient
                .from('aulas')
                .select(`
                    idaula,
                    data,
                    horario,
                    horas,
                    status,
                    iduc,
                    unidades_curriculares(nomeuc)
                `)
                .eq('idturma', turmaId)
                .gte('data', toISO(startDate.getFullYear(), startDate.getMonth() + 1, 1))
                .lte('data', toISO(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate()))
                .order('data');

            // 4. Feriados municipais
            const { data: feriadosMunicipais } = await supabaseClient
                .from('feriadosmunicipais')
                .select('data, nome');

            const feriadosMunicipaisFormatados = (feriadosMunicipais || []).map((f) => ({
                data: normalizeDate(f.data),
                nome: f.nome
            }));

            // 5. Feriados nacionais
            const feriadosNacionais = getFeriadosNacionais();
            const nacionaisFiltrados = Object.entries(feriadosNacionais)
                .map(([dateISO, nome]) => ({
                    data: dateISO,
                    nome
                }))
                .filter((f) => {
                    const dateObj = parseISO(f.data);
                    return dateObj >= startDate && dateObj <= endDate;
                });

            const feriadosCombinados = [
                ...feriadosMunicipaisFormatados,
                ...nacionaisFiltrados
            ];

            setScheduleData({
                turma: {
                    ...turmaData,
                    cursoNome,
                    instrutorNome,
                    turnoNome
                },
                aulas: aulasData || [],
                feriados: feriadosCombinados,
                year,
                month
            });

            if (typeof onReady === 'function') {
                setTimeout(() => onReady(), 500);
            }

        } catch (error) {
            console.error('Erro ao carregar dados para impressão:', error);
        } finally {
            setLoading(false);
        }
    };

    const isFeriado = (dateStr) => {
        if (!scheduleData?.feriados) return false;
        const target = normalizeDate(dateStr);
        return scheduleData.feriados.some(f => normalizeDate(f.data) === target);
    };

    const isSaturday = (day) =>
        new Date(scheduleData.year, scheduleData.month, day).getDay() === 6;

    const isSunday = (day) =>
        new Date(scheduleData.year, scheduleData.month, day).getDay() === 0;

    const getHoursForDay = (day) => {
        const dateStr = toISO(scheduleData.year, scheduleData.month + 1, day);
        const aula = scheduleData.aulas.find(a => a.data === dateStr);
        return aula ? aula.horas : null;
    };

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

    if (loading) return <div style={{ padding: '20px' }}>Carregando dados...</div>;
    if (!scheduleData) return <div style={{ padding: '20px' }}>Selecione uma turma.</div>;

    const daysInMonth = getDaysInMonth(scheduleData.year, scheduleData.month);

    const days = [];
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    const dayAbbreviations = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

    const monthNames = [
        'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
        'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
    ];

    const classHours = scheduleData.aulas
        .map(a => a.unidades_curriculares?.nomeuc)
        .filter((v, i, a) => a.indexOf(v) === i);

    return (
        <div className="print-schedule-wrapper">
            <div className="print-schedule">

                {/* Cabeçalho */}
                <div className="print-header">
                    <div className="logo-section">
                        <img src={`${process.env.PUBLIC_URL}/senac.png`} alt="SENAC" className="logo" />
                    </div>

                    <div className="header-info">
                        <h1>SENAC CATALÃO</h1>
                        <p><strong>MÊS:</strong> {monthNames[scheduleData.month]} {scheduleData.year}</p>
                        <p><strong>CURSO:</strong> {scheduleData.turma?.cursoNome || 'N/A'}</p>
                        <p><strong>TURMA:</strong> {scheduleData.turma?.turmanome || 'N/A'}</p>
                        <p><strong>TURNO:</strong> {scheduleData.turma?.turnoNome || 'N/A'}</p>
                        <p><strong>HORÁRIO:</strong> {Array.from(new Set(scheduleData.aulas?.map(a => a.horario))).join(', ')}</p>
                        <p><strong>INSTRUTOR:</strong> {scheduleData.turma?.instrutorNome || 'N/A'}</p>
                    </div>
                </div>

                <h2 className="month-title">{monthNames[scheduleData.month]}</h2>

                {/* Tabela */}
                <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table className="schedule-table">
                        <thead>
                            <tr>
                                <th className="uc-column">Unidades Curriculares</th>

                                {days.map(day => {
                                    const date = new Date(scheduleData.year, scheduleData.month, day);
                                    const abbr = dayAbbreviations[date.getDay()];
                                    return (
                                        <th key={day} className="day-column-header">
                                            <div className="day-abbr">{abbr}</div>
                                            <div className="day-num">{day}</div>
                                        </th>
                                    );
                                })}

                                <th className="total-column">TOTAL</th>
                                <th className="instructor-column">Instrutor</th>
                            </tr>
                        </thead>

                        <tbody>
                            {classHours.length > 0 ? classHours.map(ucName => {
                                const total = scheduleData.aulas
                                    .filter(a => a.unidades_curriculares?.nomeuc === ucName)
                                    .reduce((sum, a) => sum + (a.horas || 0), 0);

                                return (
                                    <tr key={ucName}>
                                        <td className="uc-name">{ucName}</td>

                                        {days.map(day => {
                                            const hours = getHoursForDay(day);
                                            const dateStr = toISO(scheduleData.year, scheduleData.month + 1, day);

                                            let cellClass = "schedule-cell";

                                            const isFer = isFeriado(dateStr);
                                            const sat = isSaturday(day);
                                            const sun = isSunday(day);

                                            if (hours) cellClass += " has-class";
                                            if (isFer) {
                                                cellClass += " feriado";
                                            } else {
                                                if (sat) cellClass += " saturday";
                                                if (sun) cellClass += " sunday";
                                            }

                                            return (
                                                <td key={ucName + '-' + day} className={cellClass}>
                                                    {hours ? <span className="hours-text">{hours.toFixed(1)}</span> : ''}
                                                </td>
                                            );
                                        })}

                                        <td className="total-hours">{total.toFixed(1)}</td>
                                        <td className="instructor-name">{scheduleData.turma?.instrutorNome}</td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={daysInMonth + 3} style={{ textAlign: 'center', padding: '20px' }}>
                                        Nenhuma aula agendada
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>

            </div>
        </div>
    );
};

export default PrintSchedule;
