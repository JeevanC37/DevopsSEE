# Stage 1: Build the React application
FROM node:16-alpine AS build

# Set working directory inside the container
WORKDIR /app

# Copy package files (From root context -> frontend folder)
COPY frontend/package*.json ./

# Install dependencies (Using npm to match your project)
RUN npm install

# Copy source code
COPY frontend/ ./

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx configuration (From frontend folder)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
