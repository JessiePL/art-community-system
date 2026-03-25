namespace ArtCommunitySystem.Api.Contracts.Auth;

public class UpdateProfileRequest
{
    public string Name { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
}
