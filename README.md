# 🏠 Apto Frontend

[![Backend: apto-api](https://img.shields.io/badge/backend-apto--api-blue)](https://github.com/cascaessama/apto-api)
[![Stack](https://img.shields.io/badge/stack-React%20%7C%20TypeScript%20%7C%20Vite-6366f1)](#)

Interface web do projeto Apto, construída com React + TypeScript + Vite.

## ✅ Requisitos

- Node.js 20+
- Backend obrigatório: [apto-api](https://github.com/cascaessama/apto-api)

Este frontend depende do backend para autenticação, cadastro, listagem de apartamentos e demais funcionalidades. Inicie o backend antes de executar o frontend.

## 🚀 Como rodar

1. Instale dependências
2. Execute em modo desenvolvimento

### 📦 Instalação de dependências

Na raiz do projeto, instale as dependências com uma das opções abaixo:

- Recomendado (instalação limpa): `npm ci`
- Alternativa: `npm install`

Após instalar, siga com `npm run dev` para iniciar o frontend.

### 🧪 Comandos principais

- `npm ci`
- `npm run dev`
- `npm run build`
- `npm run preview`

## 🐳 Docker (imagem)

Este projeto já inclui um `Dockerfile` e `nginx.conf` para gerar uma imagem pronta para produção.

### 🔧 Build da imagem

Na raiz do projeto:

```
docker build -t apto-frontend:latest .
```

### ▶️ Executar a imagem

O Nginx expõe a aplicação na porta 80 do container. Mapeie para a porta local desejada:

```
docker run --rm -p 5173:80 apto-frontend:latest
```

Acesse: http://localhost:5173

### 🔌 Integração com o backend

O proxy do Nginx está configurado para encaminhar chamadas para `/api/` em:

```
http://host.docker.internal:3010
```

Certifique-se de que o backend esteja rodando nessa porta no host antes de iniciar o container.

## 🧭 Estrutura do projeto

Principais pastas e arquivos:

- `src/`: código-fonte do frontend
	- `App.tsx`: componente raiz da aplicação
	- `main.tsx`: ponto de entrada
	- `assets/`: imagens e recursos estáticos
- `public/`: arquivos públicos servidos pelo Vite
- `index.html`: template base da aplicação
- `vite.config.ts`: configuração do Vite
- `tsconfig*.json`: configurações do TypeScript
- `nginx.conf` e `Dockerfile`: empacotamento e deploy com Nginx/Docker

## 🔌 Backend

Repositório do backend: [https://github.com/cascaessama/apto-api](https://github.com/cascaessama/apto-api)

Consulte a documentação do backend para instalação, configuração e execução.
