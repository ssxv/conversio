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
FROM nginx

COPY --from=build /app/out /usr/share/nginx/html
