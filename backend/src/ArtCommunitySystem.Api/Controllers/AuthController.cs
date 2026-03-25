using System.Security.Claims;
using ArtCommunitySystem.Api.Contracts.Auth;
using ArtCommunitySystem.Api.Domain.Entities;
using ArtCommunitySystem.Api.Domain.Enums;
using ArtCommunitySystem.Api.Infrastructure.Auth;
using ArtCommunitySystem.Api.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace ArtCommunitySystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private const string DefaultAvatarUrl = "/693aebc11ce502fda14fda3648cbfb4d.png";

    private readonly UserRepository _userRepository;
    private readonly JwtTokenGenerator _tokenGenerator;
    private readonly JwtSettings _jwtSettings;

    public AuthController(
        UserRepository userRepository,
        JwtTokenGenerator tokenGenerator,
        IOptions<JwtSettings> jwtOptions)
    {
        _userRepository = userRepository;
        _tokenGenerator = tokenGenerator;
        _jwtSettings = jwtOptions.Value;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(normalizedEmail) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Name, email, and password are required." });
        }

        if (request.Password.Length < 6)
        {
            return BadRequest(new { message = "Password must be at least 6 characters long." });
        }

        var existingUser = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);
        if (existingUser is not null)
        {
            return Conflict(new { message = "This email is already registered." });
        }

        var user = new User
        {
            Name = name,
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            AvatarUrl = DefaultAvatarUrl,
            Role = UserRole.Customer,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        try
        {
            await _userRepository.CreateAsync(user, cancellationToken);
        }
        catch (MongoWriteException ex) when (ex.WriteError.Category == ServerErrorCategory.DuplicateKey)
        {
            return Conflict(new { message = "This email is already registered." });
        }

        return Ok(CreateAuthResponse(user));
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        user.UpdatedAtUtc = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);
        return Ok(CreateAuthResponse(user));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserProfileResponse>> Me(CancellationToken cancellationToken)
    {
        var user = await GetCurrentUserAsync(cancellationToken);
        if (user is null)
        {
            return Unauthorized(new { message = "User not found." });
        }

        return Ok(ToUserProfile(user));
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<UserProfileResponse>> UpdateProfile(UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        var user = await GetCurrentUserAsync(cancellationToken);
        if (user is null)
        {
            return Unauthorized(new { message = "User not found." });
        }

        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new { message = "Display name is required." });
        }

        user.Name = name;
        user.AvatarUrl = string.IsNullOrWhiteSpace(request.AvatarUrl)
            ? user.AvatarUrl
            : request.AvatarUrl.Trim();

        await _userRepository.UpdateAsync(user, cancellationToken);
        return Ok(ToUserProfile(user));
    }

    [Authorize]
    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await GetCurrentUserAsync(cancellationToken);
        if (user is null)
        {
            return Unauthorized(new { message = "User not found." });
        }

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Current password is incorrect." });
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "New password must be at least 6 characters long." });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user, cancellationToken);
        return Ok(new { message = "Password updated successfully." });
    }

    [Authorize]
    [HttpPut("addresses")]
    public async Task<ActionResult<UserProfileResponse>> SaveAddress(UpsertAddressRequest request, CancellationToken cancellationToken)
    {
        var user = await GetCurrentUserAsync(cancellationToken);
        if (user is null)
        {
            return Unauthorized(new { message = "User not found." });
        }

        var line1 = request.Line1.Trim();
        var city = request.City.Trim();
        var region = request.Region.Trim();
        if (string.IsNullOrWhiteSpace(line1) || string.IsNullOrWhiteSpace(city) || string.IsNullOrWhiteSpace(region))
        {
            return BadRequest(new { message = "Address line 1, city, and region are required." });
        }

        var normalized = new Address
        {
            Id = string.IsNullOrWhiteSpace(request.Id) ? Guid.NewGuid().ToString("n") : request.Id.Trim(),
            Label = string.IsNullOrWhiteSpace(request.Label) ? "Address" : request.Label.Trim(),
            ReceiverName = string.IsNullOrWhiteSpace(request.Recipient) ? user.Name : request.Recipient.Trim(),
            ContactPhone = string.IsNullOrWhiteSpace(request.Phone) ? string.Empty : request.Phone.Trim(),
            Line1 = line1,
            Line2 = string.IsNullOrWhiteSpace(request.Line2) ? null : request.Line2.Trim(),
            City = city,
            ProvinceOrState = region,
            PostalCode = request.PostalCode.Trim(),
            Country = "Canada",
            IsDefault = request.IsPrimary || user.Addresses.Count == 0,
        };

        var addresses = user.Addresses.ToList();
        var existingIndex = addresses.FindIndex(address => address.Id == normalized.Id);
        if (existingIndex >= 0)
        {
            addresses[existingIndex] = normalized;
        }
        else
        {
            addresses.Add(normalized);
        }

        if (normalized.IsDefault)
        {
            addresses = addresses.Select(address =>
            {
                address.IsDefault = address.Id == normalized.Id;
                return address;
            }).ToList();
        }
        else if (!addresses.Any(address => address.IsDefault) && addresses.Count > 0)
        {
            addresses[0].IsDefault = true;
        }

        user.Addresses = addresses;
        await _userRepository.UpdateAsync(user, cancellationToken);
        return Ok(ToUserProfile(user));
    }

    [Authorize]
    [HttpDelete("addresses/{addressId}")]
    public async Task<ActionResult<UserProfileResponse>> DeleteAddress(string addressId, CancellationToken cancellationToken)
    {
        var user = await GetCurrentUserAsync(cancellationToken);
        if (user is null)
        {
            return Unauthorized(new { message = "User not found." });
        }

        var addresses = user.Addresses.Where(address => address.Id != addressId).ToList();
        if (addresses.Count == user.Addresses.Count)
        {
            return NotFound(new { message = "Address not found." });
        }

        if (!addresses.Any(address => address.IsDefault) && addresses.Count > 0)
        {
            addresses[0].IsDefault = true;
        }

        user.Addresses = addresses;
        await _userRepository.UpdateAsync(user, cancellationToken);
        return Ok(ToUserProfile(user));
    }

    [Authorize]
    [HttpPost("addresses/{addressId}/primary")]
    public async Task<ActionResult<UserProfileResponse>> SetPrimaryAddress(string addressId, CancellationToken cancellationToken)
    {
        var user = await GetCurrentUserAsync(cancellationToken);
        if (user is null)
        {
            return Unauthorized(new { message = "User not found." });
        }

        var addresses = user.Addresses.ToList();
        if (!addresses.Any(address => address.Id == addressId))
        {
            return NotFound(new { message = "Address not found." });
        }

        foreach (var address in addresses)
        {
            address.IsDefault = address.Id == addressId;
        }

        user.Addresses = addresses;
        await _userRepository.UpdateAsync(user, cancellationToken);
        return Ok(ToUserProfile(user));
    }

    [Authorize(Roles = nameof(UserRole.Admin))]
    [HttpGet("admin/review")]
    public IActionResult ReviewPermissions()
    {
        return Ok(new
        {
            message = "Admin permission check passed.",
            role = User.FindFirstValue(ClaimTypes.Role),
            reviewedAtUtc = DateTime.UtcNow
        });
    }

    private async Task<User?> GetCurrentUserAsync(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return null;
        }

        return await _userRepository.GetByIdAsync(userId, cancellationToken);
    }

    private AuthResponse CreateAuthResponse(User user)
    {
        return new AuthResponse
        {
            Token = _tokenGenerator.GenerateToken(user),
            ExpiresAtUtc = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
            User = ToUserProfile(user)
        };
    }

    private static UserProfileResponse ToUserProfile(User user)
    {
        return new UserProfileResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            AvatarUrl = string.IsNullOrWhiteSpace(user.AvatarUrl) ? DefaultAvatarUrl : user.AvatarUrl,
            Role = user.Role.ToString(),
            IsMember = user.IsMember,
            MembershipLevel = user.MembershipLevel,
            Addresses = user.Addresses.Select(address => new AddressResponse
            {
                Id = address.Id,
                Label = address.Label,
                Recipient = address.ReceiverName,
                Phone = address.ContactPhone,
                Line1 = address.Line1,
                Line2 = address.Line2,
                City = address.City,
                Region = address.ProvinceOrState,
                PostalCode = address.PostalCode,
                IsPrimary = address.IsDefault,
            }).ToArray(),
        };
    }
}
