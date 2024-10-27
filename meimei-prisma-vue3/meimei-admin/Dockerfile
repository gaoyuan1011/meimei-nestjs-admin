# build stage
FROM node:20 AS base
ARG CONTAINER_APP_ROOT="/app"
ARG FRONTEND_PORT=3000
WORKDIR ${CONTAINER_APP_ROOT}
RUN npm update npm -g
ENV LANG=en_US.UTF-8
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] https://dl-ssl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 dbus dbus-x11 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

FROM base AS node
USER root
RUN npm install -g pnpm

# build prod
FROM node AS production
WORKDIR ${CONTAINER_APP_ROOT}
COPY . .
RUN pnpm install -d
RUN npm run build
# ENV DATABASE_URL=mysql://root:123456@database:3306/meimei-prisma?connection_limit=20&pool_timeout=0
# RUN npm run db:m
# CMD ["node", "dist/main.js"]
CMD ["sh", "-c", "npm run start:prod"] 
