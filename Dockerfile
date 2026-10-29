# Build stage
FROM node:20-alpine AS build
WORKDIR /catalog
COPY catalog/package.json catalog/package-lock.json ./
RUN npm ci
COPY catalog/ .
RUN npm run build
FROM nginx:stable-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /catalog/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]