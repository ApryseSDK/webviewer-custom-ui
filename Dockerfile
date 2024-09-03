# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the React app
RUN npm run build

# Install a lightweight web server
RUN npm install -g serve

# Serve the application on port 3000
CMD ["serve", "-s", "build"]

# Expose port 3000
EXPOSE 3000
