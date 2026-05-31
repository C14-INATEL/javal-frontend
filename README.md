# JAVAL Frontend

Frontend da aplicação JAVAL desenvolvido utilizando **React**, **TypeScript** e **Vite**.

## Tecnologias utilizadas

- React
- TypeScript
- Vite
- Node.js
- npm
- Vitest (testes unitários)

## Testes

O projeto usa **Vitest**. Os testes ficam na pasta `test/` e cobrem funções puras (validação de e-mail, senha, campos obrigatórios e mapeamento do payload de cadastro), sem navegador nem chamadas de rede.

```bash
# rodar todos os testes uma vez
npm run test

# modo observador (reexecuta ao salvar arquivos)
npm run test:watch
```

## Como executar o projeto

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
```

### 2. Entrar na pasta do projeto

```bash
cd javal-frontend
```

### 3. Instalar as dependências

```bash
npm install
```

### 4. Executar o projeto

```bash
npm run dev
```

O projeto estará disponível em:

```
http://localhost:5173
```

## Estrutura inicial do projeto

```
src/
  assets/
  App.tsx
  main.tsx
test/
  … arquivos *.test.ts
```

## Stack Docker (Compose)

O `docker-compose.yml` na raiz agrupa **vários serviços** — cada serviço corre **num container** próprio. É o modelo habitual: um processo principal por container, orquestrados no mesmo ficheiro.

| Serviço | Container | Portas (host) |
|---------|-----------|----------------|
| **frontend** | `javal-frontend-web` | **5174** → site estático (nginx) |
| **jenkins** | `jenkins-javal-frontend` | **9080** → UI Jenkins, **50000** → agentes |

Subir **Jenkins** e **frontend**:

```bash
docker compose build
docker compose up -d
```

**Jenkins e o frontend no mesmo container?** Tecnicamente dá (dois processos com *supervisor*), mas **não é boa prática**: imagens mais pesadas, atualizações misturadas e reinícios mais frágeis. O padrão recomendado é **dois serviços no mesmo Compose**, dois containers.

## Frontend em Docker (produção)

- **`Dockerfile`**: build com Node 20 (`npm run build`) e imagem final **nginx** a servir o `dist/`.
- **`docker/nginx.conf`**: fallback para **SPA** (`try_files` → `index.html`) e **proxy** de `/api-backend/` para `http://host.docker.internal:8080` (Tomcat na tua máquina, igual ao proxy do Vite em dev).

```bash
docker compose build frontend
docker compose up -d frontend
```

Abre **http://localhost:5174**. Só o serviço web: `docker compose up -d frontend` (não precisas do Jenkins a correr).

**Build com API noutro host** (URL absoluta no bundle):

```bash
docker compose build --build-arg VITE_API_BASE_URL=https://api.exemplo.com frontend
```

Se **não** passares o `build-arg`, a imagem usa **`/api-backend`** (igual ao código em dev), para o nginx encaminhar para o Tomcat. Evita `VITE_API_BASE_URL` vazio no build, que fazia o login ir para `/api/...` e o nginx respondia **405**.

**CORS (403 "Invalid CORS request"):** o browser em `http://localhost:5174` envia `Origin: http://localhost:5174`. Muitos backends Spring só permitem `http://localhost:5173` (Vite). O `docker/nginx.conf` reescreve temporariamente o `Origin` para `http://localhost:5173` em pedidos ao proxy — só para desenvolvimento local. Em produção, configura o backend para aceitar a origem real do site (ex.: `https://app.teudominio.com`).

Em Linux, `extra_hosts` com `host-gateway` já está no `docker-compose.yml` para `host.docker.internal` funcionar.

## Jenkins (CI em Docker)

Na **raiz** do projeto: `Dockerfile.jenkins` (imagem com JDK 21, Node 20 e plugins) e `docker-compose.yml`. O pipeline está no `Jenkinsfile`.

```bash
docker compose build
docker compose up -d
```

Interface: **http://localhost:9080** (porta **9080** no PC, porque a **8080** costuma estar ocupada). Se precisares de outra porta, altera `ports` no `docker-compose.yml` (formato `PORTA_PC:8080`). Cria um job **Pipeline** → **Pipeline script from SCM** → aponta para este repositório → **Script Path**: `Jenkinsfile`.

Plugins: só via `RUN jenkins-plugin-cli` no `Dockerfile.jenkins`; depois de alterar, `docker compose build --no-cache`. Para limpar dados do Jenkins: `docker compose down -v`.

## Observações
Este repositório contém apenas o **frontend** da aplicação.
