FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock files to the container
COPY package*.json ./

# Install the app dependencies
RUN yarn install 

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build

# Expose the port the app runs on
EXPOSE 3000

# Run the app
CMD ["yarn", "start:server"]
