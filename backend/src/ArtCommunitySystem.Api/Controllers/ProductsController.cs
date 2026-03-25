using ArtCommunitySystem.Api.Contracts.Products;
using ArtCommunitySystem.Api.Domain.Entities;
using ArtCommunitySystem.Api.Domain.Enums;
using ArtCommunitySystem.Api.Infrastructure.Services;
using ArtCommunitySystem.Api.Infrastructure.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArtCommunitySystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ProductRepository _productRepository;
    private readonly CloudinaryImageStorage _imageStorage;

    public ProductsController(ProductRepository productRepository, CloudinaryImageStorage imageStorage)
    {
        _productRepository = productRepository;
        _imageStorage = imageStorage;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var products = await _productRepository.GetActiveAsync(cancellationToken);
        return Ok(products.Select(MapProduct));
    }

    [Authorize(Roles = nameof(UserRole.Admin))]
    [HttpPost("upload-image")]
    [RequestSizeLimit(5_000_000)]
    public async Task<ActionResult<UploadImageResponse>> UploadImage(IFormFile? file, CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(new { message = "An image file is required." });
        }

        if (!_imageStorage.IsConfigured)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Cloudinary is not configured on the backend yet." });
        }

        if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Only image uploads are supported." });
        }

        await using var fileStream = file.OpenReadStream();
        var imageUrl = await _imageStorage.UploadProductImageAsync(fileStream, file.FileName, cancellationToken);
        return Ok(new UploadImageResponse { ImageUrl = imageUrl });
    }

    [Authorize(Roles = nameof(UserRole.Admin))]
    [HttpPut("{productId}")]
    public async Task<ActionResult<ProductResponse>> Update(string productId, UpdateProductRequest request, CancellationToken cancellationToken)
    {
        var normalizedProductId = ProductIdMapper.Normalize(productId);
        var product = await _productRepository.GetByIdAsync(normalizedProductId, cancellationToken);
        if (product is null)
        {
            return NotFound(new { message = "Product not found." });
        }

        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new { message = "Product name is required." });
        }

        if (request.Price < 0)
        {
            return BadRequest(new { message = "Price must be zero or higher." });
        }

        product.ProductName = name;
        product.Price = request.Price;
        product.ImageUrl = request.Image.Trim();
        product.Note = request.Note.Trim();
        product.Lead = string.IsNullOrWhiteSpace(request.Lead) ? null : request.Lead.Trim();
        product.Detail = string.IsNullOrWhiteSpace(request.Detail) ? null : request.Detail.Trim();

        if (product.Category == ProductCategory.TShirt)
        {
            var sizeStock = new Dictionary<string, int>();
            foreach (ProductSize size in Enum.GetValues<ProductSize>())
            {
                var key = size.ToString();
                var value = request.SizeStock is not null && request.SizeStock.TryGetValue(key, out var parsed)
                    ? Math.Max(parsed, 0)
                    : 0;
                sizeStock[key] = value;
            }

            product.SizeStock = sizeStock;
            product.Stock = ProductRepository.CalculateTotalStock(sizeStock, request.Stock);
        }
        else
        {
            product.SizeStock = null;
            product.Stock = Math.Max(request.Stock, 0);
        }

        var updated = await _productRepository.UpdateAsync(product, request.Version, cancellationToken);
        if (updated is null)
        {
            return Conflict(new { message = "This product was updated elsewhere. Refresh and try again." });
        }

        return Ok(MapProduct(updated));
    }

    internal static ProductResponse MapProduct(Product product)
    {
        return new ProductResponse
        {
            Id = product.Id,
            Name = product.ProductName,
            Category = product.Category switch
            {
                ProductCategory.TShirt => "T-shirt",
                ProductCategory.CanvasBag => "Canvas Bag",
                _ => product.Category.ToString(),
            },
            Price = product.Price,
            Stock = product.Stock,
            Image = product.ImageUrl,
            Note = product.Note,
            Lead = product.Lead,
            Detail = product.Detail,
            SizeStock = product.SizeStock,
            Version = product.Version,
            UpdatedAtUtc = product.UpdatedAtUtc,
        };
    }
}
