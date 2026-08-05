import type { SiteAssetSettings, SiteContentSettings } from "@/lib/app-types";

export function emptySiteAsset(): SiteAssetSettings {
  return {
    url: "",
    storagePath: "",
    storageProvider: "",
    fileName: "",
    contentType: "",
    updatedAt: "",
  };
}

export function defaultSiteContent(): SiteContentSettings {
  return {
    navigation: {
      home: "Inicio",
      about: "Sobre",
      neighborhoods: "Bairros",
      schools: "Escolas",
      safety: "Seguranca",
      contact: "Contato",
      clientArea: "Area do Cliente",
    },
    hero: {
      eyebrow: "Transporte escolar em Toledo - PR",
      title: "Oziel",
      accent: "Turismo",
      subtitle: "Seguranca, pontualidade e acompanhamento em tempo real em cada trajeto.",
      description:
        "Atendimento em Toledo e regiao, com veiculo vistoriado, rotina organizada e comunicacao clara com os responsaveis.",
      primaryButton: "Solicitar vaga",
      secondaryButton: "Ver bairros",
    },
    driver: {
      eyebrow: "Quem dirige",
      title: "Uma pessoa que voce conhece pelo nome, nao por um app",
      description:
        "Sou o motorista responsavel pela rotina escolar. Cada trajeto e realizado com pontualidade, comunicacao e o mesmo cuidado que eu gostaria para a minha familia.",
      photoAlt: "Motorista responsavel pelo transporte escolar",
    },
    driverHighlights: [
      { id: "driver_experience", title: "Experiencia", detail: "Anos de pratica nas ruas e horarios de Toledo." },
      { id: "driver_course", title: "Curso de Transporte Escolar", detail: "Formacao especifica renovada periodicamente." },
      { id: "driver_first_aid", title: "Primeiros Socorros", detail: "Certificacao atualizada e kit completo a bordo." },
      { id: "driver_license", title: "CNH Categoria D", detail: "Habilitacao para transporte coletivo de passageiros." },
      { id: "driver_insurance", title: "Seguro contra acidentes", detail: "Apolice vigente para todos os passageiros." },
      { id: "driver_punctuality", title: "Pontualidade", detail: "Chegada e saida no horario combinado com a escola." },
    ],
    van: {
      eyebrow: "Nossa van",
      title: "Feita para o trajeto de todos os dias",
    },
    vanSpecs: [
      { id: "van_model", label: "Modelo", value: "Sprinter Escolar 2023" },
      { id: "van_capacity", label: "Capacidade", value: "20 lugares" },
      { id: "van_year", label: "Ano", value: "2023" },
      { id: "van_inspection", label: "Vistoria", value: "Em dia" },
    ],
    vanFeatures: [
      { id: "van_air", title: "Ar-condicionado", detail: "Clima agradavel em qualquer estacao." },
      { id: "van_seatbelts", title: "Cintos em todos os bancos", detail: "Um cinto por crianca, sem excecao." },
      { id: "van_seats", title: "Bancos reforcados", detail: "Estofado firme e alturas ajustadas por idade." },
      { id: "van_door", title: "Porta com trava automatica", detail: "Abre e fecha apenas com o motorista." },
      { id: "van_gps", title: "Rastreador GPS", detail: "Localizacao em tempo real durante o transporte." },
      { id: "van_cameras", title: "Cameras internas", detail: "Gravacao continua das areas de embarque." },
    ],
    schools: {
      eyebrow: "Onde atendemos",
      title: "Escolas atendidas em Toledo",
      button: "Consultar vaga",
    },
    neighborhoods: {
      eyebrow: "Bairros de Toledo",
      title: "Bairros atendidos",
      description: "Veja de forma direta os bairros onde o transporte esta atendendo hoje.",
      listTitle: "Bairros atendidos",
      emptyText: "Nenhum bairro cadastrado.",
    },
    safety: {
      eyebrow: "Seguranca",
      title: "Cuidado que nao aparece, mas sustenta tudo",
      description: "A rotina que garante que cada viagem seja previsivel e segura para todos.",
    },
    safetyItems: [
      { id: "safety_training", title: "Motorista treinado", detail: "Reciclagem periodica de direcao defensiva." },
      { id: "safety_insurance", title: "Seguro vigente", detail: "Cobertura para passageiros e terceiros." },
      { id: "safety_monitoring", title: "Monitoramento continuo", detail: "Cameras ativas do embarque ao desembarque." },
      { id: "safety_gps", title: "GPS em tempo real", detail: "Rota visivel para a familia durante o transporte." },
      { id: "safety_maintenance", title: "Manutencao preventiva", detail: "Revisoes mecanicas realizadas periodicamente." },
      { id: "safety_documents", title: "Veiculo regularizado", detail: "Documentacao e vistoria escolar em dia." },
      { id: "safety_first_aid", title: "Kit de primeiros socorros", detail: "Conferido e reposto regularmente." },
      { id: "safety_checklist", title: "Checklist diario", detail: "Verificacao antes de cada saida." },
    ],
    testimonials: {
      eyebrow: "Depoimentos",
      title: "Quem confia, conta",
    },
    testimonialItems: [
      {
        id: "testimonial_1",
        name: "Marcia Andrade",
        role: "Mae de aluna",
        quote: "Minha filha embarca tranquila e eu consigo acompanhar a rotina com seguranca.",
      },
      {
        id: "testimonial_2",
        name: "Rogerio Vasques",
        role: "Pai de aluno",
        quote: "A comunicacao e clara e qualquer imprevisto e informado rapidamente.",
      },
    ],
    faq: {
      eyebrow: "Duvidas",
      title: "Perguntas frequentes",
    },
    faqItems: [
      {
        id: "faq_how",
        question: "Como funciona o transporte?",
        answer: "A van passa nos enderecos combinados nos horarios definidos com cada familia.",
      },
      {
        id: "faq_tracking",
        question: "Posso acompanhar o trajeto?",
        answer: "Sim. A localizacao aparece na Area do Cliente enquanto a rota estiver ativa.",
      },
      {
        id: "faq_payment",
        question: "Como funciona o pagamento?",
        answer: "A mensalidade e acompanhada pela Area do Cliente, onde tambem e possivel enviar o comprovante.",
      },
    ],
    contact: {
      eyebrow: "Contato",
      title: "Solicite uma vaga",
      kicker: "Atendimento direto",
      headline: "Informe escola, turno e bairro para consultar disponibilidade.",
      description:
        "A consulta usa as escolas e os bairros cadastrados no painel administrativo para organizar o atendimento.",
      callButton: "Ligar",
      city: "Toledo, PR",
      socialLabel: "Redes sociais",
      instagramUrl: "https://instagram.com",
      facebookUrl: "https://facebook.com",
      phoneLabel: "Telefone",
      whatsappLabel: "WhatsApp",
      cityLabel: "Cidade",
    },
    footer: {
      description: "Transporte escolar em Toledo, PR. Atendimento com seguranca, comunicacao e pontualidade.",
      navigationTitle: "Navegacao",
      institutionalTitle: "Institucional",
      clientAreaTitle: "Area do Cliente",
      clientAreaDescription: "Mensalidades, filhos cadastrados e recibos em um so lugar.",
      clientAreaButton: "Acessar",
      rightsText: "Todos os direitos reservados.",
      documentPrefix: "CNPJ",
    },
    businessCard: {
      button: "Cartao de visitas",
      eyebrow: "Oziel Turismo",
      title: "Nosso cartao de visitas",
      description: "Abra ou compartilhe nosso contato com familiares e conhecidos.",
      openButton: "Abrir cartao",
      shareButton: "Compartilhar",
      backButton: "Voltar ao site",
      unavailableText: "O cartao de visitas ainda nao foi publicado.",
      copiedText: "Link copiado",
    },
    assistant: {
      subtitle: "assistente de atendimento",
      greeting: "Oi! Posso montar sua consulta de transporte em alguns passos.",
      startButton: "Gostaria de saber o valor para transporte",
      initialHint: "Clique na opcao abaixo e eu monto a consulta com voce.",
      shiftQuestion: "Pra qual turno voce necessita?",
      nameLabel: "Seu nome",
      phoneLabel: "Seu WhatsApp",
      schoolQuestion: "Pra qual instituicao?",
      selectPlaceholder: "Selecione",
      otherSchoolOption: "Outra instituicao",
      customSchoolLabel: "Nome da instituicao",
      neighborhoodLabel: "Bairro onde reside",
      customSchoolUnavailable: "Infelizmente essa instituicao ainda nao esta cadastrada para atendimento.",
      schoolRequired: "Me diga a instituicao para eu conferir se esse turno esta disponivel.",
      schoolShiftUnavailable: "Infelizmente essa instituicao nesse turno nao realizamos atendimento.",
      neighborhoodRequired: "Agora escolha o bairro onde reside para fechar a consulta.",
      neighborhoodUnavailable: "Infelizmente ainda nao atendemos esse bairro.",
      available: "Atendemos esse turno, escola e bairro. Posso encaminhar a mensagem completa no WhatsApp.",
      sendButton: "Enviar no WhatsApp",
      sentButton: "Mensagem preparada",
      messageIntro: "Ola! Gostaria de saber o valor para transporte escolar.",
    },
  };
}

