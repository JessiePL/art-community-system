using ArtCommunitySystem.Api.Domain.Entities;
using MongoDB.Driver;

namespace ArtCommunitySystem.Api.Infrastructure.Services;

public class UserRepository
{
    private readonly IMongoCollection<User> _users;

    public UserRepository(IMongoDatabase database)
    {
        _users = database.GetCollection<User>("users");
    }

    public async Task EnsureIndexesAsync(CancellationToken cancellationToken = default)
    {
        var emailIndex = new CreateIndexModel<User>(
            Builders<User>.IndexKeys.Ascending(x => x.Email),
            new CreateIndexOptions { Unique = true, Name = "ux_users_email" });

        await _users.Indexes.CreateOneAsync(emailIndex, cancellationToken: cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _users.Find(x => x.Email == email).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<User?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _users.Find(x => x.Id == id).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task CreateAsync(User user, CancellationToken cancellationToken = default)
    {
        await _users.InsertOneAsync(user, cancellationToken: cancellationToken);
    }

    public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        user.UpdatedAtUtc = DateTime.UtcNow;
        await _users.ReplaceOneAsync(x => x.Id == user.Id, user, cancellationToken: cancellationToken);
    }
}
