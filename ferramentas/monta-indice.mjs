// Gera conteudo/indice.json a partir dos arquivos de matéria (assim o índice nunca fica diferente dos arquivos).
// Uso: node ferramentas/monta-indice.mjs
// Matéria nova: crie conteudo/<id>.json e acrescente aqui a área e os apelidos (nomes alternativos usados nas grades).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizaNome } from "../js/conteudo.js";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "conteudo");

/** @type {Record<string, {area: string, apelidos: string[]}>} */
export const EXTRA = {
  "algebra-linear": {
    "area": "Exatas",
    "apelidos": [
      "Álgebra Linear I",
      "Álgebra Linear e Geometria Analítica",
      "Introdução à Álgebra Linear",
      "Geometria Analítica e Álgebra Linear",
      "GAAL",
      "Álgebra Linear Computacional",
      "Álgebra Linear A"
    ]
  },
  "algoritmos-programacao": {
    "area": "Exatas",
    "apelidos": [
      "Algoritmos",
      "Lógica de Programação",
      "Introdução à Programação",
      "Programação I",
      "Algoritmos e Estruturas de Dados I",
      "AEDS I",
      "Programação de Computadores",
      "Programação de Computadores I",
      "Algoritmos e Lógica de Programação",
      "Introdução à Ciência da Computação",
      "Fundamentos de Programação",
      "Computação I"
    ]
  },
  "anatomia-humana": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Anatomia Sistêmica",
      "Anatomia Humana Básica",
      "Anatomia Geral",
      "Anatomia Humana I",
      "Anatomia Aplicada",
      "Anatomia dos Sistemas",
      "Morfologia Humana"
    ]
  },
  "biologia-celular": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Biologia Celular e Molecular",
      "Citologia",
      "Biologia Celular e Tecidual",
      "Citologia e Histologia",
      "Biologia Celular e Histologia",
      "Citologia, Histologia e Embriologia",
      "Biologia Molecular e Celular",
      "Biologia Celular I"
    ]
  },
  "calculo-1": {
    "area": "Exatas",
    "apelidos": [
      "Cálculo Diferencial e Integral I",
      "Cálculo A",
      "Cálculo Diferencial e Integral",
      "Cálculo I A",
      "Cálculo de Uma Variável",
      "Cálculo Diferencial",
      "Matemática I (Cálculo)",
      "Cálculo Aplicado I"
    ]
  },
  "contabilidade-introdutoria": {
    "area": "Negócios",
    "apelidos": [
      "Contabilidade Geral",
      "Contabilidade Básica",
      "Contabilidade I",
      "Fundamentos de Contabilidade",
      "Contabilidade Geral I",
      "Teoria Contábil Introdutória",
      "Noções de Contabilidade",
      "Contabilidade Financeira I"
    ]
  },
  "direito-constitucional": {
    "area": "Direito",
    "apelidos": [
      "Direito Constitucional I",
      "Teoria da Constituição",
      "Direito Constitucional Geral",
      "Teoria Geral do Direito Constitucional"
    ]
  },
  "estatistica": {
    "area": "Exatas",
    "apelidos": [
      "Estatística Básica",
      "Probabilidade e Estatística",
      "Estatística Aplicada",
      "Bioestatística",
      "Estatística Geral",
      "Estatística Descritiva",
      "Probabilidade e Estatística I",
      "Estatística e Probabilidade",
      "Estatística Aplicada à Administração",
      "Estatística Aplicada à Psicologia",
      "Bioestatística I",
      "Introdução à Estatística"
    ]
  },
  "fisica-1": {
    "area": "Exatas",
    "apelidos": [
      "Física Geral I",
      "Mecânica Clássica",
      "Física Geral e Experimental I",
      "Física Básica I",
      "Física Clássica I",
      "Física: Mecânica"
    ]
  },
  "introducao-direito": {
    "area": "Direito",
    "apelidos": [
      "IED",
      "Introdução ao Direito",
      "Teoria Geral do Direito",
      "Introdução ao Estudo do Direito I",
      "Teoria do Direito",
      "Propedêutica Jurídica"
    ]
  },
  "introducao-economia": {
    "area": "Negócios",
    "apelidos": [
      "Economia I",
      "Fundamentos de Economia",
      "Economia Geral",
      "Introdução à Teoria Econômica",
      "Economia",
      "Noções de Economia",
      "Economia Aplicada à Administração",
      "Princípios de Economia"
    ]
  },
  "metodologia-cientifica": {
    "area": "Multidisciplinar",
    "apelidos": [
      "Metodologia da Pesquisa",
      "Metodologia do Trabalho Científico",
      "Iniciação Científica",
      "Metodologia da Pesquisa Científica",
      "Metodologia de Pesquisa",
      "Métodos e Técnicas de Pesquisa",
      "Seminário de Pesquisa",
      "Pesquisa e Prática Científica",
      "Metodologia Científica e Tecnológica"
    ]
  },
  "portugues-redacao": {
    "area": "Letras",
    "apelidos": [
      "Leitura e Produção de Textos",
      "Comunicação e Expressão",
      "Língua Portuguesa",
      "Produção Textual",
      "Português",
      "Português Instrumental",
      "Língua Portuguesa I",
      "Leitura e Produção de Texto",
      "Produção de Textos Acadêmicos",
      "Comunicação Oral e Escrita",
      "Redação Acadêmica",
      "Português Jurídico"
    ]
  },
  "quimica-geral": {
    "area": "Exatas",
    "apelidos": [
      "Química Geral I",
      "Química Básica",
      "Química Fundamental",
      "Química Geral e Experimental",
      "Química Geral Teórica",
      "Química Geral e Inorgânica",
      "Química Geral A"
    ]
  },
  "teoria-geral-administracao": {
    "area": "Negócios",
    "apelidos": [
      "TGA",
      "Introdução à Administração",
      "Fundamentos da Administração",
      "Teorias da Administração",
      "Teoria Geral da Administração I",
      "TGA I",
      "Administração Geral",
      "Introdução à Administração I",
      "Fundamentos de Administração"
    ]
  },
  "fisiologia-humana": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Fisiologia",
      "Fisiologia Humana I",
      "Fisiologia Geral",
      "Fisiologia Básica",
      "Fisiologia dos Sistemas",
      "Fisiologia Humana e Biofísica",
      "Fisiologia Aplicada à Enfermagem",
      "Fisiologia Aplicada à Nutrição",
      "Fisiologia Humana Básica",
      "Bases Fisiológicas"
    ]
  },
  "didatica": {
    "area": "Educação",
    "apelidos": [
      "Didática Geral",
      "Didática I",
      "Didática e Prática de Ensino",
      "Fundamentos da Didática",
      "Didática e Formação de Professores",
      "Organização do Trabalho Pedagógico",
      "Planejamento e Avaliação",
      "Avaliação da Aprendizagem",
      "Teoria e Prática de Ensino"
    ]
  },
  "matematica-financeira": {
    "area": "Negócios",
    "apelidos": [
      "Matemática Financeira I",
      "Matemática Financeira Aplicada",
      "Matemática Comercial e Financeira",
      "Engenharia Econômica",
      "Cálculo Financeiro",
      "Matemática Financeira e Análise de Investimentos",
      "Finanças Pessoais"
    ]
  },
  "direito-civil-geral": {
    "area": "Direito",
    "apelidos": [
      "Direito Civil",
      "Direito Civil I",
      "Direito Civil: Parte Geral",
      "Direito Civil - Parte Geral",
      "Teoria Geral do Direito Civil",
      "Parte Geral do Direito Civil",
      "Direito Civil Parte Geral I",
      "Instituições de Direito Civil",
      "Noções de Direito Civil"
    ]
  },
  "bioquimica": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Bioquímica I",
      "Bioquímica Geral",
      "Bioquímica Básica",
      "Bioquímica Humana",
      "Bioquímica Metabólica",
      "Bioquímica Aplicada à Nutrição",
      "Bioquímica Estrutural",
      "Bioquímica e Biofísica",
      "Bioquímica Celular",
      "Metabolismo"
    ]
  },
  "psicologia-desenvolvimento": {
    "area": "Psicologia",
    "apelidos": [
      "Psicologia do Desenvolvimento I",
      "Psicologia do Desenvolvimento Humano",
      "Desenvolvimento Humano",
      "Psicologia do Desenvolvimento e da Aprendizagem",
      "Psicologia do Desenvolvimento e Aprendizagem",
      "Psicologia do Ciclo Vital",
      "Desenvolvimento Humano e Aprendizagem",
      "Psicologia do Desenvolvimento Infantil",
      "Psicologia da Infância e Adolescência"
    ]
  },
  "banco-de-dados": {
    "area": "Exatas",
    "apelidos": [
      "Banco de Dados I",
      "Bancos de Dados",
      "Sistemas de Banco de Dados",
      "Modelagem de Dados",
      "Modelagem de Banco de Dados",
      "Fundamentos de Banco de Dados",
      "Introdução a Banco de Dados",
      "Projeto de Banco de Dados",
      "Linguagem SQL",
      "SQL"
    ]
  },
  "histologia": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Histologia I",
      "Histologia Geral",
      "Histologia Básica",
      "Histologia Humana",
      "Histologia dos Tecidos",
      "Histologia e Embriologia",
      "Histologia Geral e Embriologia",
      "Morfologia Microscópica"
    ]
  },
  "microbiologia": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Microbiologia I",
      "Microbiologia Geral",
      "Microbiologia Básica",
      "Microbiologia Humana",
      "Microbiologia Clínica",
      "Microbiologia e Imunologia",
      "Microbiologia Médica",
      "Microbiologia Aplicada à Enfermagem",
      "Bacteriologia"
    ]
  },
  "farmacologia": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Farmacologia I",
      "Farmacologia Geral",
      "Farmacologia Básica",
      "Farmacologia Clínica",
      "Farmacologia Aplicada",
      "Farmacologia Aplicada à Enfermagem",
      "Farmacologia Médica",
      "Farmacocinética e Farmacodinâmica",
      "Fundamentos de Farmacologia"
    ]
  },
  "saude-coletiva": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Saúde Coletiva I",
      "Saúde Pública",
      "Saúde Pública I",
      "Políticas de Saúde",
      "Políticas Públicas de Saúde",
      "Sistema Único de Saúde",
      "Saúde Coletiva e SUS",
      "Saúde e Sociedade",
      "Atenção Primária à Saúde",
      "Saúde da Família"
    ]
  },
  "imunologia": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Imunologia I",
      "Imunologia Geral",
      "Imunologia Básica",
      "Imunologia Clínica",
      "Imunologia Humana",
      "Imunologia Médica",
      "Imunologia Aplicada",
      "Fundamentos de Imunologia"
    ]
  },
  "genetica": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Genética I",
      "Genética Geral",
      "Genética Básica",
      "Genética Humana",
      "Genética Médica",
      "Genética Clínica",
      "Genética e Evolução",
      "Genética Mendeliana",
      "Fundamentos de Genética"
    ]
  },
  "epidemiologia": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Epidemiologia I",
      "Epidemiologia Geral",
      "Epidemiologia Básica",
      "Epidemiologia Clínica",
      "Epidemiologia e Bioestatística",
      "Epidemiologia e Saúde",
      "Epidemiologia Descritiva",
      "Introdução à Epidemiologia",
      "Fundamentos de Epidemiologia"
    ]
  },
  "parasitologia": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Parasitologia I",
      "Parasitologia Humana",
      "Parasitologia Geral",
      "Parasitologia Básica",
      "Parasitologia Médica",
      "Parasitologia Clínica",
      "Parasitologia Aplicada",
      "Parasitologia e Entomologia"
    ]
  },
  "patologia": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Patologia I",
      "Patologia Geral",
      "Patologia Básica",
      "Patologia Humana",
      "Processos Patológicos Gerais",
      "Processos Patológicos",
      "Anatomia Patológica",
      "Bases da Patologia"
    ]
  },
  "teoria-geral-estado": {
    "area": "Direito",
    "apelidos": [
      "Teoria Geral do Estado",
      "TGE",
      "Teoria do Estado",
      "Teoria Geral do Estado I",
      "Ciência Política",
      "Ciência Política I",
      "Teoria Geral do Estado e Ciência Política",
      "Ciência Política e Teoria Geral do Estado",
      "Ciência Política e Teoria do Estado",
      "Introdução à Ciência Política",
      "Teoria Política"
    ]
  },
  "direito-penal-geral": {
    "area": "Direito",
    "apelidos": [
      "Direito Penal",
      "Direito Penal I",
      "Direito Penal: Parte Geral",
      "Direito Penal - Parte Geral",
      "Direito Penal Parte Geral I",
      "Teoria Geral do Crime",
      "Teoria do Crime",
      "Teoria da Pena",
      "Teoria do Crime e da Pena"
    ]
  },
  "direito-administrativo": {
    "area": "Direito",
    "apelidos": [
      "Direito Administrativo I",
      "Direito Administrativo Geral",
      "Noções de Direito Administrativo",
      "Direito Administrativo e Licitações",
      "Teoria Geral do Direito Administrativo"
    ]
  },
  "processo-civil": {
    "area": "Direito",
    "apelidos": [
      "Processo Civil",
      "Processo Civil I",
      "Direito Processual Civil I",
      "Teoria Geral do Processo Civil",
      "Direito Processual Civil: Parte Geral",
      "Processo Civil e Procedimento Comum",
      "Processo de Conhecimento"
    ]
  },
  "direito-trabalho": {
    "area": "Direito",
    "apelidos": [
      "Direito do Trabalho I",
      "Direito Individual do Trabalho",
      "Direito do Trabalho e Legislação Social",
      "Legislação Trabalhista",
      "Legislação Social e Trabalhista",
      "Noções de Direito do Trabalho",
      "Relações de Trabalho e Legislação"
    ]
  },
  "direito-empresarial": {
    "area": "Direito",
    "apelidos": [
      "Direito Empresarial I",
      "Direito Comercial",
      "Direito Comercial I",
      "Direito Empresarial e Societário",
      "Teoria Geral do Direito Empresarial",
      "Direito de Empresa",
      "Legislação Empresarial",
      "Legislação Comercial",
      "Noções de Direito Empresarial"
    ]
  },
  "psicologia-educacao": {
    "area": "Educação",
    "apelidos": [
      "Psicologia da Educação I",
      "Psicologia da Educação II",
      "Psicologia Educacional",
      "Psicologia da Aprendizagem",
      "Psicologia e Educação",
      "Teorias da Aprendizagem"
    ]
  },
  "sociologia-educacao": {
    "area": "Educação",
    "apelidos": [
      "Sociologia da Educação I",
      "Sociologia da Educação II",
      "Sociologia Educacional",
      "Sociologia e Educação",
      "Educação e Sociedade",
      "Fundamentos Sociológicos da Educação"
    ]
  },
  "filosofia-educacao": {
    "area": "Educação",
    "apelidos": [
      "Filosofia da Educação I",
      "Filosofia da Educação II",
      "Filosofia e Educação",
      "Fundamentos Filosóficos da Educação",
      "Ética e Educação"
    ]
  },
  "historia-educacao": {
    "area": "Educação",
    "apelidos": [
      "História da Educação I",
      "História da Educação II",
      "História da Educação Brasileira",
      
      "Fundamentos Históricos da Educação",
      "História da Educação e da Pedagogia"
    ]
  },
  "politica-educacional": {
    "area": "Educação",
    "apelidos": [
      "Políticas Educacionais",
      "Política Educacional Brasileira",
      "Políticas Públicas em Educação",
      "Estrutura e Funcionamento da Educação Básica",
      "Organização da Educação Brasileira",
      "Legislação Educacional",
      "Política e Organização da Educação Básica",
      "Gestão e Políticas Educacionais"
    ]
  },
  "alfabetizacao-letramento": {
    "area": "Educação",
    "apelidos": [
      "Alfabetização",
      "Alfabetização e Letramento I",
      "Alfabetização e Letramento II",
      "Fundamentos da Alfabetização",
      "Processos de Alfabetização",
      "Metodologia da Alfabetização",
      "Alfabetização e Linguagem",
      "Fundamentos e Metodologia da Alfabetização"
    ]
  },
  "contabilidade-custos": {
    "area": "Negócios",
    "apelidos": [
      "Custos",
      "Contabilidade de Custos I",
      "Contabilidade de Custos II",
      "Gestão de Custos",
      "Análise de Custos",
      "Gestão Estratégica de Custos",
      "Custos Industriais",
      "Contabilidade e Análise de Custos",
      "Formação de Preços",
      "Custos e Formação de Preços"
    ]
  },
  "marketing": {
    "area": "Negócios",
    "apelidos": [
      "Marketing I",
      "Marketing II",
      "Administração de Marketing II",
      "Administração de Marketing",
      "Fundamentos de Marketing",
      "Princípios de Marketing",
      "Gestão de Marketing",
      "Marketing Digital",
      "Comportamento do Consumidor",
      "Marketing Estratégico"
    ]
  },
  "gestao-pessoas": {
    "area": "Negócios",
    "apelidos": [
      "Gestão de Pessoas I",
      "Gestão de Pessoas II",
      "Recursos Humanos",
      "Administração de Recursos Humanos",
      "Administração de Recursos Humanos II",
      "Gestão de Recursos Humanos",
      "Administração de Pessoal",
      "Gestão de Pessoas nas Organizações",
      "Gestão Estratégica de Pessoas",
      "Recrutamento e Seleção"
    ]
  },
  "microeconomia": {
    "area": "Negócios",
    "apelidos": [
      "Microeconomia I",
      "Microeconomia II",
      "Teoria Microeconômica",
      "Análise Microeconômica",
      "Teoria Microeconômica II",
      "Microeconomia Aplicada",
      "Teoria dos Preços"
    ]
  },
  "macroeconomia": {
    "area": "Negócios",
    "apelidos": [
      "Macroeconomia I",
      "Macroeconomia II",
      "Teoria Macroeconômica",
      "Análise Macroeconômica",
      "Teoria Macroeconômica II",
      "Macroeconomia Aplicada",
      "Contabilidade Social"
    ]
  },
  "matematica-aplicada": {
    "area": "Negócios",
    "apelidos": [
      "Matemática Aplicada",
      "Matemática Aplicada à Administração",
      "Matemática Aplicada à Economia",
      "Matemática Aplicada aos Negócios",
      "Matemática para Negócios",
      "Matemática Empresarial",
      "Matemática Aplicada à Gestão I",
      "Métodos Quantitativos"
    ]
  },
  "estrutura-dados": {
    "area": "Exatas",
    "apelidos": [
      "Estruturas de Dados",
      "Estrutura de Dados I",
      "Estrutura de Dados II",
      "Estruturas de Dados I",
      "Estruturas de Dados II",
      "Algoritmos e Estruturas de Dados II",
      "AEDS II",
      "Estruturas de Dados e Algoritmos",
      "Programação II"
    ]
  },
  "engenharia-software": {
    "area": "Exatas",
    "apelidos": [
      "Engenharia de Software I",
      "Engenharia de Software II",
      "Engenharia de Requisitos",
      "Análise e Projeto de Sistemas",
      "Análise de Sistemas",
      "Modelagem de Sistemas",
      "Processos de Software",
      "Teste de Software",
      "Qualidade de Software",
      "Metodologias Ágeis"
    ]
  },
  "redes-computadores": {
    "area": "Exatas",
    "apelidos": [
      "Redes de Computadores I",
      "Redes de Computadores II",
      "Redes",
      "Redes I",
      "Fundamentos de Redes",
      "Fundamentos de Redes de Computadores",
      "Comunicação de Dados",
      "Redes e Comunicação de Dados",
      "Segurança de Redes"
    ]
  },
  "arquitetura-computadores": {
    "area": "Exatas",
    "apelidos": [
      "Arquitetura de Computadores I",
      "Arquitetura e Organização de Computadores",
      "Organização de Computadores",
      "Organização e Arquitetura de Computadores",
      "Sistemas Digitais",
      "Circuitos Digitais",
      "Eletrônica Digital",
      "Lógica Digital",
      "Fundamentos de Sistemas Digitais"
    ]
  },
  "processos-psicologicos": {
    "area": "Psicologia",
    "apelidos": [
      "Processos Psicológicos Básicos I",
      "Processos Psicológicos Básicos II",
      "Psicologia Cognitiva",
      "Processos Cognitivos",
      "Sensação e Percepção",
      "Percepção e Atenção",
      "Memória e Aprendizagem",
      "Motivação e Emoção",
      "Processos Psicológicos"
    ]
  },
  "teorias-personalidade": {
    "area": "Psicologia",
    "apelidos": [
      "Teorias da Personalidade I",
      "Teorias da Personalidade II",
      "Psicologia da Personalidade",
      "Personalidade",
      "Teorias e Sistemas da Personalidade",
      "Avaliação da Personalidade"
    ]
  },
  "psicopatologia": {
    "area": "Psicologia",
    "apelidos": [
      "Psicopatologia I",
      "Psicopatologia II",
      "Psicopatologia Geral",
      "Psicopatologia Clínica",
      "Psicopatologia e Semiologia Psiquiátrica",
      "Semiologia Psiquiátrica",
      "Psicopatologia Geral e Especial"
    ]
  },
  "neuroanatomia": {
    "area": "Psicologia",
    "apelidos": [
      "Neuroanatomia Funcional",
      "Neuroanatomia Humana",
      "Neuroanatomia I",
      "Anatomia do Sistema Nervoso",
      "Neurociências",
      "Neurociência",
      "Neuropsicologia e Neuroanatomia",
      "Bases Neurais do Comportamento",
      "Psicofisiologia"
    ]
  },
  "semiologia": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Semiologia I",
      "Semiologia II",
      "Semiologia Médica",
      "Semiologia Médica I",
      "Semiologia Médica II",
      "Propedêutica",
      "Propedêutica Médica",
      "Semiologia Geral",
      "Exame Físico",
      "Semiologia e Propedêutica",
      "Avaliação Clínica"
    ]
  },
  "fundamentos-enfermagem": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Fundamentos de Enfermagem I",
      "Fundamentos de Enfermagem II",
      "Fundamentos do Cuidar em Enfermagem",
      "Semiologia e Semiotécnica",
      "Semiologia e Semiotécnica em Enfermagem",
      "Semiotécnica",
      "Processo de Cuidar",
      "Introdução à Enfermagem",
      "Bases do Cuidado de Enfermagem",
      "Processo de Enfermagem"
    ]
  }
};

const arquivos = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && !["indice.json", "faculdades.json"].includes(f)).sort();
const materias = arquivos.map((f) => {
  const m = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const extra = EXTRA[m.id] || { area: "Geral", apelidos: [] };
  // Descarta apelido que, normalizado, é igual ao nome ou a outro apelido ("Cálculo 1" = "Cálculo I").
  const vistos = new Set([normalizaNome(m.nome)]);
  const apelidos = extra.apelidos.filter((a) => !vistos.has(normalizaNome(a)) && vistos.add(normalizaNome(a)));
  return { id: m.id, nome: m.nome, apelidos, area: extra.area, topicos: m.topicos.map((t) => ({ id: t.id, nome: t.nome })) };
});
fs.writeFileSync(path.join(dir, "indice.json"), JSON.stringify({ versao: 1, materias }, null, 2) + "\n");
console.log(`conteudo/indice.json: ${materias.length} matérias`);
