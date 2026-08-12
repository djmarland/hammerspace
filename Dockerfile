FROM node:26-slim

WORKDIR /app

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with npm
# Use npm install to ensure a package-lock.json is generated if missing
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

# Default command (can be overridden by docker-compose)
CMD ["sh", "-c", "npx prisma generate && npm run dev"]
