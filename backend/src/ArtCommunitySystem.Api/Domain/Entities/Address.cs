namespace ArtCommunitySystem.Api.Domain.Entities;

public class Address
{
    public string Id { get; set; } = Guid.NewGuid().ToString("n");
    public string Label { get; set; } = string.Empty;
    public string ReceiverName { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string Line1 { get; set; } = string.Empty;
    public string? Line2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string ProvinceOrState { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = "Canada";
    public bool IsDefault { get; set; }
}
