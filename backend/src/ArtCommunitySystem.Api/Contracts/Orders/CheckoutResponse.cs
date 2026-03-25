using ArtCommunitySystem.Api.Contracts.Products;

namespace ArtCommunitySystem.Api.Contracts.Orders;

public class CheckoutResponse
{
    public ICollection<OrderResponse> Orders { get; set; } = [];
    public ICollection<ProductResponse> Products { get; set; } = [];
}
