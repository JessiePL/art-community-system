namespace ArtCommunitySystem.Api.Contracts.Orders;

public class CheckoutItemRequest
{
    public string ProductId { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? SelectedSize { get; set; }
}
