FROM php:8.3-cli-alpine
RUN docker-php-ext-install pdo_mysql
WORKDIR /app
COPY livraria/api ./api
EXPOSE 8000
# Servidor embutido do PHP: simples e suficiente para o trabalho acadêmico.
CMD ["php", "-S", "0.0.0.0:8000", "-t", "/app"]
