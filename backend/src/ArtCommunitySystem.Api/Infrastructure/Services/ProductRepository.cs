using ArtCommunitySystem.Api.Domain.Entities;
using MongoDB.Driver;

namespace ArtCommunitySystem.Api.Infrastructure.Services;

public class ProductRepository
{
    private readonly IMongoCollection<Product> _products;

    public ProductRepository(IMongoDatabase database)
    {
        _products = database.GetCollection<Product>("products");
    }

    public async Task EnsureIndexesAsync(CancellationToken cancellationToken = default)
    {
        var nameIndex = new CreateIndexModel<Product>(
            Builders<Product>.IndexKeys.Ascending(x => x.ProductName),
            new CreateIndexOptions { Name = "ix_products_name" });

        await _products.Indexes.CreateOneAsync(nameIndex, cancellationToken: cancellationToken);
    }

    public async Task<IReadOnlyList<Product>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _products.Find(x => x.IsActive).SortBy(x => x.CreatedAtUtc).ToListAsync(cancellationToken);
    }

    public async Task<Product?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _products.Find(x => x.Id == id).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task SeedDefaultsAsync(IEnumerable<Product> products, CancellationToken cancellationToken = default)
    {
        if (await _products.CountDocumentsAsync(Builders<Product>.Filter.Empty, cancellationToken: cancellationToken) > 0)
        {
            return;
        }

        await _products.InsertManyAsync(products, cancellationToken: cancellationToken);
    }

    public async Task<Product?> UpdateAsync(Product product, int expectedVersion, CancellationToken cancellationToken = default)
    {
        product.UpdatedAtUtc = DateTime.UtcNow;
        product.Version = expectedVersion + 1;

        var filter = Builders<Product>.Filter.Where(x => x.Id == product.Id && x.Version == expectedVersion);
        var result = await _products.ReplaceOneAsync(filter, product, cancellationToken: cancellationToken);

        return result.ModifiedCount == 0 ? null : product;
    }

    public IMongoCollection<Product> Collection => _products;

    public static int CalculateTotalStock(Dictionary<string, int>? sizeStock, int fallbackStock)
    {
        if (sizeStock is null || sizeStock.Count == 0)
        {
            return Math.Max(fallbackStock, 0);
        }

        return sizeStock.Values.Sum(value => Math.Max(value, 0));
    }
}
