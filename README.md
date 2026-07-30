# Rota Segura - Transporte Escolar

Site e sistema de gestao para transporte escolar, feito em Next.js,
TypeScript e Tailwind.

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Acessos de teste

Admin:

- contato: `(45) 99999-9999`
- senha: `000.000.000-00`
- rota: `/admin`

Responsavel:

- contato: `(45) 98888-0001`
- senha/CPF: `123.456.789-10`
- rota: `/dashboard`

Motorista:

- rota: `/driver`
- usar pelo celular com permissao de GPS liberada no navegador

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
- Persistencia local em `data/app-db.json`.

## Observacao de producao

O backend atual usa arquivo local para acelerar o desenvolvimento do mid-end e
do fluxo funcional. Para publicar de forma definitiva no Vercel, troque essa
persistencia por um banco real e armazenamento de arquivos, como Supabase,
Vercel Postgres/Blob ou outro servico equivalente.

## Validacao

```bash
npm run lint
npm run build
```
