# build stage
FROM node:20 AS build-stage
ARG CONTAINER_APP_ROOT="/app"
ARG FRONTEND_PORT=3000
WORKDIR ${CONTAINER_APP_ROOT}
RUN npm update npm -g
RUN npm install pnpm -g

# build prod
FROM build-stage AS production
WORKDIR ${CONTAINER_APP_ROOT}
COPY . .
RUN pnpm install -d 
RUN npm run build
CMD ["node", "dist/main.js"]
