# Rota Segura — Transporte Escolar (Front-end)

Front-end completo em Next.js/TypeScript/Tailwind para um site institucional
de transporte escolar, com Área do Cliente e dashboard fictícios (sem
backend). Todas as imagens são placeholders estilizados — basta substituir
pelos arquivos reais em `public/images` e trocar os componentes `MediaFrame`
por `<Image />` do Next.js quando as fotos estiverem prontas.

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. A Área do Cliente fica em `/login`
(qualquer CPF/senha entra, pois não há backend) e o dashboard fictício em
`/dashboard`.

```bash
npm run build   # build de produção
npm run lint    # checagem de lint
```

## Estrutura

```
app/
├── page.tsx           → monta a landing page (todas as seções)
├── layout.tsx          → layout raiz, metadata, fontes do sistema
├── globals.css         → tokens de cor/tipografia, animações da rota
├── login/page.tsx      → tela de login (somente visual)
└── dashboard/page.tsx  → área do cliente (somente visual)

components/
├── sections/           → Navbar, Hero, Sobre, Van, Escolas, Rotas,
│                          Segurança, Depoimentos, Galeria, Faq, Contato,
│                          Footer, WhatsappFloat
└── ui/                  → Button, Card, SectionHeading, MediaFrame,
                            RouteMotif (elemento de assinatura), ThemeToggle,
                            SocialIcons

lib/
├── data.ts              → todo o conteúdo mockado (escolas, rotas,
│                           depoimentos, FAQ etc.) — fácil de editar
└── utils.ts             → helper de classes (cn)
```

## Identidade visual

- Cores: navy `#0F172A`, amarelo `#FACC15`, branco e cinza-claro, conforme
  briefing.
- Tipografia: pilha de fontes do sistema (sem chamada externa a Google
  Fonts, para funcionar em qualquer ambiente sem dependência de rede) e uma
  fonte monoespaçada para números (mensalidades, horários), lembrando um
  painel de embarque.
- Elemento de assinatura: uma rota tracejada animada com uma van percorrendo
  o caminho, usada no Hero, nas Rotas e no dashboard — reforça a promessa de
  pontualidade e rastreamento.
- Modo escuro incluído (alternância no header, com persistência).

## Próximos passos (fora do escopo deste front-end)

- Autenticação real (Supabase, NextAuth ou similar) no lugar do login
  fictício em `/login`.
- Integração com Google Maps API nas seções "Rotas", "Contato" e no
  dashboard (hoje são ilustrações esquemáticas).
- Persistência de mensalidades/avisos em banco de dados.
- Substituir os `MediaFrame` por fotos reais.

O código já está componentizado para que essas integrações não exijam
refatoração estrutural.
