namespace ArtCommunitySystem.Api.Contracts.Orders;

public class OrderResponse
{
    public string Id { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Eta { get; set; } = string.Empty;
    public string Detail { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public string? TrackingNumber { get; set; }
    public string? ReturnTrackingNumber { get; set; }
    public string? SelectedSize { get; set; }
}
