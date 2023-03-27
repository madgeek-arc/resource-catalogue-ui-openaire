#!/bin/bash

## Init vars
CONF_TMPL=/etc/nginx/nginx.conf.txt
PROXY_CONF_FILE=/etc/nginx/conf.d/site.conf
EMAIL_ARG="--register-unsafely-without-email"
ADD_SERVER_NAME=""
PROXY_API=""

# do not forget to escape proxy vars (else envsubst removes them)
read -r -d '' PROXY_API_CONF << EOM
    location ^~ /api {
         proxy_set_header        Host \$host;
         proxy_set_header        X-Real-IP \$remote_addr;
         proxy_set_header        X-Forwarded-For \$proxy_add_x_forwarded_for;
         proxy_set_header        X-Forwarded-Proto \$scheme;
         proxy_pass              ${PROXY_API_ENDPOINT};
         proxy_read_timeout      300;
         proxy_send_timeout      300;
         client_max_body_size    200M;
    }
EOM


## Create Nginx configuration ##
if [ -f "$PROXY_CONF_FILE" ]; then
    echo "Nginx configuration already exists: $PROXY_CONF_FILE "
else
    echo "Creating Nginx configuration: $PROXY_CONF_FILE"

    [ ! -z ${SERVER_NAME+x} ] && export ADD_SERVER_NAME="server_name ${SERVER_NAME}";
    [ ! -z ${PROXY_API_ENDPOINT+x} ] && export PROXY_API=$(echo "$PROXY_API_CONF");
    envsubst '${ADD_SERVER_NAME} ${PROXY_API}' < $CONF_TMPL > $PROXY_CONF_FILE

    rm /etc/nginx/conf.d/default.conf || echo "File '/etc/nginx/conf.d/default.conf' already deleted. OK"
    nginx -t
    cat $PROXY_CONF_FILE
    nginx -s reload
fi

nginx -g "daemon off;"
