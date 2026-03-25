namespace ArtCommunitySystem.Api.Contracts.Products;

public class ProductResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string Image { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string? Lead { get; set; }
    public string? Detail { get; set; }
    public Dictionary<string, int>? SizeStock { get; set; }
    public int Version { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}
