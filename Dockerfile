######################################
# CLIENT
######################################
# BUILD FOR LOCAL DEVELOPMENT
######################################
FROM node:20-alpine As client-development

WORKDIR /app/client
COPY ./client/package*.json ./
RUN npm ci

# BUILD FOR PRODUCTION
######################################
FROM node:20-alpine As client-build

WORKDIR /app/client
COPY ./client/ ./
COPY --from=client-development /app/client/node_modules ./node_modules
RUN npm run build
ENV NODE_ENV production
RUN npm ci --omit=dev && npm cache clean --force

######################################
# SERVER
######################################
# BUILD FOR LOCAL DEVELOPMENT
######################################
FROM node:20-alpine As server-development

WORKDIR /app
COPY ./server/package*.json ./
RUN npm ci

# BUILD FOR PRODUCTION
######################################
FROM node:20-alpine As server-build

WORKDIR /app
COPY ./server/ ./
COPY --from=server-development /app/node_modules ./node_modules
RUN npm run build
ENV NODE_ENV production
RUN npm ci --omit=dev && npm cache clean --force

# PRODUCTION
######################################
FROM node:20-alpine As server-production

ENV PORT 9000
ENV DATABASE_HOST db
ENV DATABASE_PORT=5432
ENV DATABASE_USERANME postgres
ENV DATABASE_SYNC false

COPY --from=server-build /app/node_modules ./node_modules
COPY --from=server-build /app/dist ./dist
COPY --from=server-build /app/.env ./.env
COPY --from=client-build /app/client/out ./out

EXPOSE 9000
CMD [ "node", "dist/main.js" ]
