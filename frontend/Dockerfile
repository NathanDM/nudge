# Stage 1: build React
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
RUN npm ci
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN ../node_modules/.bin/tsc -b && ../node_modules/.bin/vite build

# Stage 2: serve with nginx
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY frontend/nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
