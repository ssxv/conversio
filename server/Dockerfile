# BUILD FOR LOCAL DEVELOPMENT
###################
FROM node:20-alpine As development

WORKDIR /app
COPY ./package*.json ./
RUN npm ci

# BUILD FOR PRODUCTION
###################
FROM node:20-alpine As build

WORKDIR /app
COPY ./ ./
COPY --from=development /app/node_modules ./node_modules
RUN npm run build
ENV NODE_ENV production
RUN npm ci --omit=dev && npm cache clean --force

# PRODUCTION
###################
FROM node:20-alpine As production

ENV PORT 9000
ENV DATABASE_HOST db
ENV DATABASE_PORT=5432
ENV DATABASE_USERANME postgres
ENV DATABASE_SYNC false

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/.env ./.env

EXPOSE 9000
CMD [ "node", "dist/main.js" ]
