## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js 20.12.2 installed on your local machine
- npm package manager installed
- docker and docker-compose installed

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tundrax-Dex/nestjs-assignment
   ```

2. **Navigate to the project directory:**
   ```bash
   cd nestjs-assignment
   ```

3. **Run the app using Docker:**   
   ```bash
    docker-compose build
    docker compose-up
   ```

## Test

```bash
# build command 
$ docker-compose -f ./docker-compose-test.yml build

# unit tests
$ docker-compose -f ./docker-compose-test.yml run unit_test

# e2e tests
$ docker-compose -f ./docker-compose-test.yml run e2e_test

```

## Postman Collection
You can find a Postman collection file named tundrax-test-task.postman_collection.json in the project folder. You can import this file into Postman to access the API endpoints easily.

## Usage

- After starting the server, you can access the API endpoints listed below:

### Routes:
**User Routes**
- **POST /user/favorite-cat/:catId:** To mark a cat as favorite by cat Id
- **GET /user/favorite-cats:** To Get all favorites marked by user
- **GET /user** To get user details

**Auth Routes**
- **POST /auth/register** To register new user
- **POST /auth/login** To login registered user
- **POST /registerAdmin** To register a new Admin

**Cats Routes**
- **GET /cats** To get details all cats
- **POST /cats** To create new cat (Admin Accessible Only)
- **GET /cats/:id** To get cat by Id
- **DELETE /cats/:id** To delete cat by Id (Admin Accessible Only)
- **PUT /cats/:id** To update cat data (Admin Accessible Only)

Note: To create an admin user, you can call the POST /auth/registerAdmin endpoint

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).
