# Locacao Universitaria (ASP.NET + React)

Projeto migrado de Node.js/EJS para:

- Backend: ASP.NET Core Web API (.NET 10)
- Frontend: React + Vite (JavaScript)
- Banco: MySQL (schema existente em `db/schema.sql`)

## Estrutura

- `backend/` API ASP.NET com JWT, EF Core e MySQL
- `frontend/` aplicação React com rotas e telas por perfil
- `db/schema.sql` schema do banco atual
- `app.js`, `routes/`, `services/`, `views/` legado Node/EJS (mantido para referência)

## Pré-requisitos

- .NET SDK 10+
- Node.js 20+
- MySQL 8+

## Banco de Dados

Use o schema atual:

```sh
mysql -u <user> -p < db/schema.sql
```

## Configuração da API

Arquivo: `backend/appsettings.json`

```json
{
	"ConnectionStrings": {
		"DefaultConnection": "server=localhost;port=3306;database=locacao_universitaria;user=root;password="
	},
	"Jwt": {
		"Key": "troque-esta-chave-para-uma-chave-forte-com-pelo-menos-32-caracteres",
		"Issuer": "locacao-universidade-api",
		"Audience": "locacao-universidade-front"
	}
}
```

## Rodando o Backend

```sh
cd backend
dotnet restore
dotnet run
```

API disponível em:

- `http://localhost:5000` (ou porta configurada pelo ASP.NET)
- Endpoints principais sob `/api/*`

## Rodando o Frontend

Defina a URL da API:

```sh
cd frontend
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm install
npm run dev
```

App em `http://localhost:5173`.

## Endpoints principais

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/colaborador/dashboard`
- `POST /api/colaborador/reservas`
- `GET /api/admin/reservas`
- `POST /api/admin/reservas/{id}/enviar-diretoria`
- `POST /api/admin/reservas/{id}/reprovar`
- `GET /api/diretor/reservas`
- `POST /api/diretor/reservas/{id}/aprovar`
- `POST /api/diretor/reservas/{id}/reprovar`
- `GET /api/diretor/locais`
- `POST /api/diretor/locais`
- `PUT /api/diretor/locais/{id}`
- `DELETE /api/diretor/locais/{id}`

## Observações da migração

- O enum de status no schema atual continua: `pendente`, `aprovado`, `rejeitado`.
- O fluxo "enviar para diretoria" foi mantido sem criar novo status no banco.
- O frontend usa JWT armazenado em `localStorage`.
