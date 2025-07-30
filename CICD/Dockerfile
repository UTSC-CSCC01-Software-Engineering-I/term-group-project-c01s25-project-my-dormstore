# Use official Node.js LTS image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY ../backend/package*.json ./
RUN npm install

# Copy the rest of the backend source code
COPY ../backend .

# Expose the backend port (adjust if your server runs on a different port)
EXPOSE 5000

# Command to run your backend server
CMD ["node", "server.js"]
