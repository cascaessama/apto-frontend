# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:1.27-alpine

# Copy build output to nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx config with API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose default nginx port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
