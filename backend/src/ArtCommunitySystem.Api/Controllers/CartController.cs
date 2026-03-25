using System.Security.Claims;
using ArtCommunitySystem.Api.Contracts.Cart;
using ArtCommunitySystem.Api.Domain.Entities;
using ArtCommunitySystem.Api.Domain.Enums;
using ArtCommunitySystem.Api.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArtCommunitySystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly UserRepository _userRepository;

    public CartController(UserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CartItemResponse>>> GetMyCart(CancellationToken cancellationToken)
    {
        var user = await GetCurrentUserAsync(cancellationToken);
        if (user is null)
        {
            return Unauthorized(new { message = "User not found." });
        }

        return Ok(user.CartItems.Select(MapCartItem).ToArray());
    }

    [HttpPut]
    public async Task<ActionResult<IReadOnlyList<CartItemResponse>>> SaveCart(SaveCartRequest request, CancellationToken cancellationToken)
    {
        var user = await GetCurrentUserAsync(cancellationToken);
        if (user is null)
        {
            return Unauthorized(new { message = "User not found." });
        }

        var normalizedItems = new List<UserCartItem>();
        foreach (var item in request.Items)
        {
            if (item.Quantity <= 0)
            {
                return BadRequest(new { message = "Cart quantities must be greater than zero." });
            }

            var normalizedProductId = ProductIdMapper.Normalize(item.ProductId);
            var normalizedSize = string.IsNullOrWhiteSpace(item.SelectedSize)
                ? null
                : item.SelectedSize.Trim().ToUpperInvariant();

            if (normalizedSize is not null && !Enum.TryParse<ProductSize>(normalizedSize, true, out _))
            {
                return BadRequest(new { message = $"Unsupported product size '{item.SelectedSize}'." });
            }

            normalizedItems.Add(new UserCartItem
            {
                ProductId = normalizedProductId,
                Quantity = item.Quantity,
                SelectedSize = normalizedSize,
            });
        }

        user.CartItems = normalizedItems;
        await _userRepository.UpdateAsync(user, cancellationToken);
        return Ok(user.CartItems.Select(MapCartItem).ToArray());
    }

    private async Task<User?> GetCurrentUserAsync(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return null;
        }

        return await _userRepository.GetByIdAsync(userId, cancellationToken);
    }

    private static CartItemResponse MapCartItem(UserCartItem item)
    {
        return new CartItemResponse
        {
            ProductId = item.ProductId,
            Quantity = item.Quantity,
            SelectedSize = item.SelectedSize,
        };
    }
}
