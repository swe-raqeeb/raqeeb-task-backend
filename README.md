# raqeeb-task-backend

## Overview

This README will guide you through setting up the application in both development and production modes using Docker Compose, API documentation, and outline the performance optimization techniques implemented in the project.

## Prerequisites

- **Docker**: Ensure Docker is installed on your machine. You can download it from [here](https://www.docker.com/get-started).
- **Docker Compose**: Ensure Docker Compose is installed. You can download it from [here](https://docs.docker.com/compose/install/).

## Setup

### 1. Clone the Repository

```bash
git clone git@github.com:swe-raqeeb/raqeeb-task-backend.git
cd raqeeb-task-backend
```

### 2. Set Up Environment Variables

The application requires specific environment variables for development and production modes. Follow these steps to configure the environment:

- For **Development** mode:
  - Create a new file named `.env.dev` in the root directory.
  - Copy the contents of the `.env.sample` file into the `.env.dev` file:

    ```bash
    cp .env.sample .env.dev
    ```

  - Update the values in `.env.dev` as necessary.

- For **Production** mode:
  - Create a new file named `.env.prod` in the root directory.
  - Copy the contents of the `.env.sample` file into the `.env.prod` file:

    ```bash
    cp .env.sample .env.prod
    ```

  - Update the values in `.env.prod` with production-specific values.

### 3. Add SSL Certificates for Production

For production, you need to provide self-signed certificates:

- Place the SSL certificates in a directory called `/certs` in the root of your project.
  - Example:
    - `/certs/privkey1.pem`
    - `/certs/fullchain1.pem`

### 4. Running the Application

- **Development Mode**:
  To run the app in development mode, execute the following command:

  ```bash
  docker-compose -f compose.yaml -f compose.dev.yaml up -d --build
  ```

- **Production Mode**:
  To run the app in production mode, execute the following command:

  ```bash
  docker-compose -f compose.yaml -f compose.prod.yaml up -d --build
  ```

## API Documentation

This project uses **Swagger** for API documentation, you can access the full API documentation by navigating to the following link in your browser:

- **Swagger API Documentation**: [click here](https://app.swaggerhub.com/apis/AHMADABDULMONAIM_1/task-api/1.0.0-oas3)

This link provides a description of API endpoints, and detailed information about request and response structures.

## Performance Optimization Techniques

When working with large datasets, it is crucial to implement performance optimization techniques to ensure efficient data processing and querying. In this task, several strategies were employed to enhance performance

## Techniques Used

### 1. Streaming for Data Ingestion

To efficiently handle large JSON files, I utilized Node.js streams. This approach allows for reading the file in chunks rather than loading the entire file into memory at once. By streaming the data, memory usage is minimized, and the application's responsiveness is improved, particularly during data ingestion. This method is beneficial for processing large datasets, enabling the following:

- Reduction of memory overhead.
- Immediate processing of data as soon as a chunk is available, rather than waiting for the entire file to be read.

### 2. Database Indexing

To optimize query performance in the database, several indices were created on frequently queried fields. The following indices were added to the `RecordSchema`:

```javascript
RecordSchema.index({ username: 1 });
RecordSchema.index({ created_at: 1 });
RecordSchema.index({ status: 1 });
RecordSchema.index({ leaked_sources: 1 });
RecordSchema.index({ username: 1, status: 1 });
RecordSchema.index({ created_at: 1, status: 1, username: 1 });
RecordSchema.index({ username: 'text', url: 'text' });
```

These indices enhance the speed of read operations by allowing the database engine to quickly locate records without scanning the entire dataset.

### 3. Streaming Responses

When returning responses to the client, I utilized streaming to send data efficiently. By binding the Express response stream object, data can be sent in chunks, optimizing data transfer and improving response times. This approach aids in the following:

- Reduction of latency by sending data as it becomes available.
- Minimization of the memory footprint on the server by avoiding the retention of the entire response in memory.

By implementing these techniques, the application is able to efficiently handle large datasets, resulting in improved performance and a better user experience.
