# ---- 1. Build Stage ----
FROM node:18-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo herramientas para módulos nativos)
RUN apk add --no-cache python3 make g++ && \
    npm install

# Copiar todo el código fuente
COPY . .

# ---- 2. Production Stage ----
FROM node:18-alpine AS production

WORKDIR /app

# Copiar node_modules desde build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

# Copiar código fuente necesario
COPY --from=build /app/src ./src
COPY --from=build /app/config ./config

# Copiar .sequelizerc solo si existe (usando RUN en vez de COPY)
RUN --mount=type=bind,from=build,source=/app,target=/build \
    if [ -f /build/.sequelizerc ]; then \
        cp /build/.sequelizerc ./; \
    fi

# Exponer puerto
EXPOSE 3000

# Variable de entorno
ENV NODE_ENV=production

# Comando de inicio
CMD ["node", "src/server.js"]