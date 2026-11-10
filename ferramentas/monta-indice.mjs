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
  },
  "calculo-2": {
    "area": "Exatas",
    "apelidos": [
      "Cálculo II",
      "Cálculo 2",
      "Cálculo Diferencial e Integral II",
      "Cálculo B",
      "Cálculo II A",
      "Cálculo Integral",
      "Técnicas de Integração",
      "Séries e Sequências"
    ]
  },
  "calculo-3": {
    "area": "Exatas",
    "apelidos": [
      "Cálculo III",
      "Cálculo 3",
      "Cálculo Diferencial e Integral III",
      "Cálculo C",
      "Cálculo de Várias Variáveis",
      "Cálculo Vetorial",
      "Funções de Várias Variáveis",
      "Cálculo Multivariável"
    ]
  },
  "equacoes-diferenciais": {
    "area": "Exatas",
    "apelidos": [
      "Equações Diferenciais",
      "Equações Diferenciais Ordinárias",
      "EDO",
      "Equações Diferenciais I",
      "Cálculo IV",
      "Cálculo Diferencial e Integral IV",
      "Introdução às Equações Diferenciais"
    ]
  },
  "geometria-analitica": {
    "area": "Exatas",
    "apelidos": [
      "Geometria Analítica",
      "Geometria Analítica I",
      "Geometria Analítica e Vetores",
      "Vetores e Geometria Analítica",
      "Cálculo Vetorial e Geometria Analítica",
      "Geometria Analítica Plana",
      "Álgebra Vetorial"
    ]
  },
  "fisica-2": {
    "area": "Exatas",
    "apelidos": [
      "Física II",
      "Física 2",
      "Física Geral II",
      "Física Geral e Experimental II",
      "Física Básica II",
      "Física Teórica II",
      "Física: Fluidos, Oscilações e Ondas",
      "Oscilações e Ondas",
      "Física Térmica"
    ]
  },
  "mecanica-geral": {
    "area": "Exatas",
    "apelidos": [
      "Mecânica Geral",
      "Mecânica Geral I",
      "Estática",
      "Mecânica Vetorial",
      "Mecânica Vetorial: Estática",
      "Estática dos Corpos Rígidos",
      "Mecânica dos Sólidos I",
      "Isostática"
    ]
  },
  "resistencia-materiais": {
    "area": "Exatas",
    "apelidos": [
      "Resistência dos Materiais I",
      "Resistência dos Materiais II",
      "Resistência dos Materiais",
      "Mecânica dos Sólidos",
      "Mecânica dos Sólidos II",
      "Mecânica dos Materiais",
      "Resmat"
    ]
  },
  "fenomenos-transporte": {
    "area": "Exatas",
    "apelidos": [
      "Fenômenos de Transporte I",
      "Fenômenos de Transporte",
      "Mecânica dos Fluidos",
      "Mecânica dos Fluidos I",
      "Transferência de Calor",
      "Transferência de Calor e Massa",
      "Hidráulica Geral"
    ]
  },
  "termodinamica": {
    "area": "Exatas",
    "apelidos": [
      "Termodinâmica I",
      "Termodinâmica Aplicada",
      "Termodinâmica Técnica",
      "Termodinâmica para Engenharia",
      "Termodinâmica Clássica",
      "Máquinas Térmicas"
    ]
  },
  "circuitos-eletricos": {
    "area": "Exatas",
    "apelidos": [
      "Circuitos Elétricos I",
      "Circuitos Elétricos II",
      "Circuitos Elétricos",
      "Análise de Circuitos",
      "Análise de Circuitos Elétricos",
      "Eletricidade Básica",
      "Eletricidade Aplicada",
      "Eletrotécnica",
      "Eletricidade"
    ]
  },
  "desenho-tecnico": {
    "area": "Exatas",
    "apelidos": [
      "Desenho Técnico I",
      "Desenho Técnico",
      "Desenho Técnico Mecânico",
      "Expressão Gráfica",
      "Desenho Técnico e CAD",
      "Desenho Assistido por Computador",
      "Desenho Arquitetônico",
      "Representação Gráfica",
      "CAD"
    ]
  },
  "quimica-organica": {
    "area": "Exatas",
    "apelidos": [
      "Química Orgânica",
      "Química Orgânica I",
      "Química Orgânica II",
      "Química Orgânica Básica",
      "Química Orgânica Teórica",
      "Química dos Compostos de Carbono",
      "Fundamentos de Química Orgânica"
    ]
  },
  "quimica-analitica": {
    "area": "Exatas",
    "apelidos": [
      "Química Analítica",
      "Química Analítica I",
      "Química Analítica II",
      "Química Analítica Qualitativa",
      "Química Analítica Quantitativa",
      "Análise Química",
      "Análise Instrumental",
      "Química Analítica Instrumental",
      "Métodos Instrumentais de Análise"
    ]
  },
  "botanica": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Botânica",
      "Botânica Geral",
      "Botânica I",
      "Botânica II",
      "Morfologia Vegetal",
      "Anatomia Vegetal",
      "Biologia Vegetal",
      "Sistemática Vegetal",
      "Organografia Vegetal",
      "Botânica Aplicada"
    ]
  },
  "zoologia": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Zoologia",
      "Zoologia Geral",
      "Zoologia I",
      "Zoologia II",
      "Zoologia dos Invertebrados",
      "Zoologia dos Vertebrados",
      "Biologia Animal",
      "Diversidade Animal",
      "Zoologia Agrícola"
    ]
  },
  "ecologia": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Ecologia",
      "Ecologia Geral",
      "Ecologia I",
      "Ecologia Básica",
      "Fundamentos de Ecologia",
      "Ecologia e Meio Ambiente",
      "Ecologia de Populações",
      "Ecologia de Ecossistemas",
      "Ecologia Aplicada",
      "Ciências do Ambiente"
    ]
  },
  "ciencia-solo": {
    "area": "Agrárias",
    "apelidos": [
      "Ciência do Solo",
      "Ciência do Solo I",
      "Solos",
      "Pedologia",
      "Gênese e Classificação de Solos",
      "Gênese, Morfologia e Classificação de Solos",
      "Fertilidade do Solo",
      "Fertilidade do Solo e Nutrição de Plantas",
      "Física do Solo",
      "Química do Solo",
      "Manejo e Conservação do Solo",
      "Conservação do Solo",
      "Solos Agrícolas",
      "Edafologia"
    ]
  },
  "sociologia": {
    "area": "Humanas",
    "apelidos": [
      "Sociologia",
      "Sociologia Geral",
      "Sociologia I",
      "Introdução à Sociologia",
      "Fundamentos de Sociologia",
      "Teoria Sociológica",
      "Sociologia Clássica",
      "Ciências Sociais"
    ]
  },
  "filosofia": {
    "area": "Humanas",
    "apelidos": [
      "Filosofia",
      "Filosofia Geral",
      "Introdução à Filosofia",
      "Filosofia I",
      "Fundamentos de Filosofia",
      "História da Filosofia",
      "Filosofia e Ética",
      "Ética e Filosofia"
    ]
  },
  "antropologia": {
    "area": "Humanas",
    "apelidos": [
      "Antropologia",
      "Antropologia Cultural",
      "Antropologia Social",
      "Antropologia Geral",
      "Introdução à Antropologia",
      "Antropologia I",
      "Antropologia e Cultura",
      "Antropologia Cultural e Social"
    ]
  },
  "libras": {
    "area": "Humanas",
    "apelidos": [
      "Libras",
      "LIBRAS",
      "Língua Brasileira de Sinais",
      "Libras I",
      "Libras II",
      "Língua Brasileira de Sinais I",
      "Língua de Sinais",
      "Introdução à Libras",
      "Fundamentos de Libras",
      "Educação de Surdos",
      "Língua Brasileira de Sinais - Libras",
      "Língua Brasileira de Sinais (Libras)"
    ]
  },
  "linguistica": {
    "area": "Letras",
    "apelidos": [
      "Linguística",
      "Linguística I",
      "Linguística II",
      "Linguística Geral",
      "Introdução à Linguística",
      "Introdução aos Estudos Linguísticos",
      "Fundamentos de Linguística",
      "Estudos Linguísticos",
      "Sociolinguística",
      "Fonética e Fonologia",
      "Linguística Aplicada"
    ]
  },
  "teoria-literaria": {
    "area": "Letras",
    "apelidos": [
      "Teoria Literária",
      "Teoria Literária I",
      "Teoria Literária II",
      "Teoria da Literatura",
      "Teoria da Literatura I",
      "Teoria da Literatura II",
      "Introdução aos Estudos Literários",
      "Estudos Literários",
      "Introdução à Literatura",
      "Teoria e Crítica Literária",
      "Crítica Literária"
    ]
  },
  "nutricao-humana": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Nutrição Humana",
      "Nutrição Básica",
      "Nutrição e Dietética",
      "Fundamentos de Nutrição",
      "Introdução à Nutrição",
      "Nutrição",
      "Nutrição Normal",
      "Nutrição e Metabolismo",
      "Bases da Nutrição",
      "Princípios de Nutrição",
      "Nutrição Geral",
      "Avaliação Nutricional",
      "Nutrição e Saúde",
      "Nutrição Aplicada à Enfermagem",
      "Nutrição nos Ciclos da Vida"
    ]
  },
  "cinesiologia": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Cinesiologia",
      "Cinesiologia e Biomecânica",
      "Biomecânica",
      "Cinesiologia Aplicada",
      "Cinesiologia I",
      "Cinesiologia II",
      "Biomecânica do Movimento Humano",
      "Biomecânica Aplicada",
      "Cinesiologia e Biomecânica Aplicada",
      "Fundamentos de Cinesiologia",
      "Cinesiologia Humana",
      "Biomecânica e Cinesiologia",
      "Análise do Movimento Humano"
    ]
  },
  "fisiologia-exercicio": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Fisiologia do Exercício",
      "Fisiologia do Exercício I",
      "Fisiologia do Exercício II",
      "Fisiologia do Esforço",
      "Fisiologia Aplicada ao Exercício",
      "Fisiologia do Exercício Físico",
      "Fisiologia da Atividade Física",
      "Fisiologia Humana e do Exercício",
      "Bases Fisiológicas do Exercício",
      "Treinamento Desportivo",
      "Treinamento Esportivo",
      "Prescrição de Exercícios",
      "Fisiologia do Exercício Aplicada"
    ]
  },
  "anatomia-dental": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Anatomia Dental",
      "Anatomia Dentária",
      "Anatomia e Escultura Dental",
      "Anatomia e Escultura Dentária",
      "Escultura Dental",
      "Anatomia Dental e Oclusão",
      "Oclusão",
      "Oclusão Dentária",
      "Morfologia Dental",
      "Anatomia e Escultura Dentária I",
      "Histologia Bucal",
      "Histologia e Embriologia Bucal",
      "Anatomia Bucal"
    ]
  },
  "teorias-comunicacao": {
    "area": "Humanas",
    "apelidos": [
      "Teorias da Comunicação",
      "Teoria da Comunicação",
      "Teorias da Comunicação I",
      "Teorias da Comunicação II",
      "Introdução à Comunicação",
      "Fundamentos da Comunicação",
      "Comunicação Social",
      "Introdução ao Jornalismo",
      "Teorias do Jornalismo",
      "Introdução à Publicidade e Propaganda",
      "Comunicação e Sociedade",
      "Comunicação de Massa",
      "Teoria da Comunicação e da Informação",
      "Fundamentos de Comunicação Social"
    ]
  },
  "servico-social": {
    "area": "Humanas",
    "apelidos": [
      "Fundamentos do Serviço Social",
      "Introdução ao Serviço Social",
      "Fundamentos Históricos e Teórico-Metodológicos do Serviço Social",
      "Fundamentos Históricos, Teóricos e Metodológicos do Serviço Social",
      "Fundamentos Teórico-Metodológicos do Serviço Social",
      "Serviço Social",
      "Política Social",
      "Políticas Sociais",
      "Política de Assistência Social",
      "Seguridade Social",
      "Questão Social",
      "Serviço Social e Questão Social",
      "Instrumentalidade do Serviço Social"
    ]
  },
  "relacoes-internacionais": {
    "area": "Humanas",
    "apelidos": [
      "Relações Internacionais",
      "Introdução às Relações Internacionais",
      "Teoria das Relações Internacionais",
      "Teorias das Relações Internacionais",
      "Teoria das Relações Internacionais I",
      "Teoria das Relações Internacionais II",
      "Introdução ao Estudo das Relações Internacionais",
      "História das Relações Internacionais",
      "Política Internacional",
      "Organizações Internacionais",
      "Fundamentos de Relações Internacionais",
      "Política Internacional Contemporânea"
    ]
  },
  "historia-arquitetura": {
    "area": "Humanas",
    "apelidos": [
      "História da Arquitetura",
      "História da Arquitetura e do Urbanismo",
      "História da Arquitetura e Urbanismo",
      "História e Teoria da Arquitetura",
      "Teoria e História da Arquitetura",
      "Teoria e História da Arquitetura e do Urbanismo",
      "História da Arquitetura I",
      "História da Arquitetura II",
      "História da Arte e da Arquitetura",
      "História da Arquitetura e da Arte",
      "Teoria da Arquitetura",
      "Arquitetura Brasileira",
      "História da Arquitetura Brasileira",
      "História do Urbanismo"
    ]
  },
  "fundamentos-design": {
    "area": "Humanas",
    "apelidos": [
      "Fundamentos do Design",
      "Introdução ao Design",
      "Fundamentos de Design",
      "História do Design",
      "Design Gráfico",
      "Teoria do Design",
      "Teoria e História do Design",
      "Metodologia de Projeto",
      "Metodologia do Design",
      "Linguagem Visual",
      "Teoria da Cor",
      "Tipografia",
      "Comunicação Visual",
      "Fundamentos do Design Gráfico",
      "Composição Visual",
      "Design"
    ]
  },
  "anatomia-veterinaria": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Anatomia Veterinária",
      "Anatomia Veterinária I",
      "Anatomia Veterinária II",
      "Anatomia Animal",
      "Anatomia dos Animais Domésticos",
      "Anatomia dos Animais Domésticos I",
      "Anatomia dos Animais Domésticos II",
      "Anatomia Descritiva dos Animais Domésticos",
      "Anatomia Topográfica dos Animais Domésticos",
      "Anatomia Comparada",
      "Anatomia Veterinária Aplicada",
      "Anatomia e Fisiologia Animal",
      "Anatomia Animal Comparada"
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
