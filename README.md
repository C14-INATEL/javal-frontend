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