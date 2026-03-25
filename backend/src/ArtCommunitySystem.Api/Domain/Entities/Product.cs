using ArtCommunitySystem.Api.Domain.Enums;

namespace ArtCommunitySystem.Api.Domain.Entities;

public class Product : BaseEntity
{
    public string ProductName { get; set; } = string.Empty;
    public ProductCategory Category { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string? Lead { get; set; }
    public string? Detail { get; set; }
    public Dictionary<string, int>? SizeStock { get; set; }
    public bool IsActive { get; set; } = true;
    public int Version { get; set; } = 1;
}
