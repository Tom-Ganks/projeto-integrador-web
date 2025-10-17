// Feriados Nacionais do Brasil
// Calcula feriados fixos e móveis para os próximos anos

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
    // Feriados fixos
    feriados[`${ano}-0-1`] = '🎉 Ano Novo';
    feriados[`${ano}-3-21`] = '🎖 Tiradentes';
    feriados[`${ano}-4-1`] = '👷 Dia do Trabalho';
    feriados[`${ano}-8-7`] = '🇧🇷 Independência do Brasil';
    feriados[`${ano}-9-12`] = '🙏 Nossa Senhora Aparecida';
    feriados[`${ano}-10-2`] = '🕯 Finados';
    feriados[`${ano}-10-15`] = '🏛 Proclamação da República';
    feriados[`${ano}-11-25`] = '🎄 Natal';

    // Feriados móveis baseados na Páscoa
    const pascoa = calcularPascoa(ano);
    const pascoacKey = `${pascoa.getFullYear()}-${pascoa.getMonth()}-${pascoa.getDate()}`;
    feriados[pascoacKey] = '🐣 Páscoa';

    // Sexta-feira Santa (2 dias antes da Páscoa)
    const sextaSanta = new Date(pascoa);
    sextaSanta.setDate(pascoa.getDate() - 2);
    const sextaKey = `${sextaSanta.getFullYear()}-${sextaSanta.getMonth()}-${sextaSanta.getDate()}`;
    feriados[sextaKey] = '✝ Sexta-feira Santa';

    // Carnaval (47 dias antes da Páscoa)
    const carnaval = new Date(pascoa);
    carnaval.setDate(pascoa.getDate() - 47);
    const carnavalKey = `${carnaval.getFullYear()}-${carnaval.getMonth()}-${carnaval.getDate()}`;
    feriados[carnavalKey] = '🎭 Carnaval';

    // Corpus Christi (60 dias depois da Páscoa)
    const corpusChristi = new Date(pascoa);
    corpusChristi.setDate(pascoa.getDate() + 60);
    const corpusKey = `${corpusChristi.getFullYear()}-${corpusChristi.getMonth()}-${corpusChristi.getDate()}`;
    feriados[corpusKey] = '🍞 Corpus Christi';
  }

  return feriados;
};

export default getFeriadosNacionais;