# Nexus · PARABARBEROS SAS
# Sitio estático servido con nginx. Coolify (Traefik) pone el HTTPS: aquí se escucha HTTP en el puerto 80.
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html

# Archivos que no deben quedar publicados
RUN rm -f /usr/share/nginx/html/Dockerfile \
          /usr/share/nginx/html/nginx.conf \
          /usr/share/nginx/html/.dockerignore \
          /usr/share/nginx/html/.gitignore \
          /usr/share/nginx/html/firestore.rules \
          /usr/share/nginx/html/firebase-debug.log \
          /usr/share/nginx/html/CNAME

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1
