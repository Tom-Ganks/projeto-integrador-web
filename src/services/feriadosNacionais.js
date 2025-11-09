// Feriados Nacionais do Brasil
// Inclui feriados fixos e móveis (Páscoa, Carnaval, Corpus Christi)

const calcularPascoa = (ano) => {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(ano, mes - 1, dia);
};

export const getFeriadosNacionais = () => {
  const feriados = {};
  const anoAtual = new Date().getFullYear();

  // Gera feriados para os próximos 5 anos
  for (let ano = anoAtual; ano <= anoAtual + 5; ano++) {
    // 🔹 Feriados fixos (formato YYYY-MM-DD)
    feriados[`${ano}-01-01`] = '🎉 Ano Novo';
    feriados[`${ano}-04-21`] = '🎖 Tiradentes';
    feriados[`${ano}-05-01`] = '👷 Dia do Trabalho';
    feriados[`${ano}-09-07`] = '🇧🇷 Independência do Brasil';
    feriados[`${ano}-10-12`] = '🙏 Nossa Senhora Aparecida';
    feriados[`${ano}-11-02`] = '🕯 Finados';
    feriados[`${ano}-11-15`] = '🏛 Proclamação da República';
    feriados[`${ano}-11-20`] = '✊🏿 Dia Nacional de Zumbi e da Consciência Negra';
    feriados[`${ano}-12-25`] = '🎄 Natal';

    // 🔹 Feriados móveis baseados na Páscoa
    const pascoa = calcularPascoa(ano);
    const pascoaKey = `${ano}-${String(pascoa.getMonth() + 1).padStart(2, '0')}-${String(pascoa.getDate()).padStart(2, '0')}`;
    feriados[pascoaKey] = '🐣 Páscoa';

    // Sexta-feira Santa (2 dias antes)
    const sextaSanta = new Date(pascoa);
    sextaSanta.setDate(pascoa.getDate() - 2);
    const sextaKey = `${ano}-${String(sextaSanta.getMonth() + 1).padStart(2, '0')}-${String(sextaSanta.getDate()).padStart(2, '0')}`;
    feriados[sextaKey] = '✝ Sexta-feira Santa';

    // Carnaval (47 dias antes)
    const carnaval = new Date(pascoa);
    carnaval.setDate(pascoa.getDate() - 47);
    const carnavalKey = `${ano}-${String(carnaval.getMonth() + 1).padStart(2, '0')}-${String(carnaval.getDate()).padStart(2, '0')}`;
    feriados[carnavalKey] = '🎭 Carnaval';

    // Corpus Christi (60 dias depois)
    const corpus = new Date(pascoa);
    corpus.setDate(pascoa.getDate() + 60);
    const corpusKey = `${ano}-${String(corpus.getMonth() + 1).padStart(2, '0')}-${String(corpus.getDate()).padStart(2, '0')}`;
    feriados[corpusKey] = '🍞 Corpus Christi';
  }

  return feriados;
};

export default getFeriadosNacionais;
