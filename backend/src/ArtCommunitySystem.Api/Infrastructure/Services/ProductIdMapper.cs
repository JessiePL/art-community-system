namespace ArtCommunitySystem.Api.Infrastructure.Services;

public static class ProductIdMapper
{
    private static readonly IReadOnlyDictionary<string, string> LegacyMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        ["merch-hashira-shirt"] = "66f100000000000000000001",
        ["merch-nezuko-mug"] = "66f100000000000000000002",
        ["merch-corps-bag"] = "66f100000000000000000003",
    };

    public static string Normalize(string productId)
    {
        if (string.IsNullOrWhiteSpace(productId))
        {
            return productId;
        }

        return LegacyMap.TryGetValue(productId.Trim(), out var mappedId)
            ? mappedId
            : productId.Trim();
    }
}
