# ⚙️ JAVAL — Frontend

> Interface web do Sistema de Gestão de Produção Industrial, desenvolvida em **React + TypeScript + Vite**.

💡 Este repositório contém apenas o **frontend** da aplicação. O backend desenvolvido em Java + Spring Boot está disponível em [C14-INATEL/javal-backend](https://github.com/C14-INATEL/javal-backend).

---

## 📋 Sobre o Projeto

O **JAVAL** é um sistema de gestão e monitoramento de linhas de produção industrial. A interface permite que operadores e gestores acompanhem em tempo real o estado da produção, gerenciem máquinas, ordens e falhas — tudo em um painel centralizado.

Funcionalidades disponíveis no frontend:

- Autenticação de empresas (login e cadastro)
- Dashboard com visão geral da produção
- Gerenciamento de máquinas
- Controle de ordens de produção
- Monitoramento de status e gargalos
- Rastreamento de falhas
- Gestão de produtos

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso |
|---|---|
| React 19 | Biblioteca de UI |
| TypeScript | Tipagem estática |
| Vite | Bundler e dev server |
| React Router DOM | Navegação SPA |
| Axios | Requisições HTTP |
| Tailwind CSS | Estilização |
| Vitest | Testes unitários |
| ESLint | Qualidade de código |
| Docker + Nginx | Deploy em container |
| Jenkins | Pipeline CI/CD |

---

## ⚡ Como Executar

### Pré-requisitos

- Node.js 20+
- npm

### 1. Clonar o repositório

```bash
git clone https://github.com/C14-INATEL/javal-frontend.git
cd javal-frontend
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Executar em modo desenvolvimento

```bash
npm run dev
```

Acesse: **http://localhost:5173**

> O backend deve estar rodando em `http://localhost:8080/javal` para as chamadas de API funcionarem.

---

## 🧪 Testes

O projeto utiliza **Vitest**. Os testes ficam na pasta `test/` e cobrem funções puras: validação de e-mail, senha, campos obrigatórios e mapeamento de payload de cadastro — sem navegador nem chamadas de rede.

```bash
# Rodar todos os testes
npm run test

# Modo observador (reexecuta ao salvar)
npm run test:watch
```

O pipeline Jenkins gera automaticamente um relatório de testes em `test-results.xml` e o publica na interface do Jenkins após cada build.

---

## 🐳 Stack Docker

O `docker-compose.yml` na raiz orquestra dois serviços:

| Serviço | Container | Porta |
|---|---|---|
| **frontend** | `javal-frontend-web` | `5174` → site estático (Nginx) |
| **jenkins** | `jenkins-javal-frontend` | `9080` → UI Jenkins |

### Subir tudo

```bash
docker compose build
docker compose up -d
```

### Só o frontend

```bash
docker compose up -d frontend
```

Acesse: **http://localhost:5174**

### Build com URL de API externa

```bash
docker compose build --build-arg VITE_API_BASE_URL=https://api.exemplo.com frontend
```

> Se `VITE_API_BASE_URL` não for passado, o bundle usa URLs relativas `/api/...` e o Nginx faz o proxy para `http://host.docker.internal:8080`.

---

## 🔁 CI/CD — Jenkins

O pipeline está definido no `Jenkinsfile` na raiz do projeto e é executado a cada push no repositório.

### Stages do pipeline

| Stage | O que faz |
|---|---|
| Checkout SCM | Clona o repositório |
| Instalar dependências | `npm ci` |
| ESLint | Verifica qualidade do código |
| Testes (Vitest) | Roda os 44 testes unitários e publica relatório |
| Build (TypeScript + Vite) | Compila e gera o `/dist` |
| Build Docker | Gera a imagem `javal-frontend:prod` |

### Como configurar o job

1. Acesse **http://localhost:9080**
2. Crie um job **Pipeline → Pipeline script from SCM**
3. Aponte para este repositório
4. **Script Path**: `Jenkinsfile`

---

## 📁 Estrutura do Projeto

```
javal-frontend/
├── docker/
│   └── nginx.conf          # Configuração Nginx (SPA + proxy API)
├── src/
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/              # Telas da aplicação
│   ├── services/           # Chamadas de API (axios)
│   ├── contexts/           # Estado global
│   └── lib/                # Configuração axios, utilitários, formatters
├── test/                   # Testes unitários (Vitest)
├── Dockerfile              # Build + Nginx para produção
├── Dockerfile.jenkins      # Imagem Jenkins customizada
├── docker-compose.yml      # Orquestração dos containers
└── Jenkinsfile             # Pipeline CI/CD
```

---

## 👥 Integrantes

| Nome | GitHub | Contribuição principal |
|---|---|---|
| Leticia Luane Moraes | [@LeticialMoraes](https://github.com/LeticialMoraes) | Desenvolvimento completo do frontend, pipeline Jenkins, infraestrutura Docker |

---

## 🗂️ Metodologia de Desenvolvimento

O projeto adotou **Kanban** como metodologia de desenvolvimento. A escolha foi motivada pela natureza individual do repositório frontend: sem sprints fixos ou cerimônias, o progresso era contínuo e as tarefas avançavam conforme o desenvolvimento de cada funcionalidade.

### Fluxo de Trabalho

O GitHub foi utilizado como principal ferramenta de acompanhamento das atividades. Cada funcionalidade era registrada por meio de issues e desenvolvida em uma branch específica, permitindo rastreabilidade entre requisitos, implementação e validação.

De forma geral, as tarefas percorriam o seguinte fluxo:

Issue criada → Desenvolvimento em branch de funcionalidade → Abertura de Pull Request → Execução de testes e validação → Merge na branch main

Esse processo permitiu acompanhar a evolução do projeto de forma organizada, garantindo que cada entrega passasse por validação antes de ser incorporada ao código principal.

### Papéis e Responsabilidades

| Integrante | Contribuição |
|---|---|
| Leticia Luane Moraes | Desenvolvimento completo do frontend, pipeline CI/CD, infraestrutura Docker |

### Ferramentas e Cadência

- **Comunicação:** WhatsApp para alinhamentos com o time de backend
- **Versionamento:** GitHub com branches por funcionalidade e PRs obrigatórios para merge na `main`
- **Gestão de tarefas:** GitHub Projects com issues vinculadas às histórias de usuário
- **CI/CD:** Jenkins rodando em Docker com pipeline automatizado a cada push

### Definição de Pronto (DoD)

Uma funcionalidade era considerada pronta quando:

- O código estava commitado com mensagem descritiva seguindo Conventional Commits
- Um Pull Request foi aberto e revisado antes do merge
- Os testes relevantes ao domínio estavam passando
- O pipeline Jenkins estava verde (lint + testes + build + docker)

### Métricas do Projeto

| Métrica | Valor |
|---|---|
| Pull Requests mergeados | 19 |
| Commits | 50+ |
| Testes unitários | 44 (8 suítes) |
| Stages no pipeline CI/CD | 6 |
| Histórias de usuário entregues | 5 de 5 |

---

## 🔄 Dinâmica de Desenvolvimento

### Como as tarefas foram divididas

As funcionalidades foram desenvolvidas de forma sequencial, priorizando o fluxo principal da aplicação: autenticação → dashboard → máquinas → ordens → produtos. Cada funcionalidade gerou suas próprias issues, testes e PRs rastreáveis no GitHub.

### Fluxo de branches e commits

O fluxo adotado foi simples e direto:

```
branch de funcionalidade → commit → Pull Request → merge na main
```

Conventional Commits foram adotados desde o início (`feat:`, `fix:`, `refactor:`, `ci:`, `test:`, `docs:`), o que facilita a leitura do histórico e a rastreabilidade entre commits e histórias de usuário.

### Principal desafio

O maior bloqueio foi a configuração da infraestrutura de CI/CD com Jenkins em Docker. Os principais problemas enfrentados foram:

- **Senha inicial perdida:** o setup wizard do Jenkins havia sido concluído anteriormente sem persistência de volume, exigindo reset manual da segurança via `config.xml`
- **Permissão negada no Docker socket:** o container do Jenkins não tinha acesso ao `/var/run/docker.sock` do host, impedindo o stage de Build Docker. Resolvido com `group_add: ["0"]` no `docker-compose.yml`
- **Docker CLI ausente:** a imagem base do Jenkins não incluía o Docker CLI, exigindo instalação manual no `Dockerfile.jenkins`

### Lições aprendidas

- **Configurar o Jenkins antes de começar o pipeline:** o setup da infraestrutura consumiu mais tempo do que o esperado. Ter o ambiente pronto antes de escrever o `Jenkinsfile` teria acelerado o desenvolvimento
- **Mapear volumes do Docker desde o início:** a falta do volume `jenkins-data` no início causou perda de configurações e plugins, gerando retrabalho
- **Testar permissões do `docker.sock` antes do primeiro build:** o problema de permissão só foi descoberto ao rodar o pipeline, atrasando a entrega do stage de Build Docker
- **Padronizar commits desde o dia 1:** adotar Conventional Commits desde o início facilita a geração de changelogs e a rastreabilidade entre código e histórias de usuário

---

## 📖 Histórias de Usuário

### US-01 — Login Funcional
**Prioridade:** Alta | **Status:** Entregue
**Rastreabilidade:** PR [#22](https://github.com/C14-INATEL/javal-frontend/pull/22) → Testes: `auth.test.ts`

Como gerente de produção, eu quero fazer login com meu email e senha, para que eu possa acessar o sistema de gestão da fábrica com segurança.

**Cenário 1 — Login com sucesso**
- Given que tenho uma conta cadastrada no sistema
- When preencho email e senha corretos e clico em "Entrar"
- Then sou redirecionado para /dashboard
- And meus dados de empresa ficam salvos na sessão

**Cenário 2 — Credenciais inválidas**
- Given que tenho uma conta cadastrada
- When preencho email ou senha incorretos e clico em "Entrar"
- Then vejo uma mensagem de erro no formulário
- And permaneço na tela de login

**Cenário 3 — Logout**
- Given que estou autenticado no sistema
- When clico em "Sair"
- Then sou redirecionado para /login
- And meus dados de sessão são removidos

---

### US-02 — Gerenciamento de Máquinas
**Prioridade:** Alta | **Status:** Entregue
**Rastreabilidade:** PR [#10](https://github.com/C14-INATEL/javal-frontend/pull/10) [#19](https://github.com/C14-INATEL/javal-frontend/pull/19) [#25](https://github.com/C14-INATEL/javal-frontend/pull/25) [#47](https://github.com/C14-INATEL/javal-frontend/pull/47) → Testes: `machines.test.tsx`, `falhas.test.ts`

Como gerente de produção, eu quero gerenciar as máquinas da fábrica em uma tela administrativa para que eu possa acompanhar o status dos equipamentos e registrar falhas rapidamente.

**Cenário 1 — Visualização da lista**
- Given que existem máquinas cadastradas
- When acesso a página /machines
- Then devo visualizar a tabela com nome, tipo, status e capacidade/hora

**Cenário 2 — Cadastro**
- Given que estou na página /machines
- When clico em "Nova Máquina"
- Then sou redirecionado para a tela de cadastro
- And ao preencher e confirmar, volto para /machines com a máquina na tabela

**Cenário 3 — Registrar Falha**
- Given que uma máquina com status "Ativa" está listada na tabela
- When clico em "Registrar Falha" nessa máquina
- Then o status dela deve mudar para "MANUTENÇÃO"
- And a alteração deve ser refletida na tabela sem recarregar a página

---

### US-03 — Dashboard Principal
**Prioridade:** Alta | **Status:** Entregue
**Rastreabilidade:** PR [#40](https://github.com/C14-INATEL/javal-frontend/pull/40) → Testes: `dashboard.test.ts`

Como gerente de produção, eu quero ver um resumo da operação ao entrar no sistema, para que eu possa ter uma visão rápida do status da fábrica sem precisar navegar entre telas.

**Cenário 1 — Visualização dos cards de resumo**
- Given que estou autenticado e acesso /dashboard
- When a página carrega
- Then vejo cards com total de máquinas, ordens abertas e eficiência média

**Cenário 2 — Visualização das últimas ordens**
- Given que existem ordens de produção cadastradas
- When acesso /dashboard
- Then vejo uma tabela com as últimas ordens
- And consigo identificar o status de cada uma

**Cenário 3 — Usuário não autenticado**
- Given que não estou autenticado
- When tento acessar /dashboard diretamente pela URL
- Then sou redirecionado para /login

---

### US-04 — Tela de Ordens de Produção
**Prioridade:** Alta | **Status:** Entregue
**Rastreabilidade:** PR [#32](https://github.com/C14-INATEL/javal-frontend/pull/32) → Testes: `orders.test.ts`

Como gerente de produção, eu quero criar e acompanhar ordens de produção com avanço de status, para que eu possa controlar o fluxo de produção em tempo real.

**Cenário 1 — Visualização das ordens**
- Given que existem ordens cadastradas
- When acesso /orders
- Then vejo a listagem com badge de status colorido por StatusOrdem
- And consigo filtrar as ordens por status

**Cenário 2 — Criar nova ordem**
- Given que estou em /orders
- When preencho o formulário com produto, máquina e quantidade e confirmo
- Then a ordem aparece na listagem com status PENDENTE

**Cenário 3 — Avançar status da ordem**
- Given que existe uma ordem PENDENTE na listagem
- When clico em "Iniciar Produção"
- Then o status muda para EM_PRODUCAO
- And o botão muda para "Finalizar"

**Cenário 4 — Cancelar ordem**
- Given que existe uma ordem PENDENTE ou EM_PRODUCAO
- When clico em "Cancelar"
- Then o status muda para CANCELADA
- And a ordem permanece na listagem com badge correspondente

---

### US-05 — Tela de Produtos
**Prioridade:** Média | **Status:** Entregue
**Rastreabilidade:** PR [#31](https://github.com/C14-INATEL/javal-frontend/pull/31) → Testes: `produtos.test.ts`

Como gerente de produção, eu quero gerenciar o catálogo de produtos da fábrica, para que eu possa manter a base de dados atualizada e disponível para as ordens de produção.

**Cenário 1 — Visualização do catálogo**
- Given que existem produtos cadastrados
- When acesso /products
- Then vejo a tabela com nome e tempo de produção unitário de cada produto

**Cenário 2 — Adicionar produto**
- Given que estou em /products
- When preencho o formulário com nome e tempo de produção unitário e confirmo
- Then o produto aparece na tabela sem recarregar a página

**Cenário 3 — Remover produto sem ordens abertas**
- Given que o produto não possui ordens abertas
- When clico em remover e confirmo a ação
- Then o produto é removido da tabela

**Cenário 4 — Remover produto com ordens abertas**
- Given que o produto possui ordens com status PENDENTE ou EM_PRODUCAO
- When clico em remover
- Then vejo uma mensagem impedindo a remoção
- And o produto permanece na tabela

---

## 🔧 Refactoring

Ao longo do projeto foram identificados e corrigidos quatro _code smells_, todos documentados com commits rastreáveis e verificados com os 43 testes passando antes e depois de cada alteração.

Os **tipos de refactoring** do catálogo de Fowler aplicados foram:

| # | Mudança | Tipo (Fowler) |
|---|---------|---------------|
| 1 | `OrderStatusBadge` — rótulo de status direto no JSX | **Inline Function** |
| 2 | `src/components/icons.tsx` — ícones SVG compartilhados | **Extract Class** |
| 3 | `src/components/StatCard.tsx` — card de estatística reutilizável | **Extract Class** |
| 4 | `src/lib/formatters.ts` — `formatDateTime` única para pedidos e falhas | **Extract Method** + **Move Method** |

---

### 1. Inline Function — `OrderStatusBadge`
**Commit:** `refactor: inline de getStatusOrdemLabel no OrderStatusBadge`
**Tipo (Fowler):** Inline Function

A função `getStatusOrdemLabel` foi removida e seu conteúdo aplicado diretamente no JSX do componente.

**Motivação:** a função atuava apenas como intermediária sem adicionar lógica. Sua presença no mesmo arquivo violava a regra `react-refresh/only-export-components` do ESLint, que exige que arquivos de componentes exportem apenas componentes React. A remoção eliminou o acoplamento desnecessário e corrigiu a violação sem perda de legibilidade.

---

### 2. Extract Class — Ícones SVG compartilhados (`icons.tsx`)
**PR:** [refactoring](https://github.com/C14-INATEL/javal-frontend/pull/49)
**Tipo (Fowler):** Extract Class

`AlertIcon` estava definido localmente e de forma idêntica em 5 arquivos (`Dashboard.tsx`, `Falhas.tsx`, `Orders.tsx`, `MachinesList.tsx`, `ProductsList.tsx`). `SearchIcon` duplicado em 3 arquivos. `ClipboardIcon` e `PackageIcon` definidos localmente sem possibilidade de reúso.

**Solução:** todos os ícones foram extraídos para `src/components/icons.tsx` e importados onde necessário.

**Motivação:** DRY — qualquer alteração visual nos ícones agora exige mudança em um único lugar. Comportamento externo inalterado (43/43 testes ok).

---

### 3. Extract Class — Componente de estatística (`StatCard.tsx`)
**PR:** [refactoring](https://github.com/C14-INATEL/javal-frontend/pull/49)
**Tipo (Fowler):** Extract Class

`StatCard` estava definido com implementação idêntica em `MachinesList.tsx` e `ProductsList.tsx`.

**Solução:** componente extraído para `src/components/StatCard.tsx` e importado nos dois arquivos.

**Motivação:** DRY — ajustes visuais no card (padding, fonte, sombra) agora exigem alteração em um único lugar. Comportamento externo inalterado (43/43 testes ok).

---

### 4. Extract Method + Move Method — Formatação de data (`formatters.ts`)
**PR:** [refactoring](https://github.com/C14-INATEL/javal-frontend/pull/49)
**Tipo (Fowler):** Extract Method + Move Method

`formatDateTime` (em `Orders.tsx`) e `formatDataHora` (em `Falhas.tsx`) tinham implementação idêntica com nomes diferentes — duplicação de código e inconsistência de nomenclatura.

**Solução:** função extraída para `src/lib/formatters.ts` com nome único `formatDateTime` e importada nos dois arquivos.

**Motivação:** DRY + consistência de nomenclatura. Formato de data centralizado — qualquer mudança de locale ou formato exige alteração em um único lugar. Comportamento externo inalterado (43/43 testes ok).

---

## 🤖 Uso de IA

O desenvolvimento contou com o apoio de ferramentas de IA de forma transparente. Todo código gerado foi revisado, testado e adaptado antes de ser integrado ao projeto.

### Modelos utilizados

| Modelo | Ferramenta |
|---|---|
| Claude (Anthropic) | Interface web claude.ai |
| Cursor AI | Editor com IA integrada |

### Para que foram usados

- **Claude:** debugging e resolução de erros no pipeline Jenkins, orientação sobre configuração do Docker (volumes, permissões, `docker.sock`), refactoring do `OrderStatusBadge`, identificação de _code smells_, listagem de oportunidades adicionais de refactoring no frontend e orientação sobre os refactorings de `icons.tsx`, `StatCard.tsx` e `formatters.ts`
- **Cursor:** melhorias de layout e estilização dos componentes frontend

### Exemplos reais de prompts utilizados

**Prompt 1 — Debugging de permissão no Docker (Claude)**

> "estou com o seguinte erro e não estou conseguindo corrigir: `permission denied while trying to connect to the docker API at unix:///var/run/docker.sock`"

Resposta aceita com ajuste: a IA sugeriu adicionar `groupadd -f docker && usermod -aG docker jenkins` no `Dockerfile.jenkins`, resolvendo parcialmente. A desenvolvedora identificou que a solução não era permanente e questionou a abordagem correta.

**Prompt 2 — Solução permanente via docker-compose (Claude)**

> "eu não tinha que fazer isso no compose? `group_add: - "0"`"

Resposta aceita: a IA confirmou que sim, era a abordagem correta e mais elegante — adicionar `group_add: ["0"]` no serviço Jenkins do `docker-compose.yml` resolve permanentemente sem precisar rebuildar a imagem.

**Prompt 3 — Refactoring do ESLint (Claude)**

> "esse é o erro: Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components"

Resposta aceita: a IA identificou que a função `getStatusOrdemLabel` deveria ser removida e o `STATUS_LABELS[status]` usado diretamente no JSX. O commit foi classificado corretamente como `refactor: inline function` (Martin Fowler).

**Prompt 4 — Melhoria de layout e criação do AuthLayout (Cursor)**

>"a gente consegue colocar esse ícone @src/assets/conveyor.png nas páginas e deixar um layout mais bonito e moderno?"

Resposta aceita: o Cursor criou o componente `AuthLayout` com layout em duas colunas reutilizável — painel escuro com gradiente, brilhos âmbar/ciano e o ícone conveyor.png em destaque à esquerda; card branco com formulário à direita. As páginas `/login, /register e /machines` foram atualizadas com o novo visual. A solução foi aceita após revisão pelo grupo.

**Prompt 5 — Oportunidades adicionais de refactoring no frontend (Claude)**

> "vc acha que no meu frontend da pra aplicar mais algum outro conceito de refactoring?"

Resposta aceita: a IA inspecionou o código do repositório e apontou **três** oportunidades reais, com esforço e impacto diferentes:

1. **Ícones SVG duplicados** — `AlertIcon` (e outros) copiados de forma idêntica em vários arquivos; o smell mais evidente, porém mais trabalhoso de unificar.
2. **`StatCard` duplicado** — exemplo clássico de _Extract Component_, simples de implementar e de documentar no README.
3. **Formatação de data duplicada** — funções equivalentes em páginas distintas; o ajuste mais rápido (extrair para um módulo e corrigir imports), com commit bem justificável.

O grupo **implementou as três sugestões** no PR de refactoring (`icons.tsx`, `StatCard.tsx`, `formatters.ts`).

### Dinâmica de uso

A IA foi utilizada de forma interativa durante sessões de desenvolvimento, principalmente para resolução de erros de configuração de infraestrutura (Docker, Jenkins), orientação sobre boas práticas de refactoring e identificação de _code smells_ no código existente. O Cursor foi usado individualmente para melhorias visuais nos componentes.

### O que não foi feito por IA

- Arquitetura de componentes e estrutura de pastas
- Lógica de negócio das chamadas de API (`src/services/`)
- Definição de quais testes eram relevantes ao domínio
- Configuração do `nginx.conf` e do proxy de desenvolvimento
- Decisão sobre as tecnologias utilizadas no projeto

---

## 📄 Licença

Este projeto está sob uso acadêmico — INATEL © 2025.
