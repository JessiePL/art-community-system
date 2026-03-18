# Backend API Contract Draft

This file captures the backend direction for the rebuilt Art Community System.

## Target Stack

- Backend framework: ASP.NET Core Web API
- Relational database: MySQL
- Document database: MongoDB
- Auth model: JWT access token + refresh token

## Core Modules

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`

### Users

- `GET /api/users/me`

### Membership

- `POST /api/membership/subscribe`
- `GET /api/membership/status`

### Products

- `GET /api/products`
- `GET /api/products/{id}`

### Orders

- `POST /api/orders`
- `GET /api/orders/my`

Rule:

- Only users with active member status can create an order.

### Returns

- `POST /api/returns`
- `GET /api/returns/my`

Rule:

- Members: no-reason return flow.
- Non-members: allow returns with a $20 handling fee.

### Events

- `GET /api/events`
- `POST /api/events/{id}/join`
- `DELETE /api/events/{id}/join`

Rule:

- Browsing is public.
- Joining requires login.

### Community

- `GET /api/posts`
- `POST /api/posts`
- `POST /api/posts/{id}/comments`

## Suggested MySQL Entities

- `User`
- `Membership`
- `Product`
- `Order`
- `OrderItem`
- `ReturnRequest`
- `Event`
- `EventRegistration`

## Suggested MongoDB Collections

- `posts`
- `comments`
- `favorites`
- `characterLore`
- `eventRecaps`
- `behaviorLogs`

## Implementation Note

The current front-end MVP already reflects these access rules and route groups. The next step is to replace the legacy Node experiment with a clean ASP.NET Core solution that implements this contract.
