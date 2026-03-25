using ArtCommunitySystem.Api.Domain.Entities;
using ArtCommunitySystem.Api.Domain.Enums;
using ArtCommunitySystem.Api.Infrastructure.Services;

namespace ArtCommunitySystem.Api.Infrastructure.Seed;

public class DevelopmentUserSeeder
{
    private readonly UserRepository _userRepository;

    public DevelopmentUserSeeder(UserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var seedUsers = new[]
        {
            new User
            {
                Name = "Jessie Test",
                Email = "test@test.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                Role = UserRole.Customer,
                IsMember = false,
                MembershipLevel = 0,
                AvatarUrl = "/693aebc11ce502fda14fda3648cbfb4d.png",
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow,
            },
            new User
            {
                Name = "Jessie Admin",
                Email = "admin@admin.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                Role = UserRole.Admin,
                IsMember = true,
                MembershipLevel = 3,
                AvatarUrl = "/693aebc11ce502fda14fda3648cbfb4d.png",
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow,
            },
        };

        foreach (var seedUser in seedUsers)
        {
            var existingUser = await _userRepository.GetByEmailAsync(seedUser.Email, cancellationToken);
            if (existingUser is not null)
            {
                continue;
            }

            await _userRepository.CreateAsync(seedUser, cancellationToken);
        }
    }
}
