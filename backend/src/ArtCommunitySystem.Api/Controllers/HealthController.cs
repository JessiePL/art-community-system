using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace ArtCommunitySystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly IMongoDatabase _database;

    public HealthController(IMongoDatabase database)
    {
        _database = database;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var pingResult = await _database.RunCommandAsync<BsonDocument>(
            new BsonDocument("ping", 1));

        return Ok(new
        {
            status = "ok",
            timestampUtc = DateTime.UtcNow,
            database = _database.DatabaseNamespace.DatabaseName,
            mongo = pingResult.ToString()
        });
    }
}
