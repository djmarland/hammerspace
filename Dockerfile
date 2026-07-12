FROM node:26-slim

WORKDIR /app

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies with pnpm flag to ignore scripts
RUN pnpm install --prod=false --ignore-scripts

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

# Default command (can be overridden by docker-compose)
CMD ["sh", "-c", "pnpm exec prisma generate && pnpm dev"]
