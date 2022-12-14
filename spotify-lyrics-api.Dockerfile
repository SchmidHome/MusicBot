# pull git repo
FROM alpine/git as clone

WORKDIR /spotify-lyrics-api

RUN git clone https://github.com/akashrchandran/spotify-lyrics-api.git .

# PHP
FROM php:8.1

WORKDIR /var/www/html

RUN echo "error_reporting = ~E_ALL" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini

COPY --from=clone /spotify-lyrics-api /var/www/html

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000"]