export function normalizeSiteContent(input?: Partial<SiteContentSettings>): SiteContentSettings {
  const base = defaultSiteContent();
  const source = input || {};

  return {
    ...base,
    ...source,
    navigation: { ...base.navigation, ...source.navigation },
    hero: { ...base.hero, ...source.hero },
    driver: { ...base.driver, ...source.driver },
    driverHighlights: Array.isArray(source.driverHighlights) ? source.driverHighlights : base.driverHighlights,
    van: { ...base.van, ...source.van },
    vanSpecs: Array.isArray(source.vanSpecs) ? source.vanSpecs : base.vanSpecs,
    vanFeatures: Array.isArray(source.vanFeatures) ? source.vanFeatures : base.vanFeatures,
    schools: { ...base.schools, ...source.schools },
    neighborhoods: { ...base.neighborhoods, ...source.neighborhoods },
    safety: { ...base.safety, ...source.safety },
    safetyItems: Array.isArray(source.safetyItems) ? source.safetyItems : base.safetyItems,
    testimonials: { ...base.testimonials, ...source.testimonials },
    testimonialItems: Array.isArray(source.testimonialItems) ? source.testimonialItems : base.testimonialItems,
    faq: { ...base.faq, ...source.faq },
    faqItems: Array.isArray(source.faqItems) ? source.faqItems : base.faqItems,
    contact: { ...base.contact, ...source.contact },
    footer: { ...base.footer, ...source.footer },
    businessCard: { ...base.businessCard, ...source.businessCard },
    assistant: { ...base.assistant, ...source.assistant },
  };
}

export function normalizeSiteAsset(input?: Partial<SiteAssetSettings>): SiteAssetSettings {
  return { ...emptySiteAsset(), ...input };
}
