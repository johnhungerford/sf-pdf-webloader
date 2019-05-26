# Use an official Python runtime as a parent image
FROM node:8.12-stretch

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

RUN npm install

# Install pdf2htmlex
RUN apt-get update -y && apt-get install pdf2htmlex -y

# Make port 80 available to the world outside this container
EXPOSE 3000

# Define environment variable
ENV NAME World

# Run app.py when the container launches
CMD ["npm", "start"]
