using ArtCommunitySystem.Api.Domain.Entities;
using ArtCommunitySystem.Api.Domain.Enums;
using ArtCommunitySystem.Api.Infrastructure.Services;

namespace ArtCommunitySystem.Api.Infrastructure.Seed;

public class DevelopmentProductSeeder
{
    private readonly ProductRepository _productRepository;

    public DevelopmentProductSeeder(ProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        return _productRepository.SeedDefaultsAsync(
        [
            new Product
            {
                Id = "66f100000000000000000001",
                ProductName = "Hashira Signal Tee",
                Category = ProductCategory.TShirt,
                Price = 38m,
                Stock = 24,
                ImageUrl = "/t-shirt.png",
                Note = "Heavyweight cotton tee designed as a statement launch piece.",
                Lead = "Wearable drop",
                Detail = "A front-led apparel piece designed for daily styling, event wear, and statement fan looks.",
                SizeStock = new Dictionary<string, int>
                {
                    ["S"] = 5,
                    ["M"] = 8,
                    ["L"] = 7,
                    ["XL"] = 4,
                },
                CreatedAtUtc = now,
                UpdatedAtUtc = now,
            },
            new Product
            {
                Id = "66f100000000000000000002",
                ProductName = "Nezuko Dawn Mug",
                Category = ProductCategory.Mug,
                Price = 24m,
                Stock = 31,
                ImageUrl = "/mug.png",
                Note = "Soft pink ceramic mug built for desk setups and collector shelves.",
                Lead = "Desk collectible",
                Detail = "A practical display item for home setups, shelves, and daily use without losing the anime visual identity.",
                CreatedAtUtc = now,
                UpdatedAtUtc = now,
            },
            new Product
            {
                Id = "66f100000000000000000003",
                ProductName = "Corps Canvas Carry",
                Category = ProductCategory.CanvasBag,
                Price = 29m,
                Stock = 18,
                ImageUrl = "/bag.png",
                Note = "Utility-focused tote with bold icon framing and convention-ready size.",
                Lead = "Carry essential",
                Detail = "A roomy convention-ready tote built for sketchbooks, small purchases, and everyday fandom styling.",
                CreatedAtUtc = now,
                UpdatedAtUtc = now,
            }
        ], cancellationToken);
    }
}
