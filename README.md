# Node.js AWS Cart API

## Description
The Cart API is a Node.js application designed to manage shopping cart functionality in an e-commerce platform. It leverages AWS Lambda functions and API Gateway to provide a serverless architecture for handling cart-related operations. The service includes endpoints for creating, updating, and retrieving cart data. This project serves as a foundation for building scalable and efficient serverless applications on AWS.

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [AWS CDK](https://aws.amazon.com/cdk/) installed on your machine.

### Installation
1. Clone the repository:
   ```sh
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```sh
   cd nodejs-aws-cart-api
   ```
3. Install the dependencies:
   ```sh
   npm install
   ```

### AWS Configuration

#### Prerequisites
Before deploying this application, you need to configure your AWS credentials. Make sure you have:
- AWS CLI installed (`npm install -g aws-cdk`)
- An AWS account
- Access Key ID and Secret Access Key with appropriate permissions

### Configure AWS Credentials
1. Run AWS configure command:
   ```bash
   aws configure
   AWS Access Key ID [None]: YOUR_ACCESS_KEY
   AWS Secret Access Key [None]: YOUR_SECRET_KEY
   Default region name [None]: us-east-1
   Default output format [None]: json

   # Verify configuration
   aws configure list

   # Configure named profiles (optional)
   aws configure --profile dev
   aws configure --profile prod

   # Use specific profile
   aws configure list --profile dev
   ```

### CDK Bootstrap

Before deploying CDK applications for the first time in an AWS environment (account/region), you need to bootstrap the environment:

```bash
cdk bootstrap
```

### Deploying the Application
Deploy the application to AWS using the following command:
```sh
npm run cdk:deploy
```

### Synthesizing the CloudFormation Template
To synthesize the CloudFormation template, use the following command:
```sh
npm run cdk:synth
```

### Destroying the Application
To destroy the deployed application, use the following command:
```sh
npm run cdk:destroy
```

### Running the Application Locally
To start the application locally, you can use the following command:
```sh
npm start
```


### Docker Setup
To run the application using Docker:

#### Build the image
```
docker build -t cart-service .
```

#### Run the container
```
docker run -p 4000:4000 cart-service
```

Build the image
docker build -t cart-service .

Run the container
docker run -p 4000:4000 cart-service

1. Build the Docker image:
   ```sh
   docker build -t cart-service .

### API Endpoints
Once deployed, you can access the API at the URL provided in the CloudFormation output. The available endpoints are:
- `POST /api/auth/register`: Registers a new user.
- `POST /api/auth/login`: Logs in a user and retrieves an authentication token.
- `GET /cart`: Retrieves the current user's cart.
- `POST /cart`: Adds items to the cart.
- `PUT /cart`: Updates items in the cart.
- `DELETE /cart`: Removes items from the cart.

## Project Structure
```
src/
   handlers/
      getCart.ts - Lambda function handler for retrieving the cart.
      updateCart.ts - Lambda function handler for updating the cart.
      deleteCart.ts - Lambda function handler for deleting items from the cart.
   services/
      cart.service.ts - Contains the business logic for cart operations.
   lib/
      cart-service-stack.ts - Defines the AWS infrastructure stack for the cart service.
node_modules/ - Contains the project's dependencies.
test/
   cart-service.test.ts - Unit tests for the cart service.
cdk.json - Configuration file for AWS CDK.
package.json - Defines the project's dependencies and scripts.
README.md - Provides an overview and documentation for the project.
tsconfig.json - TypeScript configuration file.
```

## Contributing
Feel free to submit issues or pull requests to improve the project.

## License
This project is licensed under the ISC License.

## API Documentation
The API documentation is available in OpenAPI (Swagger) format:
- YAML version: [openapi.yaml](docs/openapi.yaml)
- JSON version: [openapi.json](docs/openapi.json)

You can view and test the API using [Swagger Editor](https://editor.swagger.io/)
by copying the content of either file.

### Available Endpoints

#### POST /api/auth/register
- **Description**: Registers a new user.
- **Request Body**:
  ```json
  {
    "name": "your_github_login",
    "password": "TEST_PASSWORD"
  }
  ```
- **Response**: A success message or error.

#### POST /api/auth/login
- **Description**: Logs in a user and retrieves an authentication token.
- **Request Body**:
  ```json
  {
    "username": "your_github_login",
    "password": "TEST_PASSWORD"
  }
  ```
- **Response**:
  ```json
  {
    "token_type": "Basic",
    "access_token": "eW91ckdpdGh1YkxvZ2luOlRFU1RfUEFTU1dPUkQ="
  }
  ```

#### GET /cart
- **Description**: Retrieves the current user's cart.
- **Response**: The cart object.

#### POST /cart
- **Description**: Adds items to the cart.
- **Request Body**:
  ```json
  {
    "product_id": "12345",
    "count": 2
  }
  ```
- **Response**: The updated cart object.

#### PUT /cart
- **Description**: Updates items in the cart.
- **Request Body**:
  ```json
  {
    "product_id": "12345",
    "count": 5
  }
  ```
- **Response**: The updated cart object.

#### DELETE /cart
- **Description**: Removes items from the cart.
- **Request Body**:
  ```json
  {
    "product_id": "12345"
  }
  ```
- **Response**: The updated cart object.