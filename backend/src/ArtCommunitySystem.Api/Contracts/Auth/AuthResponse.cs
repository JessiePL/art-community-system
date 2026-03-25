namespace ArtCommunitySystem.Api.Contracts.Auth;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public UserProfileResponse User { get; set; } = new();
}
