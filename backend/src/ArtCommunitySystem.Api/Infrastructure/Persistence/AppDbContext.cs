using ArtCommunitySystem.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ArtCommunitySystem.Api.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(x => x.Email).IsUnique();
            entity.Property(x => x.Name).HasMaxLength(120);
            entity.Property(x => x.Email).HasMaxLength(180);
            entity.Property(x => x.PasswordHash).HasMaxLength(255);
            entity.Property(x => x.AvatarUrl).HasMaxLength(500);
        });

        modelBuilder.Entity<Address>(entity =>
        {
            entity.Property(x => x.ReceiverName).HasMaxLength(120);
            entity.Property(x => x.ContactPhone).HasMaxLength(40);
            entity.Property(x => x.Line1).HasMaxLength(180);
            entity.Property(x => x.Line2).HasMaxLength(180);
            entity.Property(x => x.City).HasMaxLength(100);
            entity.Property(x => x.ProvinceOrState).HasMaxLength(100);
            entity.Property(x => x.PostalCode).HasMaxLength(30);
            entity.Property(x => x.Country).HasMaxLength(80);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.Property(x => x.ProductName).HasMaxLength(180);
            entity.Property(x => x.ImageUrl).HasMaxLength(500);
            entity.Property(x => x.Price).HasPrecision(10, 2);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasIndex(x => x.OrderNumber).IsUnique();
            entity.Property(x => x.OrderNumber).HasMaxLength(50);
            entity.Property(x => x.TrackingNumber).HasMaxLength(80);
            entity.Property(x => x.TotalAmount).HasPrecision(10, 2);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.Property(x => x.ProductNameSnapshot).HasMaxLength(180);
            entity.Property(x => x.UnitPrice).HasPrecision(10, 2);
            entity.Property(x => x.LineTotal).HasPrecision(10, 2);
        });

        modelBuilder.Entity<Address>()
            .HasOne(x => x.User)
            .WithMany(x => x.Addresses)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Order>()
            .HasOne(x => x.User)
            .WithMany(x => x.Orders)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Order>()
            .HasOne(x => x.Address)
            .WithMany()
            .HasForeignKey(x => x.AddressId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OrderItem>()
            .HasOne(x => x.Order)
            .WithMany(x => x.Items)
            .HasForeignKey(x => x.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OrderItem>()
            .HasOne(x => x.Product)
            .WithMany(x => x.OrderItems)
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
