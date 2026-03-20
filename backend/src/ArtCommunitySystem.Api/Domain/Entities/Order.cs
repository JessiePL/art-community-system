using ArtCommunitySystem.Api.Domain.Enums;

namespace ArtCommunitySystem.Api.Domain.Entities;

public class Order : BaseEntity
{
    public long UserId { get; set; }
    public long AddressId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public OrderStatus Status { get; set; } = OrderStatus.InCart;
    public string? TrackingNumber { get; set; }
    public decimal TotalAmount { get; set; }

    public User User { get; set; } = null!;
    public Address Address { get; set; } = null!;
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
