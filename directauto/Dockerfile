# DirectAuto Import — legacy PHP (Medoo 1.2 + MySQL) on Apache.
# PHP 7.4 is required: the bundled Medoo 1.2.1 uses the pre-PHP-8 implode($array, $glue)
# argument order in its query builder, which fatals on PHP 8. Upgrading to PHP 8 would
# require upgrading Medoo (an API change) — out of scope for just getting the site live.
FROM php:7.4-apache

# --- Critical database extensions ---------------------------------------------
# pdo_mysql/mysqli compile against libraries already in the base image, so this
# layer needs NO apt packages and can never be broken by a Debian mirror hiccup.
RUN docker-php-ext-install pdo pdo_mysql mysqli \
    && a2enmod rewrite

# mod_php requires the prefork MPM. Apache fails to start with "More than one
# MPM loaded" if more than one is enabled, so wipe ALL mpm_* symlinks from
# mods-enabled and re-enable only prefork — deterministic regardless of what the
# base image left enabled.
RUN rm -f /etc/apache2/mods-enabled/mpm_*.load /etc/apache2/mods-enabled/mpm_*.conf \
    && a2enmod mpm_prefork \
    && echo "--- MPM modules now enabled: ---" \
    && ls -1 /etc/apache2/mods-enabled/ | grep mpm

# --- GD (for timthumb.php thumbnails) — best effort ---------------------------
# The php:7.4 base runs on Debian bullseye. During Debian point-release rotations
# a single package can briefly 404 on the mirror. We retry a few times; if the
# image libs still can't be fetched, we SKIP GD instead of failing the whole build
# (the site still runs — only on-the-fly thumbnail resizing via timthumb is lost).
RUN set -eu; \
    ok=0; \
    for i in 1 2 3 4; do \
        if apt-get update && apt-get install -y --no-install-recommends \
                libpng-dev libjpeg-dev libfreetype6-dev; then ok=1; break; fi; \
        echo ">> apt attempt $i failed (likely a transient mirror rotation), retrying..."; \
        sleep 20; \
    done; \
    if [ "$ok" = "1" ]; then \
        docker-php-ext-configure gd --with-freetype --with-jpeg; \
        docker-php-ext-install -j"$(nproc)" gd; \
    else \
        echo ">> WARNING: could not install GD image libraries; building without GD."; \
        echo ">>          The site runs fine; timthumb thumbnails will be disabled."; \
    fi; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*

# --- PHP runtime tuning (vehicle-image uploads in the admin panel) ------------
RUN { \
        echo 'upload_max_filesize = 20M'; \
        echo 'post_max_size = 25M'; \
        echo 'memory_limit = 256M'; \
        echo 'max_execution_time = 120'; \
    } > /usr/local/etc/php/conf.d/directauto.ini

# --- Application --------------------------------------------------------------
COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html

# Allow .htaccess overrides (our-stock/ and live-auction/ rely on mod_rewrite).
RUN sed -ri 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Railway provides the port via $PORT; Apache is switched to it at startup.
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]
