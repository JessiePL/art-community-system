# ASP.NET Backend Draft

This folder now starts the ASP.NET Core backend for the Art Community System.

## Current Scope

The first pass focuses on the model-first foundation:

- ASP.NET Core Web API project
- Entity Framework Core DbContext
- Core enums
- Core entities

## Implemented Entities

- `User`
- `Address`
- `Product`
- `Order`
- `OrderItem`

## Current Enums

- `UserRole`
- `ProductCategory`
- `ProductSize`
- `OrderStatus`

## Notes

- `Address` is user-owned and not shared.
- `Order` stores the order-level metadata.
- `OrderItem` stores the purchased line items for each order.
- `Product` stores the current catalog data.

## Next Step

The next layer to add is:

1. DTOs
2. auth endpoints
3. product endpoints
4. order endpoints
5. JWT and file upload support
