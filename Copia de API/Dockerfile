# Use Node.js 18 LTS as base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]