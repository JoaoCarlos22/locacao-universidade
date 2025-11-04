# Locação Universitária de Salas e Equipamentos
  
Sistema web em Node.js/EJS para agendamento de locais e equipamentos na universidade. Perfis: colaborador, admin e diretor — controle de reservas, recursos por local e fluxo de aprovação.

## Tecnologias
- Node.js + Express — entrada: `app.js`
- EJS — layout: `views/layouts/main.ejs`
- MySQL via `mysql2/promise` — conexão: `db/connection.js`
- Sessões: `express-session`
- Hash de senha: `bcrypt`
- Front-end: Bootstrap 5 + Bootstrap Icons; estilos: `public/css/style.css`
- Dependências e scripts: `package.json`

## Como executar
1. Instalar dependências:
    ```sh
    npm install
    ```
2. Criar arquivo `.env` com as variáveis:
    ```
    DB_HOST=
    DB_USER=
    DB_PASSWORD=
    DB_NAME=
    PORT=
    SESSION_SECRET=
    ```
3. Criar esquema do banco:
    ```sh
    mysql -u <user> -p < db/schema.sql
    ```
4. Iniciar servidor:
    ```sh
    npm start
    ```
5. Acessar: `http://localhost:<PORT>/login` (veja `app.js`)

## Estrutura do projeto (principais arquivos)
- `app.js` — configuração e inicialização
- `package.json`

Database
- `db/schema.sql` — esquema do banco
- `db/connection.js` — pool / conexão

Middlewares
- `middlewares/authMiddleware.js` — autenticação
- `middlewares/roleMiddleware.js` — autorização / roles

Rotas
- `routes/authRoutes.js`
- `routes/colaboradorRoutes.js`
- `routes/adminRoutes.js`
- `routes/diretorRoutes.js`

Serviços / controllers (lógica de negócio)
- `services/authServices.js`
- `services/colaboradorServices.js`
  - handlers: `colaboradorServices.home`, `colaboradorServices.reservar`
- `services/adminServices.js`
  - handler: `adminServices.telaDashboard`
- `services/diretorServices.js`
  - handlers: `diretorServices.telaDashboard`, `diretorServices.telaCadastroLocal`, `diretorServices.telaPerfil`

Views (EJS)
- `views/layouts/` e `views/partials/` (`header.ejs`, `sidebar.ejs`, `footer.ejs`)
- `views/login.ejs`, `views/register.ejs`
- `views/colaborador/*`, `views/admin/*`, `views/diretor/*`
- `views/paginaErro.ejs`

## Fluxo principal
- Usuário faz login/registro — controladores em `services/authServices.js`
- Colaborador acessa dashboard — `services/colaboradorServices.home` → `views/colaborador/home.ejs`
- Formulário de reserva envia equipamentos como `equipamentos[<locais_recursos_id>]` — tratado em `services/colaboradorServices.reservar`
- Verificações: conflitos de horário (tabela `reservas`) e disponibilidade por `locais_recursos` / `recursos_reservas` (veja `db/schema.sql`)
- Admin pode visualizar/enviar reservas para diretoria — `views/admin/dashboard.ejs` / `services/adminServices.enviarReserva`
- Diretor aprova/reprova e gerencia locais/recursos — rotas em `routes/diretorRoutes.js`, lógica em `services/diretorServices.js`, views em `views/diretor/`

## Notas importantes e recomendações
- Mantenha o `.env` fora do controle de versão (`.gitignore`).
- Teste o schema antes de usar; as tabelas essenciais: `locais`, `recursos`, `locais_recursos`, `reservas`, `recursos_reservas`.
- Use índices e transações ao verificar e reservar recursos concorrentes (considere `FOR UPDATE` e transações nas services).
- Personalize mensagens e regras de negócio nos controllers:
  - Colaborador: `services/colaboradorServices.reservar`
  - Diretor (locais): `services/diretorServices.cadastrarLocal`
  