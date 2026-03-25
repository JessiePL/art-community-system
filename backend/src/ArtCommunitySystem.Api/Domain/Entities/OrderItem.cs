using ArtCommunitySystem.Api.Domain.Enums;

namespace ArtCommunitySystem.Api.Domain.Entities;

public class OrderItem
{
    public string ProductId { get; set; } = string.Empty;
    public string ProductNameSnapshot { get; set; } = string.Empty;
    public string ProductImageSnapshot { get; set; } = string.Empty;
    public ProductSize? Size { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}
