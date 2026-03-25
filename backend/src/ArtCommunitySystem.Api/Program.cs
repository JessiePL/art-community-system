using System.Text;
using ArtCommunitySystem.Api.Infrastructure.Auth;
using ArtCommunitySystem.Api.Infrastructure.Persistence;
using ArtCommunitySystem.Api.Infrastructure.Seed;
using ArtCommunitySystem.Api.Infrastructure.Services;
using ArtCommunitySystem.Api.Infrastructure.Storage;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection(MongoDbSettings.SectionName));
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(JwtSettings.SectionName));
builder.Services.Configure<CloudinarySettings>(
    builder.Configuration.GetSection(CloudinarySettings.SectionName));

var jwtSettings = builder.Configuration
    .GetSection(JwtSettings.SectionName)
    .Get<JwtSettings>()
    ?? throw new InvalidOperationException("JWT settings are missing.");

if (string.IsNullOrWhiteSpace(jwtSettings.SigningKey))
{
    throw new InvalidOperationException("JWT signing key is missing.");
}

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>()
    ?? ["http://localhost:5173"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SigningKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddSingleton<IMongoClient>(_ =>
{
    var settings = builder.Configuration
        .GetSection(MongoDbSettings.SectionName)
        .Get<MongoDbSettings>()
        ?? throw new InvalidOperationException("MongoDB settings are missing.");

    if (string.IsNullOrWhiteSpace(settings.ConnectionString))
    {
        throw new InvalidOperationException("MongoDB connection string is missing.");
    }

    return new MongoClient(settings.ConnectionString);
});

builder.Services.AddSingleton(sp =>
{
    var settings = builder.Configuration
        .GetSection(MongoDbSettings.SectionName)
        .Get<MongoDbSettings>()
        ?? throw new InvalidOperationException("MongoDB settings are missing.");

    if (string.IsNullOrWhiteSpace(settings.DatabaseName))
    {
        throw new InvalidOperationException("MongoDB database name is missing.");
    }

    var client = sp.GetRequiredService<IMongoClient>();
    return client.GetDatabase(settings.DatabaseName);
});

builder.Services.AddSingleton<UserRepository>();
builder.Services.AddSingleton<ProductRepository>();
builder.Services.AddSingleton<OrderRepository>();
builder.Services.AddSingleton<CloudinaryImageStorage>();
builder.Services.AddSingleton<JwtTokenGenerator>();
builder.Services.AddSingleton<DevelopmentUserSeeder>();
builder.Services.AddSingleton<DevelopmentProductSeeder>();

var app = builder.Build();

var userRepository = app.Services.GetRequiredService<UserRepository>();
await userRepository.EnsureIndexesAsync();

var productRepository = app.Services.GetRequiredService<ProductRepository>();
await productRepository.EnsureIndexesAsync();

var orderRepository = app.Services.GetRequiredService<OrderRepository>();
await orderRepository.EnsureIndexesAsync();

if (app.Environment.IsDevelopment())
{
    var userSeeder = app.Services.GetRequiredService<DevelopmentUserSeeder>();
    await userSeeder.SeedAsync();

    var productSeeder = app.Services.GetRequiredService<DevelopmentProductSeeder>();
    await productSeeder.SeedAsync();

    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    service = "ArtCommunitySystem.Api"
}));

app.Run();
