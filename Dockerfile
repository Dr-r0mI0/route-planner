FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Build the frontend
RUN npm run build

# Expose the backend API and frontend serving port
EXPOSE 3002

# Start the server
CMD ["node", "server/proxy.js"]
