using ArtCommunitySystem.Api.Domain.Entities;
using MongoDB.Driver;

namespace ArtCommunitySystem.Api.Infrastructure.Services;

public class OrderRepository
{
    private readonly IMongoCollection<Order> _orders;

    public OrderRepository(IMongoDatabase database)
    {
        _orders = database.GetCollection<Order>("orders");
    }

    public async Task EnsureIndexesAsync(CancellationToken cancellationToken = default)
    {
        var orderNumberIndex = new CreateIndexModel<Order>(
            Builders<Order>.IndexKeys.Ascending(x => x.OrderNumber),
            new CreateIndexOptions { Unique = true, Name = "ux_orders_order_number" });

        var userIndex = new CreateIndexModel<Order>(
            Builders<Order>.IndexKeys.Ascending(x => x.UserId).Descending(x => x.CreatedAtUtc),
            new CreateIndexOptions { Name = "ix_orders_user_created" });

        await _orders.Indexes.CreateManyAsync(new[] { orderNumberIndex, userIndex }, cancellationToken);
    }

    public async Task<IReadOnlyList<Order>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _orders.Find(x => x.UserId == userId)
            .SortByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Order>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _orders.Find(Builders<Order>.Filter.Empty)
            .SortByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<Order?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _orders.Find(x => x.Id == id).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task UpdateAsync(Order order, CancellationToken cancellationToken = default)
    {
        order.UpdatedAtUtc = DateTime.UtcNow;
        await _orders.ReplaceOneAsync(x => x.Id == order.Id, order, cancellationToken: cancellationToken);
    }

    public IMongoCollection<Order> Collection => _orders;
}
