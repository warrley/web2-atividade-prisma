# Atividade: Web API com Node, Express, Prisma, PostgreSQL, Docker e GitHub Actions

Projeto desenvolvido para a disciplina de **Desenvolvimento de Software para Web** (UFC / Quixadá).

---

## 🎯 Objetivos da Atividade

1. **Aplicação Web:** Node.js, Express, TypeScript, Prisma ORM e PostgreSQL (CRUD de Usuários similar aos exercícios anteriores).
2. **Containerização:** Criação de `Dockerfile` multi-stage e `docker-compose.yml`.
3. **GitHub Actions:** Pipeline automatizada de CI que sobe um serviço de PostgreSQL temporário no runner e testa:
   - **Estrutura do banco:** Execução do `npx prisma migrate deploy` para aplicar as migrations.
   - **Dados do banco:** Execução do `npx prisma db seed` para inserir e validar dados iniciais.
   - **Testes da API e Banco:** Execução de testes de integração via `npm test`.
   - **Imagem Docker:** Build da imagem Docker da aplicação.
4. **Variáveis de Ambiente:** Cadastro e uso de secrets/variáveis no GitHub.

---

## 🛠️ Tecnologias Utilizadas

- **Node.js** (v20+) & **TypeScript**
- **Express 5**
- **Prisma ORM** (v6)
- **PostgreSQL 16**
- **Docker** & **Docker Compose**
- **GitHub Actions** (CI/CD)
- **Supertest** (Testes de integração)

---

## 📁 Estrutura do Projeto

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml               # Pipeline do GitHub Actions
├── prisma/
│   ├── migrations/              # Migrações versionadas do Prisma
│   │   └── 20250101000000_init/
│   │       └── migration.sql
│   ├── schema.prisma            # Modelagem do banco (User)
│   └── seed.ts                  # Povoamento de dados iniciais
├── src/
│   ├── config/
│   │   └── prisma.ts            # Instância singleton do PrismaClient
│   ├── controllers/
│   │   └── userController.ts    # Controladores CRUD (User)
│   ├── routes/
│   │   └── userRoutes.ts        # Rotas /api/users
│   ├── app.ts                   # Configuração do Express e health check
│   └── server.ts                # Inicialização do servidor HTTP
├── test/
│   └── migration-test.ts        # Testes de validação de migrations, dados e API
├── Dockerfile                   # Dockerfile multi-stage otimizado
├── docker-compose.yml           # Orquestração local (App + PostgreSQL)
├── .dockerignore
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🌐 Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Health check da API e conexão com o banco |
| `GET` | `/api/users` | Lista todos os usuários cadastrados |
| `GET` | `/api/users/:id` | Retorna um usuário por ID |
| `POST` | `/api/users` | Cria um novo usuário (`{ name, email, age }`) |
| `PUT` | `/api/users/:id` | Atualização completa do usuário |
| `PATCH` | `/api/users/:id` | Atualização parcial do usuário |
| `DELETE` | `/api/users/:id` | Remove um usuário |

---

## 🚀 Como Executar Localmente

### Opção 1: Usando Docker Compose (Recomendado)

Suba a aplicação e o banco com um único comando:

```bash
docker compose up --build
```

A API estará disponível em `http://localhost:3000`. O PostgreSQL será exposto na porta `5433` do host (para evitar conflito com portas padrões).

Para aplicar as migrations e rodar o seed dentro do container ou na máquina local:

```bash
# Na máquina local (com o compose rodando):
npm run prisma:migrate
npm run prisma:seed
```

### Opção 2: Desenvolvimento Local com Node.js

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure seu arquivo `.env` (baseie-se no `.env.example`):
   ```env
   PORT=3000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/web2_db?schema=public"
   ```

3. Execute as migrações e o seed:
   ```bash
   npx prisma migrate deploy
   npm run prisma:seed
   ```

4. Inicie o servidor em modo desenvolvimento:
   ```bash
   npm run dev
   ```

5. Para rodar a suite de testes:
   ```bash
   npm test
   ```

---

## ⚙️ Variáveis de Ambiente no GitHub

Para atender ao requisito **"Cadastrar variáveis de ambiente no Github"**, cadastre as seguintes variáveis e secrets no repositório:

No GitHub: Acesse seu repositório ➔ **Settings** ➔ **Secrets and variables** ➔ **Actions**:

### 1. Repository Secrets (Aba *Secrets*):
- `DB_PASSWORD`: Senha do PostgreSQL (ex: `postgres` ou sua senha segura).
- `DATABASE_URL` *(Opcional)*: URL completa de conexão caso prefira passar a string direta. Exemplo: `postgresql://postgres:postgres@localhost:5432/web2_db?schema=public`.

### 2. Repository Variables (Aba *Variables*):
- `DB_USER`: Usuário do banco (ex: `postgres`).
- `DB_NAME`: Nome do banco de dados (ex: `web2_db`).
- `PORT`: Porta da aplicação (ex: `3000`).

> **Nota de Resiliência:** A pipeline do GitHub Actions possui *fallbacks* inteligentes. Se nenhuma secret for cadastrada, ela usará os valores padrão compatíveis com o container de serviço PostgreSQL do workflow.

---

## 🔄 Como Funciona a Pipeline no GitHub Actions

O arquivo `.github/workflows/ci.yml` realiza o ciclo completo:

1. **Service Container:** Inicializa um container `postgres:16-alpine` exclusivo durante a execução do job.
2. **Setup:** Faz checkout do código, instala as dependências via `npm ci` e gera o Prisma Client.
3. **Validação de Estrutura (Migrations):** Executa `npx prisma migrate deploy` aplicando as tabelas e índices.
4. **Validação de Dados (Seed):** Executa `npx prisma db seed`, populando o banco com usuários iniciais.
5. **Testes Automatizados:** O script `test/migration-test.ts` verifica:
   - A existência das colunas na tabela `users`;
   - A integridade dos dados inseridos;
   - As operações CRUD (Create, Read, Update, Delete) com Prisma;
   - O funcionamento dos endpoints Express `/health` e `/api/users`.
6. **Build TypeScript:** Compila para a pasta `dist`.
7. **Build Docker:** Cria a imagem Docker da aplicação validando o `Dockerfile`.
