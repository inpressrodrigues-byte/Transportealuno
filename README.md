# Rota Segura - Transporte Escolar

Site e sistema de gestao para transporte escolar, feito em Next.js,
TypeScript e Tailwind.

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Funcionalidades atuais

- Landing page institucional.
- Login com perfil de admin e responsavel.
- Area admin para editar dados da empresa, Pix, escolas, responsaveis,
  mensalidades e cores do sistema.
- Catalogo inicial com escolas de Toledo separadas por CMEI, Municipal,
  Estadual, Particular e Faculdade.
- Admin de escolas com selecao de turnos atendidos: manha, tarde e noite.
- Admin de bairros atendidos, com mapa colorido para bairros ativos e escala
  de cinza para bairros ainda nao atendidos.
- Atendimento em formato de celular na pagina inicial, validando turno, escola
  e bairro antes de abrir a conversa no WhatsApp.
- Area dos pais para cadastrar filhos, informar endereco, buscar dados por CEP,
  salvar coordenadas do aparelho quando permitido, ver Pix, anexar comprovante
  abrir recibo e acompanhar o AO VIVO do motorista.
- Tela do motorista em `/driver` para iniciar, atualizar e encerrar o AO VIVO
  usando GPS do celular quando permitido.
- Recibo liberado somente depois do comprovante anexado.
- APIs internas em `/api/*`.
- Multiempresa com perfis de administrador, empresa, motorista, responsavel e aluno.
- Dashboard com receita, inadimplencia, motoristas online, fluxo de caixa e alertas.
- Documentos dos motoristas, ocorrencias, manutencoes, IPVA, seguro, pneus e abastecimentos.
- Historico de GPS, notificacoes de embarque/desembarque e trilha de auditoria.
- Relatorios financeiros, alunos, frota e presenca em CSV/Excel e impressao em PDF.
- PWA instalavel no celular, com shell offline e APIs sempre consultadas em tempo real.
- Persistencia preferencial no Supabase/PostgreSQL, com Vercel Blob e arquivo local como fallback.

## Observacao de producao

Para usar Supabase, execute `supabase/migrations/001_app_state.sql` e configure
`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no Vercel. A chave de service role
nunca deve ser exposta no navegador. Sem Supabase ou Blob, o painel avisa que a
persistencia esta em modo temporario.

## Validacao

```bash
npm run lint
npm run build
```
