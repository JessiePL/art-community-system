namespace ArtCommunitySystem.Api.Contracts.Auth;

public class UpsertAddressRequest
{
    public string? Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Recipient { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Line1 { get; set; } = string.Empty;
    public string? Line2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}
