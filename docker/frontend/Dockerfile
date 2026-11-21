# Etapa 1: compila o React (o front usa ../src e ../assets, por isso o contexto é a raiz do projeto).
FROM node:20-alpine AS build
WORKDIR /app/frontend
COPY livraria/frontend/package.json livraria/frontend/package-lock.json ./
RUN npm ci
COPY livraria/frontend ./
COPY livraria/src /app/src
COPY livraria/assets /app/assets
RUN npm run build

# Etapa 2: serve os arquivos estáticos com Nginx.
FROM nginx:1.27-alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html
