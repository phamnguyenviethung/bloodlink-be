# Use Node.js version 22 as the base image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install -g pnpm

RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm  build

# Run the application
CMD ["npm", "run", "start:prod"]
