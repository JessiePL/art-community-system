using System.Security.Claims;
using ArtCommunitySystem.Api.Contracts.Orders;
using ArtCommunitySystem.Api.Domain.Entities;
using ArtCommunitySystem.Api.Domain.Enums;
using ArtCommunitySystem.Api.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace ArtCommunitySystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IMongoClient _mongoClient;
    private readonly ProductRepository _productRepository;
    private readonly OrderRepository _orderRepository;
    private readonly UserRepository _userRepository;

    public OrdersController(
        IMongoClient mongoClient,
        ProductRepository productRepository,
        OrderRepository orderRepository,
        UserRepository userRepository)
    {
        _mongoClient = mongoClient;
        _productRepository = productRepository;
        _orderRepository = orderRepository;
        _userRepository = userRepository;
    }

    [HttpGet("me")]
    public async Task<ActionResult<IReadOnlyList<OrderResponse>>> GetMine(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new { message = "User id claim is missing." });
        }

        var orders = await _orderRepository.GetByUserIdAsync(userId, cancellationToken);
        return Ok(orders.SelectMany(MapOrders));
    }

    [Authorize(Roles = nameof(UserRole.Admin))]
    [HttpGet("admin")]
    public async Task<ActionResult<IReadOnlyList<AdminOrderResponse>>> GetAdminOrders(CancellationToken cancellationToken)
    {
        var orders = await _orderRepository.GetAllAsync(cancellationToken);
        var users = new Dictionary<string, User?>();
        var responses = new List<AdminOrderResponse>();

        foreach (var order in orders)
        {
            if (!users.ContainsKey(order.UserId))
            {
                users[order.UserId] = await _userRepository.GetByIdAsync(order.UserId, cancellationToken);
            }

            responses.AddRange(MapAdminOrders(order, users[order.UserId]));
        }

        return Ok(responses);
    }

    [HttpPost("checkout")]
    public async Task<ActionResult<CheckoutResponse>> Checkout(CheckoutRequest request, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new { message = "User id claim is missing." });
        }

        if (request.Items.Count == 0)
        {
            return BadRequest(new { message = "At least one checkout item is required." });
        }

        using var session = await _mongoClient.StartSessionAsync(cancellationToken: cancellationToken);
        session.StartTransaction();

        try
        {
            var now = DateTime.UtcNow;
            var reservedProducts = new Dictionary<string, Product>();
            var orderItems = new List<OrderItem>();
            decimal totalAmount = 0m;

            foreach (var item in request.Items)
            {
                if (item.Quantity <= 0)
                {
                    await session.AbortTransactionAsync(cancellationToken);
                    return BadRequest(new { message = "Checkout quantity must be greater than zero." });
                }

                var normalizedItem = new CheckoutItemRequest
                {
                    ProductId = ProductIdMapper.Normalize(item.ProductId),
                    Quantity = item.Quantity,
                    SelectedSize = item.SelectedSize,
                };

                var product = await ReserveProductAsync(session, normalizedItem, now, cancellationToken);
                if (product is null)
                {
                    await session.AbortTransactionAsync(cancellationToken);
                    return Conflict(new { message = "One or more items no longer have enough stock. Refresh and try again." });
                }

                reservedProducts[product.Id] = product;

                var selectedSize = TryParseSize(item.SelectedSize);
                var lineTotal = product.Price * item.Quantity;
                totalAmount += lineTotal;

                orderItems.Add(new OrderItem
                {
                    ProductId = product.Id,
                    ProductNameSnapshot = product.ProductName,
                    ProductImageSnapshot = product.ImageUrl,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price,
                    LineTotal = lineTotal,
                    Size = selectedSize,
                });
            }

            var order = new Order
            {
                UserId = userId,
                OrderNumber = BuildOrderNumber(now),
                Status = OrderStatus.Paid,
                TotalAmount = totalAmount,
                Address = new Address
                {
                    Id = Guid.NewGuid().ToString("n"),
                    Label = request.Address?.Label?.Trim() ?? "Shipping",
                    ReceiverName = request.Address?.Recipient?.Trim() ?? string.Empty,
                    ContactPhone = request.Address?.Phone?.Trim() ?? string.Empty,
                    Line1 = request.Address?.Line1?.Trim() ?? string.Empty,
                    Line2 = string.IsNullOrWhiteSpace(request.Address?.Line2) ? null : request.Address!.Line2.Trim(),
                    City = request.Address?.City?.Trim() ?? string.Empty,
                    ProvinceOrState = request.Address?.Region?.Trim() ?? string.Empty,
                    PostalCode = request.Address?.PostalCode?.Trim() ?? string.Empty,
                    Country = "Canada",
                    IsDefault = false,
                },
                Items = orderItems,
                CreatedAtUtc = now,
                UpdatedAtUtc = now,
            };

            await _orderRepository.Collection.InsertOneAsync(session, order, cancellationToken: cancellationToken);
            await session.CommitTransactionAsync(cancellationToken);

            await RemoveCheckedOutItemsFromCartAsync(userId, request.Items, cancellationToken);

            return Ok(new CheckoutResponse
            {
                Orders = MapOrders(order).ToArray(),
                Products = reservedProducts.Values.Select(ProductsController.MapProduct).ToArray(),
            });
        }
        catch
        {
            await session.AbortTransactionAsync(cancellationToken);
            throw;
        }
    }

    [HttpPost("{orderId}/confirm-receipt")]
    public async Task<ActionResult<IReadOnlyList<OrderResponse>>> ConfirmReceipt(string orderId, CancellationToken cancellationToken)
    {
        var order = await GetOwnedOrderAsync(orderId, cancellationToken);
        if (order is null)
        {
            return NotFound(new { message = "Order not found." });
        }

        if (order.Status != OrderStatus.Shipped)
        {
            return BadRequest(new { message = "Only shipped orders can be confirmed." });
        }

        order.Status = OrderStatus.Completed;
        await _orderRepository.UpdateAsync(order, cancellationToken);
        return Ok(MapOrders(order).ToArray());
    }

    [HttpPost("{orderId}/request-return")]
    public async Task<ActionResult<IReadOnlyList<OrderResponse>>> RequestReturn(string orderId, RequestReturnRequest request, CancellationToken cancellationToken)
    {
        var order = await GetOwnedOrderAsync(orderId, cancellationToken);
        if (order is null)
        {
            return NotFound(new { message = "Order not found." });
        }

        if (order.Status != OrderStatus.Shipped)
        {
            return BadRequest(new { message = "Only shipped orders can move into return flow." });
        }

        if (string.IsNullOrWhiteSpace(request.ReturnTrackingNumber))
        {
            return BadRequest(new { message = "Return shipping code is required." });
        }

        order.Status = OrderStatus.ReturnRequested;
        order.ReturnTrackingNumber = request.ReturnTrackingNumber.Trim();
        await _orderRepository.UpdateAsync(order, cancellationToken);
        return Ok(MapOrders(order).ToArray());
    }

    [Authorize(Roles = nameof(UserRole.Admin))]
    [HttpPost("{orderId}/ship")]
    public async Task<ActionResult<IReadOnlyList<AdminOrderResponse>>> ShipOrder(string orderId, ShipOrderRequest request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(orderId, cancellationToken);
        if (order is null)
        {
            return NotFound(new { message = "Order not found." });
        }

        if (order.Status != OrderStatus.Paid)
        {
            return BadRequest(new { message = "Only paid orders can be shipped." });
        }

        if (string.IsNullOrWhiteSpace(request.TrackingNumber))
        {
            return BadRequest(new { message = "Shipping code is required." });
        }

        order.Status = OrderStatus.Shipped;
        order.TrackingNumber = request.TrackingNumber.Trim();
        await _orderRepository.UpdateAsync(order, cancellationToken);

        var user = await _userRepository.GetByIdAsync(order.UserId, cancellationToken);
        return Ok(MapAdminOrders(order, user).ToArray());
    }

    [Authorize(Roles = nameof(UserRole.Admin))]
    [HttpPost("{orderId}/refund")]
    public async Task<ActionResult<IReadOnlyList<AdminOrderResponse>>> RefundOrder(string orderId, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(orderId, cancellationToken);
        if (order is null)
        {
            return NotFound(new { message = "Order not found." });
        }

        if (order.Status != OrderStatus.ReturnRequested)
        {
            return BadRequest(new { message = "Only return-requested orders can be refunded." });
        }

        using var session = await _mongoClient.StartSessionAsync(cancellationToken: cancellationToken);
        session.StartTransaction();

        try
        {
            foreach (var item in order.Items)
            {
                var updates = Builders<Product>.Update
                    .Inc(x => x.Stock, item.Quantity)
                    .Inc(x => x.Version, 1)
                    .Set(x => x.UpdatedAtUtc, DateTime.UtcNow);

                if (item.Size is not null)
                {
                    updates = updates.Inc($"SizeStock.{item.Size}", item.Quantity);
                }

                await _productRepository.Collection.UpdateOneAsync(
                    session,
                    Builders<Product>.Filter.Eq(x => x.Id, item.ProductId),
                    updates,
                    cancellationToken: cancellationToken);
            }

            order.Status = OrderStatus.Refunded;
            order.UpdatedAtUtc = DateTime.UtcNow;
            await _orderRepository.Collection.ReplaceOneAsync(session, x => x.Id == order.Id, order, cancellationToken: cancellationToken);
            await session.CommitTransactionAsync(cancellationToken);
        }
        catch
        {
            await session.AbortTransactionAsync(cancellationToken);
            throw;
        }

        var user = await _userRepository.GetByIdAsync(order.UserId, cancellationToken);
        return Ok(MapAdminOrders(order, user).ToArray());
    }

    private async Task<Order?> GetOwnedOrderAsync(string orderId, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return null;
        }

        var order = await _orderRepository.GetByIdAsync(orderId, cancellationToken);
        if (order is null || order.UserId != userId)
        {
            return null;
        }

        return order;
    }

    private async Task RemoveCheckedOutItemsFromCartAsync(string userId, IEnumerable<CheckoutItemRequest> items, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null || user.CartItems.Count == 0)
        {
            return;
        }

        var purchasedKeys = items
            .Select(item => BuildCartKey(ProductIdMapper.Normalize(item.ProductId), item.SelectedSize))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        user.CartItems = user.CartItems
            .Where(item => !purchasedKeys.Contains(BuildCartKey(item.ProductId, item.SelectedSize)))
            .ToList();

        await _userRepository.UpdateAsync(user, cancellationToken);
    }

    private static string BuildCartKey(string productId, string? selectedSize)
    {
        return productId + "::" + (string.IsNullOrWhiteSpace(selectedSize) ? "default" : selectedSize.Trim().ToUpperInvariant());
    }

    private async Task<Product?> ReserveProductAsync(IClientSessionHandle session, CheckoutItemRequest item, DateTime now, CancellationToken cancellationToken)
    {
        var builder = Builders<Product>.Filter;
        var updateBuilder = Builders<Product>.Update;
        var selectedSize = TryParseSize(item.SelectedSize);

        FilterDefinition<Product> filter;
        UpdateDefinition<Product> update;

        if (selectedSize is not null)
        {
            var sizeField = $"SizeStock.{selectedSize}";
            filter = builder.And(
                builder.Eq(x => x.Id, item.ProductId),
                builder.Eq(x => x.IsActive, true),
                builder.Gte(sizeField, item.Quantity),
                builder.Gte(x => x.Stock, item.Quantity));

            update = updateBuilder
                .Inc(sizeField, -item.Quantity)
                .Inc(x => x.Stock, -item.Quantity)
                .Inc(x => x.Version, 1)
                .Set(x => x.UpdatedAtUtc, now);
        }
        else
        {
            filter = builder.And(
                builder.Eq(x => x.Id, item.ProductId),
                builder.Eq(x => x.IsActive, true),
                builder.Gte(x => x.Stock, item.Quantity));

            update = updateBuilder
                .Inc(x => x.Stock, -item.Quantity)
                .Inc(x => x.Version, 1)
                .Set(x => x.UpdatedAtUtc, now);
        }

        return await _productRepository.Collection.FindOneAndUpdateAsync(
            session,
            filter,
            update,
            new FindOneAndUpdateOptions<Product>
            {
                ReturnDocument = ReturnDocument.After,
            },
            cancellationToken);
    }

    private static ProductSize? TryParseSize(string? value)
    {
        return Enum.TryParse<ProductSize>(value, true, out var size) ? size : null;
    }

    private static string BuildOrderNumber(DateTime now)
    {
        return $"ACS-{now:yyMMdd}-{Random.Shared.Next(100, 999)}";
    }

    private static IEnumerable<OrderResponse> MapOrders(Order order)
    {
        foreach (var item in order.Items)
        {
            yield return new OrderResponse
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                ItemName = item.ProductNameSnapshot,
                Quantity = item.Quantity,
                Total = item.LineTotal,
                Status = order.Status switch
                {
                    OrderStatus.Paid => "Paid",
                    OrderStatus.Shipped => "Shipped",
                    OrderStatus.ReturnRequested => "Return requested",
                    OrderStatus.Refunded => "Refunded",
                    OrderStatus.Completed => "Completed",
                    _ => order.Status.ToString(),
                },
                Eta = order.Status switch
                {
                    OrderStatus.Paid => "Waiting for admin to arrange shipping",
                    OrderStatus.Shipped => "In transit. Confirm receipt or start a return.",
                    OrderStatus.ReturnRequested => "Return requested. Waiting for admin refund review.",
                    OrderStatus.Refunded => "Refund completed.",
                    OrderStatus.Completed => "Order completed successfully.",
                    _ => "Order update recorded",
                },
                Detail = BuildUserOrderDetail(order),
                Image = item.ProductImageSnapshot,
                TrackingNumber = order.TrackingNumber,
                ReturnTrackingNumber = order.ReturnTrackingNumber,
                SelectedSize = item.Size?.ToString(),
            };
        }
    }

    private static IEnumerable<AdminOrderResponse> MapAdminOrders(Order order, User? user)
    {
        foreach (var item in order.Items)
        {
            yield return new AdminOrderResponse
            {
                Id = order.Id,
                BuyerName = user?.Name ?? "Unknown user",
                BuyerEmail = user?.Email ?? "Unknown email",
                ItemName = item.ProductNameSnapshot,
                Quantity = item.Quantity,
                Total = item.LineTotal,
                Status = order.Status switch
                {
                    OrderStatus.Paid => "Paid",
                    OrderStatus.Shipped => "Shipped",
                    OrderStatus.ReturnRequested => "Return requested",
                    OrderStatus.Refunded => "Refunded",
                    OrderStatus.Completed => "Completed",
                    _ => order.Status.ToString(),
                },
                OrderNumber = order.OrderNumber,
                TrackingNumber = order.TrackingNumber,
                ReturnTrackingNumber = order.ReturnTrackingNumber,
                AddressSummary = BuildAddressSummary(order.Address),
                SelectedSize = item.Size?.ToString(),
            };
        }
    }

    private static string BuildUserOrderDetail(Order order)
    {
        var shipping = string.IsNullOrWhiteSpace(order.Address.Line1)
            ? "No shipping address saved on this order yet."
            : $"Shipping to {order.Address.ReceiverName}, {order.Address.Line1}, {order.Address.City}.";

        if (order.Status == OrderStatus.ReturnRequested && !string.IsNullOrWhiteSpace(order.ReturnTrackingNumber))
        {
            return $"{shipping} Return shipping code: {order.ReturnTrackingNumber}.";
        }

        if (order.Status == OrderStatus.Shipped && !string.IsNullOrWhiteSpace(order.TrackingNumber))
        {
            return $"{shipping} Outbound shipping code: {order.TrackingNumber}.";
        }

        if (order.Status == OrderStatus.Completed)
        {
            var completionMessage = string.IsNullOrWhiteSpace(order.TrackingNumber)
                ? "Delivery was confirmed by the buyer and this order is now complete."
                : $"Delivery was confirmed by the buyer. Outbound shipping code: {order.TrackingNumber}.";

            return $"{shipping} {completionMessage}";
        }

        if (order.Status == OrderStatus.Refunded)
        {
            return $"{shipping} Refund completed by admin.";
        }

        return shipping;
    }

    private static string BuildAddressSummary(Address address)
    {
        if (string.IsNullOrWhiteSpace(address.Line1))
        {
            return "No shipping address on file";
        }

        return $"{address.ReceiverName}, {address.Line1}, {address.City}, {address.ProvinceOrState} {address.PostalCode}";
    }
}
