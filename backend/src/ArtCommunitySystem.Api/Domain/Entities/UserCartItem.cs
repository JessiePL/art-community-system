namespace ArtCommunitySystem.Api.Domain.Entities;

public class UserCartItem
{
    public string ProductId { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? SelectedSize { get; set; }
}
