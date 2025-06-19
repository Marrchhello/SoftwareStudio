# Backend Authentication System

This backend implements a JWT-based authentication system that protects all endpoints except for public ones.

## Authentication Flow

1. Users must first register an account using the `/register` endpoint
2. Users can then obtain a JWT token by sending their credentials to the `/token` endpoint
3. All protected endpoints require a valid JWT token in the Authorization header

## API Endpoints

### Public Endpoints (No Authentication Required)

- `/` - Home page
- `/register` - Registration page
- `/login` - Login page
- `/token` - Get JWT token
- `/faq` - Get FAQ questions

### Protected Endpoints (Authentication Required)

All other endpoints require authentication with a valid JWT token. The token must be included in the Authorization header as a Bearer token.

## How to Authenticate

### 1. Register a User

First, register a user with the appropriate role (STUDENT, TEACHER, STAFF).

### 2. Get JWT Token

Send a POST request to `/token` with your username and password:

```
POST /token
Content-Type: application/x-www-form-urlencoded

username=your_username&password=your_password
```

The response will include an access token:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. Use the Token in Requests

Include the token in the Authorization header for all protected endpoints:

```
GET /student/123/courses
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Role-Based Access Control

- Each endpoint is protected based on the user's role
- Users can only access endpoints related to their role
- Users can only access their own data (e.g., a student can only access their own courses)

## Token Expiration

Tokens expire after 30 minutes by default. After expiration, you'll need to request a new token.

## Security Notes

- All passwords are hashed using bcrypt before being stored in the database
- JWT tokens are signed with a secret key to prevent tampering
- Sensitive operations require re-authentication 