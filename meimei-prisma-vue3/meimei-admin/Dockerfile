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
# ENV DATABASE_URL=mysql://root:123456@database:3306/meimei-prisma?connection_limit=20&pool_timeout=0
# RUN npm run db:m
# CMD ["node", "dist/main.js"]
CMD ["sh", "-c", "npm run start:prod"] 
