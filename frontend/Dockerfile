# Use Node.js as the base image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies with legacy peer deps flag
RUN npm install --legacy-peer-deps

# Copy the rest of the frontend code
COPY . .

# Expose the port the app runs on
EXPOSE 5173

# Command to run the application with host setting for docker
CMD ["npm", "run", "dev", "--", "--host"]