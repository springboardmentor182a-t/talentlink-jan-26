FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code (volume mount will override this in dev, but good practice)
COPY . .

# Expose port
EXPOSE 5173

# Start Vite development server natively listening on all interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
