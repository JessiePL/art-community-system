using ArtCommunitySystem.Api.Domain.Enums;

namespace ArtCommunitySystem.Api.Domain.Entities;

public class Order : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    public OrderStatus Status { get; set; } = OrderStatus.InCart;
    public string? TrackingNumber { get; set; }
    public string? ReturnTrackingNumber { get; set; }
    public decimal TotalAmount { get; set; }
    public Address Address { get; set; } = new();
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
