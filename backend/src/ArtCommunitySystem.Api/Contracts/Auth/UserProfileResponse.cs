namespace ArtCommunitySystem.Api.Contracts.Auth;

public class UserProfileResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsMember { get; set; }
    public int MembershipLevel { get; set; }
    public IReadOnlyList<AddressResponse> Addresses { get; set; } = Array.Empty<AddressResponse>();
}
