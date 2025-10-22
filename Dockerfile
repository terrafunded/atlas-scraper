# ✅ Dockerfile for Atlas Scraper on Render
FROM node:18-bullseye

# Install system dependencies for Playwright
RUN apt-get update && \
    apt-get install -y wget gnupg ca-certificates fonts-liberation libasound2 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 \
    libcairo2 libnss3 libxss1 libxtst6 libxshmfence1 xvfb && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies (Playwright will install Chromium)
RUN npm install && npx playwright install chromium --with-deps

# Copy the rest of your code
COPY . .

# Expose Render port
ENV PORT=3000
EXPOSE 3000

# Run your scraper server
CMD ["npm", "start"]
