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

## Observações
Este repositório contém apenas o **frontend** da aplicação.  