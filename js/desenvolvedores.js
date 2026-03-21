/**
 * Cooperados da Web-Engenharia — dados para a seção "Gente".
 * Fotos: landing/images/desenvolvedores/{id}.avif / .webp + fotoFallback JPEG/PNG (<picture>)
 *
 * Cada linguagem (pt, en, ja, kok) tem sua própria versão dos dados.
 * O idioma é detectado via document.documentElement.lang (pt-BR → pt).
 *
 * Cargos vinculados ao portfólio — atribuídos aleatoriamente a cada cooperado.
 * Serviços do catálogo — atribuídos aleatoriamente a cada cooperado.
 */
(function () {
  'use strict';

  function getLang() {
    var html = document.documentElement;
    var lang = (html && html.getAttribute('lang')) || 'pt-BR';
    if (lang === 'pt-BR' || lang === 'pt') return 'pt';
    if (lang === 'en' || lang === 'ja' || lang === 'kok') return lang;
    return 'pt';
  }

  var DATA = {
    pt: {
      servicos: [
        { id: 'alocacao', nome: 'Alocação', grupo: 'O que fazemos' },
        { id: 'tercerizacao', nome: 'Tercerização', grupo: 'O que fazemos' },
        { id: 'treinamentos', nome: 'Treinamentos', grupo: 'O que fazemos' },
        { id: 'descoberta', nome: 'Descoberta & desenho', grupo: 'Integrações' },
        { id: 'construcao', nome: 'Construção', grupo: 'Integrações' },
        { id: 'operacao', nome: 'Operação', grupo: 'Integrações' },
        { id: 'governanca', nome: 'Governança', grupo: 'Integrações' },
        { id: 'diagnostico', nome: 'Diagnóstico e maturidade', grupo: 'Gerenciamento' },
        { id: 'pmo', nome: 'PMO e gestão de portfólio', grupo: 'Gerenciamento' },
        { id: 'itsm', nome: 'ITSM e catálogo de serviços', grupo: 'Gerenciamento' },
        { id: 'metodologias', nome: 'Metodologias e projetos de capital', grupo: 'Gerenciamento' },
      ],
      cargos: [
        { projeto: 'WE-UI', cargo: 'Desenvolvedor WE-UI', tag: 'Biblioteca / UI' },
        { projeto: 'OCP', cargo: 'Desenvolvedor OCP', tag: 'Colaboração interna' },
        { projeto: 'Open-Banking-Platform', cargo: 'Desenvolvedor Open-Banking', tag: 'Fintech' },
        { projeto: 'We-IA', cargo: 'Desenvolvedor We-IA', tag: 'IA interna' },
        { projeto: 'Trips4You', cargo: 'Desenvolvedor Trips4You', tag: 'Viagens' },
        { projeto: 'Soluções Supermercado', cargo: 'Desenvolvedor Soluções Supermercado', tag: 'Varejo / ERP' },
      ],
      devs: [
        { id: 'matheus-camargo-marques', nome: 'Matheus de Camargo Marques', cargo: 'Docente em Computação', bio: 'Desenvolvedor de Software | Elixir & Erlang OTP | MLOps | DevOps | Java | C++', local: 'Brasil', pronomes: 'Ele', foto: 'images/desenvolvedores/matheusdecamargomarques.webp', fotoAvif: 'images/desenvolvedores/matheusdecamargomarques.avif', fotoFallback: 'images/desenvolvedores/matheusdecamargomarques.jpeg' },
        { id: 'ricardo-kaminski', nome: 'Ricardo R. Kaminski', cargo: 'Engenheiro de Software e MLOps', bio: 'AI Agents • RAG | Cloud • APIs', local: 'Curitiba, Paraná, Brasil', pronomes: '', foto: 'images/desenvolvedores/ricardokamisky.webp', fotoAvif: 'images/desenvolvedores/ricardokamisky.avif', fotoFallback: 'images/desenvolvedores/ricardokamisky.png' },
        { id: 'eduarda-saibert', nome: 'Eduarda Saibert', cargo: 'Estagiária em Engenharia de Software', bio: 'React | Java | C++ | Estudante de Ciência da Computação @ UFPR', local: '', pronomes: '', foto: 'images/desenvolvedores/Eduarda Saibert.webp', fotoAvif: 'images/desenvolvedores/Eduarda Saibert.avif', fotoFallback: 'images/desenvolvedores/Eduarda Saibert.jpeg' },
        { id: 'emanuel-kidoguchi', nome: 'Emanuel (キドグチ) Kidoguchi', cargo: 'Desenvolvedor Backend (Ruby on Rails)', bio: 'REST APIs • PostgreSQL • Redis | Construindo aplicações limpas e sustentáveis', local: 'Suzuka, Prefeitura de Mie, Japão', pronomes: 'Ele', foto: 'images/desenvolvedores/Emanuel (キドグチ) Kidoguchi.webp', fotoAvif: 'images/desenvolvedores/Emanuel (キドグチ) Kidoguchi.avif', fotoFallback: 'images/desenvolvedores/Emanuel (キドグチ) Kidoguchi.jpeg' },
        { id: 'ricardo-patriani', nome: 'Ricardo Patriani', cargo: 'Administrador OGG | DBA', bio: 'OGG Admin | DBA', local: '', pronomes: '', foto: 'images/desenvolvedores/ricardopatriani.webp', fotoAvif: 'images/desenvolvedores/ricardopatriani.avif', fotoFallback: 'images/desenvolvedores/ricardopatriani.png' },
        { id: 'kevin-mathew', nome: 'Kevin Mathew', cargo: 'Engenheiro de Software', bio: 'Aberto a contratos | Backend, Elixir, Blockchain, IoT, AWS', local: 'Goa Sul, Goa, Índia', pronomes: '', foto: 'images/desenvolvedores/kevinmathew.webp', fotoAvif: 'images/desenvolvedores/kevinmathew.avif', fotoFallback: 'images/desenvolvedores/kevinmathew.jpeg' },
        { id: 'mario-cassiano', nome: 'Mario Cassiano', cargo: 'Engenheiro de Software Sênior', bio: 'Sistemas distribuídos & Elixir | Arquitetura de sistemas de IA & multiagentes | Plataformas cloud-native & escaláveis', local: 'Blumenau, Santa Catarina, Brasil', pronomes: '', foto: 'images/desenvolvedores/mariocassiano.webp', fotoAvif: 'images/desenvolvedores/mariocassiano.avif', fotoFallback: 'images/desenvolvedores/mariocassiano.jpeg' },
        { id: 'joao-victor-palha', nome: 'João Victor Ferreira Palha', cargo: 'Desenvolvedor Fullstack', bio: 'Node.js | React Native | Elixir', local: 'Brasil', pronomes: 'Ele', foto: 'images/desenvolvedores/joaovictorpalhaferreira.webp', fotoAvif: 'images/desenvolvedores/joaovictorpalhaferreira.avif', fotoFallback: 'images/desenvolvedores/joaovictorpalhaferreira.jpeg' },
        { id: 'daniel-oliveira', nome: 'Daniel Oliveira', cargo: 'Desenvolvedor Golang', bio: '', local: 'Curitiba, Paraná, Brasil', pronomes: '', foto: 'images/desenvolvedores/danieloliveira.webp', fotoAvif: 'images/desenvolvedores/danieloliveira.avif', fotoFallback: 'images/desenvolvedores/danieloliveira.jpeg' },
        { id: 'karla-guerreiro', nome: 'Karla Guerreiro', cargo: 'Analista de Projeto', bio: 'Banco de Dados | SQL | MySQL', local: '', pronomes: '', foto: 'images/desenvolvedores/karlaguerreiro.webp', fotoAvif: 'images/desenvolvedores/karlaguerreiro.avif', fotoFallback: 'images/desenvolvedores/karlaguerreiro.jpeg' },
        { id: 'juan-israel', nome: 'Juan Israel', cargo: 'Engenheiro de Software', bio: 'Full Stack', local: '', pronomes: '', foto: 'images/desenvolvedores/juanisrael.webp', fotoAvif: 'images/desenvolvedores/juanisrael.avif', fotoFallback: 'images/desenvolvedores/juanisrael.jpeg' },
        { id: 'davi-riiti-goto-do-valle', nome: 'Davi Riiti Goto do Valle', cargo: 'Mestrando (M.Sc.) e graduando em Engenharia Eletrônica @ UTFPR', bio: 'Visão computacional, machine learning e reconhecimento de padrões | Pesquisador em processamento de sinais', local: 'Curitiba, Paraná, Brasil', pronomes: 'Ele', foto: 'images/desenvolvedores/davigotodovale.webp', fotoAvif: 'images/desenvolvedores/davigotodovale.avif', fotoFallback: 'images/desenvolvedores/davigotodovale.jpeg' },
      ],
    },
    en: {
      servicos: [
        { id: 'alocacao', nome: 'Allocation', grupo: 'What we do' },
        { id: 'tercerizacao', nome: 'Outsourcing', grupo: 'What we do' },
        { id: 'treinamentos', nome: 'Training', grupo: 'What we do' },
        { id: 'descoberta', nome: 'Discovery & design', grupo: 'Integrations' },
        { id: 'construcao', nome: 'Implementation', grupo: 'Integrations' },
        { id: 'operacao', nome: 'Operations', grupo: 'Integrations' },
        { id: 'governanca', nome: 'Governance', grupo: 'Integrations' },
        { id: 'diagnostico', nome: 'Diagnostics & maturity', grupo: 'Management' },
        { id: 'pmo', nome: 'PMO & portfolio management', grupo: 'Management' },
        { id: 'itsm', nome: 'ITSM & service catalog', grupo: 'Management' },
        { id: 'metodologias', nome: 'Methodologies & capital projects', grupo: 'Management' },
      ],
      cargos: [
        { projeto: 'WE-UI', cargo: 'WE-UI Developer', tag: 'Library / UI' },
        { projeto: 'OCP', cargo: 'OCP Developer', tag: 'Internal collaboration' },
        { projeto: 'Open-Banking-Platform', cargo: 'Open-Banking Developer', tag: 'Fintech' },
        { projeto: 'We-IA', cargo: 'We-IA Developer', tag: 'Internal AI' },
        { projeto: 'Trips4You', cargo: 'Trips4You Developer', tag: 'Travel' },
        { projeto: 'Soluções Supermercado', cargo: 'Supermarket Solutions Developer', tag: 'Retail / ERP' },
      ],
      devs: [
        { id: 'matheus-camargo-marques', nome: 'Matheus de Camargo Marques', cargo: 'Computer Lecturer', bio: 'Software Developer | Elixir & Erlang OTP | MLOps | DevOps | Java | C++', local: 'Brazil', pronomes: 'He/Him', foto: 'images/desenvolvedores/matheusdecamargomarques.webp', fotoAvif: 'images/desenvolvedores/matheusdecamargomarques.avif', fotoFallback: 'images/desenvolvedores/matheusdecamargomarques.jpeg' },
        { id: 'ricardo-kaminski', nome: 'Ricardo R. Kaminski', cargo: 'Software & MLOps Engineer', bio: 'AI Agents • RAG | Cloud • APIs', local: 'Curitiba, Paraná, Brazil', pronomes: '', foto: 'images/desenvolvedores/ricardokamisky.webp', fotoAvif: 'images/desenvolvedores/ricardokamisky.avif', fotoFallback: 'images/desenvolvedores/ricardokamisky.png' },
        { id: 'eduarda-saibert', nome: 'Eduarda Saibert', cargo: 'Software Engineering Intern', bio: 'React | Java | C++ | Computer Science Student @ UFPR', local: '', pronomes: '', foto: 'images/desenvolvedores/Eduarda Saibert.webp', fotoAvif: 'images/desenvolvedores/Eduarda Saibert.avif', fotoFallback: 'images/desenvolvedores/Eduarda Saibert.jpeg' },
        { id: 'emanuel-kidoguchi', nome: 'Emanuel (キドグチ) Kidoguchi', cargo: 'Backend Developer (Ruby on Rails)', bio: 'REST APIs • PostgreSQL • Redis | Building clean & maintainable applications', local: 'Suzuka, Mie Prefecture, Japan', pronomes: 'He/Him', foto: 'images/desenvolvedores/Emanuel (キドグチ) Kidoguchi.webp', fotoAvif: 'images/desenvolvedores/Emanuel (キドグチ) Kidoguchi.avif', fotoFallback: 'images/desenvolvedores/Emanuel (キドグチ) Kidoguchi.jpeg' },
        { id: 'ricardo-patriani', nome: 'Ricardo Patriani', cargo: 'OGG Admin | DBA', bio: 'OGG Admin | DBA', local: '', pronomes: '', foto: 'images/desenvolvedores/ricardopatriani.webp', fotoAvif: 'images/desenvolvedores/ricardopatriani.avif', fotoFallback: 'images/desenvolvedores/ricardopatriani.png' },
        { id: 'kevin-mathew', nome: 'Kevin Mathew', cargo: 'Software Engineer', bio: 'Open to contract work | Backend, Elixir, Blockchain, IoT, AWS', local: 'South Goa, Goa, India', pronomes: '', foto: 'images/desenvolvedores/kevinmathew.webp', fotoAvif: 'images/desenvolvedores/kevinmathew.avif', fotoFallback: 'images/desenvolvedores/kevinmathew.jpeg' },
        { id: 'mario-cassiano', nome: 'Mario Cassiano', cargo: 'Senior Software Engineer', bio: 'Distributed systems & Elixir | AI & multi-agent system architecture | Cloud-native & scalable platforms', local: 'Blumenau, Santa Catarina, Brazil', pronomes: '', foto: 'images/desenvolvedores/mariocassiano.webp', fotoAvif: 'images/desenvolvedores/mariocassiano.avif', fotoFallback: 'images/desenvolvedores/mariocassiano.jpeg' },
        { id: 'joao-victor-palha', nome: 'João Victor Ferreira Palha', cargo: 'Fullstack Developer', bio: 'Node.js | React Native | Elixir', local: 'Brazil', pronomes: 'He/Him', foto: 'images/desenvolvedores/joaovictorpalhaferreira.webp', fotoAvif: 'images/desenvolvedores/joaovictorpalhaferreira.avif', fotoFallback: 'images/desenvolvedores/joaovictorpalhaferreira.jpeg' },
        { id: 'daniel-oliveira', nome: 'Daniel Oliveira', cargo: 'Golang Developer', bio: '', local: 'Curitiba, Paraná, Brazil', pronomes: '', foto: 'images/desenvolvedores/danieloliveira.webp', fotoAvif: 'images/desenvolvedores/danieloliveira.avif', fotoFallback: 'images/desenvolvedores/danieloliveira.jpeg' },
        { id: 'karla-guerreiro', nome: 'Karla Guerreiro', cargo: 'Project Analyst', bio: 'Database | SQL | MySQL', local: '', pronomes: '', foto: 'images/desenvolvedores/karlaguerreiro.webp', fotoAvif: 'images/desenvolvedores/karlaguerreiro.avif', fotoFallback: 'images/desenvolvedores/karlaguerreiro.jpeg' },
        { id: 'juan-israel', nome: 'Juan Israel', cargo: 'Software Engineer', bio: 'Full Stack', local: '', pronomes: '', foto: 'images/desenvolvedores/juanisrael.webp', fotoAvif: 'images/desenvolvedores/juanisrael.avif', fotoFallback: 'images/desenvolvedores/juanisrael.jpeg' },
        { id: 'davi-riiti-goto-do-valle', nome: 'Davi Riiti Goto do Valle', cargo: 'M.Sc. student & undergraduate in Electronic Engineering @ UTFPR', bio: 'Computer vision, machine learning & pattern recognition | Signal processing researcher', local: 'Curitiba, Paraná, Brazil', pronomes: 'He/Him', foto: 'images/desenvolvedores/davigotodovale.webp', fotoAvif: 'images/desenvolvedores/davigotodovale.avif', fotoFallback: 'images/desenvolvedores/davigotodovale.jpeg' },
      ],
    },
    ja: {
      servicos: [
        { id: 'alocacao', nome: 'アロケーション', grupo: 'サービス' },
        { id: 'tercerizacao', nome: 'アウトソーシング', grupo: 'サービス' },
        { id: 'treinamentos', nome: '研修', grupo: 'サービス' },
        { id: 'descoberta', nome: '発見・設計', grupo: '統合' },
        { id: 'construcao', nome: '実装', grupo: '統合' },
        { id: 'operacao', nome: '運用', grupo: '統合' },
        { id: 'governanca', nome: 'ガバナンス', grupo: '統合' },
        { id: 'diagnostico', nome: '診断・成熟度', grupo: 'マネジメント' },
        { id: 'pmo', nome: 'PMO・ポートフォリオ管理', grupo: 'マネジメント' },
        { id: 'itsm', nome: 'ITSM・サービスカタログ', grupo: 'マネジメント' },
        { id: 'metodologias', nome: 'メソドロジー・資本プロジェクト', grupo: 'マネジメント' },
      ],
      cargos: [
        { projeto: 'WE-UI', cargo: 'WE-UI開発者', tag: 'ライブラリ / UI' },
        { projeto: 'OCP', cargo: 'OCP開発者', tag: '社内コラボレーション' },
        { projeto: 'Open-Banking-Platform', cargo: 'Open-Banking開発者', tag: 'フィンテック' },
        { projeto: 'We-IA', cargo: 'We-IA開発者', tag: '社内AI' },
        { projeto: 'Trips4You', cargo: 'Trips4You開発者', tag: '旅行' },
        { projeto: 'Soluções Supermercado', cargo: 'スーパーマーケットソリューション開発者', tag: '小売 / ERP' },
      ],
      devs: [
        { id: 'matheus-camargo-marques', nome: 'Matheus de Camargo Marques', cargo: 'コンピュータ講師', bio: 'ソフトウェア開発者 | Elixir & Erlang OTP | MLOps | DevOps | Java | C++', local: 'ブラジル', pronomes: 'He/Him', foto: 'images/desenvolvedores/matheusdecamargomarques.webp', fotoAvif: 'images/desenvolvedores/matheusdecamargomarques.avif', fotoFallback: 'images/desenvolvedores/matheusdecamargomarques.jpeg' },
        { id: 'ricardo-kaminski', nome: 'Ricardo R. Kaminski', cargo: 'ソフトウェア・MLOpsエンジニア', bio: 'AI Agents • RAG | Cloud • APIs', local: 'クリチバ、パラナ、ブラジル', pronomes: '', foto: 'images/desenvolvedores/ricardokamisky.webp', fotoAvif: 'images/desenvolvedores/ricardokamisky.avif', fotoFallback: 'images/desenvolvedores/ricardokamisky.png' },
        { id: 'eduarda-saibert', nome: 'Eduarda Saibert', cargo: 'ソフトウェアエンジニアリングインターン', bio: 'React | Java | C++ | UFPR計算機科学学生', local: '', pronomes: '', foto: 'images/desenvolvedores/Eduarda Saibert.webp', fotoAvif: 'images/desenvolvedores/Eduarda Saibert.avif', fotoFallback: 'images/desenvolvedores/Eduarda Saibert.jpeg' },
        { id: 'emanuel-kidoguchi', nome: 'Emanuel (キドグチ) Kidoguchi', cargo: 'バックエンド開発者 (Ruby on Rails)', bio: 'REST APIs • PostgreSQL • Redis | クリーンで保守可能なアプリケーション構築', local: '三重県鈴鹿市、日本', pronomes: '彼', foto: 'images/desenvolvedores/Emanuel (キドグチ) Kidoguchi.webp', fotoAvif: 'images/desenvolvedores/Emanuel (キドグチ) Kidoguchi.avif', fotoFallback: 'images/desenvolvedores/Emanuel (キドグチ) Kidoguchi.jpeg' },
        { id: 'ricardo-patriani', nome: 'Ricardo Patriani', cargo: 'OGG管理者 | DBA', bio: 'OGG Admin | DBA', local: '', pronomes: '', foto: 'images/desenvolvedores/ricardopatriani.webp', fotoAvif: 'images/desenvolvedores/ricardopatriani.avif', fotoFallback: 'images/desenvolvedores/ricardopatriani.png' },
        { id: 'kevin-mathew', nome: 'Kevin Mathew', cargo: 'ソフトウェアエンジニア', bio: '契約可能 | Backend、Elixir、Blockchain、IoT、AWS', local: '南ゴア、ゴア、インド', pronomes: '', foto: 'images/desenvolvedores/kevinmathew.webp', fotoAvif: 'images/desenvolvedores/kevinmathew.avif', fotoFallback: 'images/desenvolvedores/kevinmathew.jpeg' },
        { id: 'mario-cassiano', nome: 'Mario Cassiano', cargo: 'シニアソフトウェアエンジニア', bio: '分散システム & Elixir | AI・マルチエージェントアーキテクチャ | クラウドネイティブ・スケーラブルプラットフォーム', local: 'ブルメナウ、サンタカタリーナ、ブラジル', pronomes: '', foto: 'images/desenvolvedores/mariocassiano.webp', fotoAvif: 'images/desenvolvedores/mariocassiano.avif', fotoFallback: 'images/desenvolvedores/mariocassiano.jpeg' },
        { id: 'joao-victor-palha', nome: 'João Victor Ferreira Palha', cargo: 'フルスタック開発者', bio: 'Node.js | React Native | Elixir', local: 'ブラジル', pronomes: 'He/Him', foto: 'images/desenvolvedores/joaovictorpalhaferreira.webp', fotoAvif: 'images/desenvolvedores/joaovictorpalhaferreira.avif', fotoFallback: 'images/desenvolvedores/joaovictorpalhaferreira.jpeg' },
        { id: 'daniel-oliveira', nome: 'Daniel Oliveira', cargo: 'Golang開発者', bio: '', local: 'クリチバ、パラナ、ブラジル', pronomes: '', foto: 'images/desenvolvedores/danieloliveira.webp', fotoAvif: 'images/desenvolvedores/danieloliveira.avif', fotoFallback: 'images/desenvolvedores/danieloliveira.jpeg' },
        { id: 'karla-guerreiro', nome: 'Karla Guerreiro', cargo: 'プロジェクトアナリスト', bio: 'データベース | SQL | MySQL', local: '', pronomes: '', foto: 'images/desenvolvedores/karlaguerreiro.webp', fotoAvif: 'images/desenvolvedores/karlaguerreiro.avif', fotoFallback: 'images/desenvolvedores/karlaguerreiro.jpeg' },
        { id: 'juan-israel', nome: 'Juan Israel', cargo: 'ソフトウェアエンジニア', bio: 'フルスタック', local: '', pronomes: '', foto: 'images/desenvolvedores/juanisrael.webp', fotoAvif: 'images/desenvolvedores/juanisrael.avif', fotoFallback: 'images/desenvolvedores/juanisrael.jpeg' },
        { id: 'davi-riiti-goto-do-valle', nome: 'Davi Riiti Goto do Valle', cargo: 'M.Sc.学生・UTFPR電子工学科学部生', bio: 'コンピュータビジョン、機械学習、パターン認識 | 信号処理の研究者', local: 'クリチバ、パラナ、ブラジル', pronomes: '彼', foto: 'images/desenvolvedores/davigotodovale.webp', fotoAvif: 'images/desenvolvedores/davigotodovale.avif', fotoFallback: 'images/desenvolvedores/davigotodovale.jpeg' },
      ],
    },
    kok: {
      /* Konknni: usando inglês como fallback; substituir por traduções em Konknni quando disponíveis */
      servicos: [
        { id: 'alocacao', nome: 'Allocation', grupo: 'What we do' },
        { id: 'tercerizacao', nome: 'Outsourcing', grupo: 'What we do' },
        { id: 'treinamentos', nome: 'Training', grupo: 'What we do' },
        { id: 'descoberta', nome: 'Discovery & design', grupo: 'Integrations' },
        { id: 'construcao', nome: 'Implementation', grupo: 'Integrations' },
        { id: 'operacao', nome: 'Operations', grupo: 'Integrations' },
        { id: 'governanca', nome: 'Governance', grupo: 'Integrations' },
        { id: 'diagnostico', nome: 'Diagnostics & maturity', grupo: 'Management' },
        { id: 'pmo', nome: 'PMO & portfolio management', grupo: 'Management' },
        { id: 'itsm', nome: 'ITSM & service catalog', grupo: 'Management' },
        { id: 'metodologias', nome: 'Methodologies & capital projects', grupo: 'Management' },
      ],
      cargos: [
        { projeto: 'WE-UI', cargo: 'WE-UI Developer', tag: 'Library / UI' },
        { projeto: 'OCP', cargo: 'OCP Developer', tag: 'Internal collaboration' },
        { projeto: 'Open-Banking-Platform', cargo: 'Open-Banking Developer', tag: 'Fintech' },
        { projeto: 'We-IA', cargo: 'We-IA Developer', tag: 'Internal AI' },
        { projeto: 'Trips4You', cargo: 'Trips4You Developer', tag: 'Travel' },
        { projeto: 'Soluções Supermercado', cargo: 'Supermarket Solutions Developer', tag: 'Retail / ERP' },
      ],
      devs: [
        { id: 'matheus-camargo-marques', nome: 'Matheus de Camargo Marques', cargo: 'Computer Lecturer', bio: 'Software Developer | Elixir & Erlang OTP | MLOps | DevOps | Java | C++', local: 'Brazil', pronomes: 'He/Him', foto: 'images/desenvolvedores/matheusdecamargomarques.webp', fotoAvif: 'images/desenvolvedores/matheusdecamargomarques.avif', fotoFallback: 'images/desenvolvedores/matheusdecamargomarques.jpeg' },
        { id: 'ricardo-kaminski', nome: 'Ricardo R. Kaminski', cargo: 'Software & MLOps Engineer', bio: 'AI Agents • RAG | Cloud • APIs', local: 'Curitiba, Paraná, Brazil', pronomes: '', foto: 'images/desenvolvedores/ricardokamisky.webp', fotoAvif: 'images/desenvolvedores/ricardokamisky.avif', fotoFallback: 'images/desenvolvedores/ricardokamisky.png' },
        { id: 'eduarda-saibert', nome: 'Eduarda Saibert', cargo: 'Software Engineering Intern', bio: 'React | Java | C++ | Computer Science Student @ UFPR', local: '', pronomes: '', foto: 'images/desenvolvedores/Eduarda Saibert.webp', fotoAvif: 'images/desenvolvedores/Eduarda Saibert.avif', fotoFallback: 'images/desenvolvedores/Eduarda Saibert.jpeg' },
        { id: 'emanuel-kidoguchi', nome: 'Emanuel (キドグチ) Kidoguchi', cargo: 'Backend Developer (Ruby on Rails)', bio: 'REST APIs • PostgreSQL • Redis | Building clean & maintainable applications', local: 'Suzuka, Mie Prefecture, Japan', pronomes: 'He/Him', foto: 'images/desenvolvedores/Emanuel (キドグチ) Kidoguchi.webp', fotoAvif: 'images/desenvolvedores/Emanuel (キドグチ) Kidoguchi.avif', fotoFallback: 'images/desenvolvedores/Emanuel (キドグチ) Kidoguchi.jpeg' },
        { id: 'ricardo-patriani', nome: 'Ricardo Patriani', cargo: 'OGG Admin | DBA', bio: 'OGG Admin | DBA', local: '', pronomes: '', foto: 'images/desenvolvedores/ricardopatriani.webp', fotoAvif: 'images/desenvolvedores/ricardopatriani.avif', fotoFallback: 'images/desenvolvedores/ricardopatriani.png' },
        { id: 'kevin-mathew', nome: 'Kevin Mathew', cargo: 'Software Engineer', bio: 'Open to contract work | Backend, Elixir, Blockchain, IoT, AWS', local: 'South Goa, Goa, India', pronomes: '', foto: 'images/desenvolvedores/kevinmathew.webp', fotoAvif: 'images/desenvolvedores/kevinmathew.avif', fotoFallback: 'images/desenvolvedores/kevinmathew.jpeg' },
        { id: 'mario-cassiano', nome: 'Mario Cassiano', cargo: 'Senior Software Engineer', bio: 'Distributed systems & Elixir | AI & multi-agent system architecture | Cloud-native & scalable platforms', local: 'Blumenau, Santa Catarina, Brazil', pronomes: '', foto: 'images/desenvolvedores/mariocassiano.webp', fotoAvif: 'images/desenvolvedores/mariocassiano.avif', fotoFallback: 'images/desenvolvedores/mariocassiano.jpeg' },
        { id: 'joao-victor-palha', nome: 'João Victor Ferreira Palha', cargo: 'Fullstack Developer', bio: 'Node.js | React Native | Elixir', local: 'Brazil', pronomes: 'He/Him', foto: 'images/desenvolvedores/joaovictorpalhaferreira.webp', fotoAvif: 'images/desenvolvedores/joaovictorpalhaferreira.avif', fotoFallback: 'images/desenvolvedores/joaovictorpalhaferreira.jpeg' },
        { id: 'daniel-oliveira', nome: 'Daniel Oliveira', cargo: 'Golang Developer', bio: '', local: 'Curitiba, Paraná, Brazil', pronomes: '', foto: 'images/desenvolvedores/danieloliveira.webp', fotoAvif: 'images/desenvolvedores/danieloliveira.avif', fotoFallback: 'images/desenvolvedores/danieloliveira.jpeg' },
        { id: 'karla-guerreiro', nome: 'Karla Guerreiro', cargo: 'Project Analyst', bio: 'Database | SQL | MySQL', local: '', pronomes: '', foto: 'images/desenvolvedores/karlaguerreiro.webp', fotoAvif: 'images/desenvolvedores/karlaguerreiro.avif', fotoFallback: 'images/desenvolvedores/karlaguerreiro.jpeg' },
        { id: 'juan-israel', nome: 'Juan Israel', cargo: 'Software Engineer', bio: 'Full Stack', local: '', pronomes: '', foto: 'images/desenvolvedores/juanisrael.webp', fotoAvif: 'images/desenvolvedores/juanisrael.avif', fotoFallback: 'images/desenvolvedores/juanisrael.jpeg' },
        { id: 'davi-riiti-goto-do-valle', nome: 'Davi Riiti Goto do Valle', cargo: 'M.Sc. student & undergraduate in Electronic Engineering @ UTFPR', bio: 'Computer vision, machine learning & pattern recognition | Signal processing researcher', local: 'Curitiba, Paraná, Brazil', pronomes: 'He/Him', foto: 'images/desenvolvedores/davigotodovale.webp', fotoAvif: 'images/desenvolvedores/davigotodovale.avif', fotoFallback: 'images/desenvolvedores/davigotodovale.jpeg' },
      ],
    },
  };

  var UI_LABELS = {
    pt: { fotoDe: 'Foto de ' },
    en: { fotoDe: 'Photo of ' },
    ja: { fotoDe: '写真：' },  /* Photo: */
    kok: { fotoDe: 'Photo of ' },
  };

  var lang = getLang();
  var data = DATA[lang] || DATA.en || DATA.pt;
  var ui = UI_LABELS[lang] || UI_LABELS.en;

  window.WESERVICOS_CATALOGO = data.servicos;
  window.WECARGOS_PORTFOLIO = data.cargos;
  window.WEDESENVOLVEDORES = data.devs;
  window.WE_UI = ui;
})();
