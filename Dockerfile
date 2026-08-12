FROM node:26-slim

WORKDIR /app

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* ./

# Upgrade npm to avoid npm 11 issues, then clean any leftover pnpm artifacts and install dependencies with npm
RUN npm install -g npm@12.0.2 && rm -rf node_modules .pnpm pnpm-lock.yaml pnpm-lock.yaml* .pnpm-store || true \
  && npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

# Default command (can be overridden by docker-compose)
CMD ["sh", "-c", "npx prisma generate && npx svelte-kit dev -- --host 0.0.0.0 --port 3000"]
