namespace ArtCommunitySystem.Api.Contracts.Cart;

public class SaveCartRequest
{
    public ICollection<CartItemRequest> Items { get; set; } = [];
}
