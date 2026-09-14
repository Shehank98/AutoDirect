# DirectAuto Import — legacy PHP (Medoo 1.2 + MySQL) on Apache.
# PHP 7.4 is used because the codebase (2018–2021) and Medoo 1.2 predate PHP 8.
FROM php:7.4-apache

# System libs needed for the GD image extension (used by timthumb.php for thumbnails).
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libpng-dev libjpeg-dev libfreetype6-dev libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" gd pdo pdo_mysql mysqli \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Enable .htaccess rewrites (our-stock/ and live-auction/ rely on mod_rewrite).
RUN a2enmod rewrite

# Reasonable upload limits for the vehicle-image uploads in the admin panel.
RUN { \
        echo 'upload_max_filesize = 20M'; \
        echo 'post_max_size = 25M'; \
        echo 'memory_limit = 256M'; \
        echo 'max_execution_time = 120'; \
    } > /usr/local/etc/php/conf.d/directauto.ini

# Copy the application.
COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html

# Allow .htaccess overrides in the document root.
RUN sed -ri 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Railway provides the port to listen on via $PORT. Apache is switched to it at startup.
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]
