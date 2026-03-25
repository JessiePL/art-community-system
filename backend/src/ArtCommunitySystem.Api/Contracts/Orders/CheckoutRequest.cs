namespace ArtCommunitySystem.Api.Contracts.Orders;

public class CheckoutRequest
{
    public CheckoutAddressRequest? Address { get; set; }
    public ICollection<CheckoutItemRequest> Items { get; set; } = [];
}
