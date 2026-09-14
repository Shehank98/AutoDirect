#!/bin/sh
set -e

# Railway (and most PaaS) inject the public port in $PORT. Apache defaults to 80,
# so rewrite its listen port and the default virtual host to match.
PORT="${PORT:-80}"

sed -ri "s/^Listen .*/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

# Silence the "could not reliably determine the server's fully qualified domain name" warning.
if ! grep -q "^ServerName" /etc/apache2/apache2.conf; then
    echo "ServerName localhost" >> /etc/apache2/apache2.conf
fi

exec "$@"
