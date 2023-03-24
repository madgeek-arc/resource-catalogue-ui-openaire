#!/bin/bash

# Create Nginx configuration
CONF_TMPL=/etc/nginx/nginx.conf.txt
FILE=/etc/nginx/conf.d/site.conf
EMAIL_ARG="--register-unsafely-without-email"
ADD_SERVER_NAME=""

if [ -f "$FILE" ]; then
    echo "Nginx configuration already exists: $FILE "
else
    echo "Creating Nginx configuration: $FILE"

    [ ! -z ${SERVER_NAME+x} ] && export ADD_SERVER_NAME="server_name ${SERVER_NAME}";
    envsubst '${ADD_SERVER_NAME} ${PLATFORM_API_ENDPOINT} ${STATS_API_ENDPOINT}' < $CONF_TMPL > $FILE

    rm /etc/nginx/conf.d/default.conf || echo "File '/etc/nginx/conf.d/default.conf' already deleted. OK"
    nginx -t
    cat $FILE
    nginx -s reload
fi

nginx -g "daemon off;"
