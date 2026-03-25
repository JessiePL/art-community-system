using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;

namespace ArtCommunitySystem.Api.Infrastructure.Storage;

public class CloudinaryImageStorage
{
    private readonly CloudinarySettings _settings;
    private readonly Cloudinary? _cloudinary;

    public CloudinaryImageStorage(IOptions<CloudinarySettings> options)
    {
        _settings = options.Value;

        if (!string.IsNullOrWhiteSpace(_settings.CloudName)
            && !string.IsNullOrWhiteSpace(_settings.ApiKey)
            && !string.IsNullOrWhiteSpace(_settings.ApiSecret))
        {
            _cloudinary = new Cloudinary(new Account(_settings.CloudName, _settings.ApiKey, _settings.ApiSecret))
            {
                Api = { Secure = true }
            };
        }
    }

    public bool IsConfigured => _cloudinary is not null;

    public async Task<string> UploadProductImageAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default)
    {
        if (_cloudinary is null)
        {
            throw new InvalidOperationException("Cloudinary is not configured.");
        }

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, fileStream),
            Folder = _settings.ProductsFolder,
            UseFilename = true,
            UniqueFilename = true,
            Overwrite = false,
        };

        var result = await _cloudinary.UploadAsync(uploadParams, cancellationToken);
        if (result.Error is not null)
        {
            throw new InvalidOperationException(result.Error.Message);
        }

        return result.SecureUrl?.ToString()
            ?? throw new InvalidOperationException("Cloudinary upload did not return a secure URL.");
    }
}
