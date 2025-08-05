# Base image: Node để build app
FROM node:18 as build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the source code
COPY . .

# Build React app (output vào /app/build)
RUN npm run build

# ----------------------------------------
# Production image: Serve static files
FROM nginx:alpine

# Copy build từ bước trên vào thư mục Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx config (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
