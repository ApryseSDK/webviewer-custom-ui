# Use a lightweight base image with curl installed
FROM ubuntu:22.04

# Install curl, bash, and dependencies for building Node.js
RUN apt-get update && apt-get install -y curl bash build-essential

# Install NVM and Node.js with proper cache key prefix
RUN --mount=type=cache,id=node_modules_cache,target=/root/.cache \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash && \
    export NVM_DIR="$HOME/.nvm" && \
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && \
    nvm install node && \
    nvm use node && \
    npm install

# Set the environment variable for legacy provider
ENV NODE_OPTIONS=--openssl-legacy-provider

# Set the working directory
WORKDIR /app

# Copy all application files to the container
COPY . .

# Expose the application's port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
