namespace ArtCommunitySystem.Api.Infrastructure.Storage;

public class CloudinarySettings
{
    public const string SectionName = "Cloudinary";

    public string CloudName { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string ApiSecret { get; set; } = string.Empty;
    public string ProductsFolder { get; set; } = "art-community-system/products";
    public string AvatarsFolder { get; set; } = "art-community-system/avatars";
}
