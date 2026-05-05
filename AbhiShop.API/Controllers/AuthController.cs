using AbhiShop.API.Data;
using AbhiShop.API.DTOs;
using AbhiShop.API.Models;
using AbhiShop.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AbhiShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IOtpService _otpService;
    private readonly IEmailService _emailService;
    private readonly IWebHostEnvironment _env;

    public AuthController(AppDbContext context, ITokenService tokenService,
        IOtpService otpService, IEmailService emailService, IWebHostEnvironment env)
    {
        _context = context;
        _tokenService = tokenService;
        _otpService = otpService;
        _emailService = emailService;
        _env = env;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email.ToLower()))
            return BadRequest(new { message = "Email already registered." });

        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            PhoneNumber = dto.PhoneNumber,
            AvatarUrl = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(dto.FirstName + "+" + dto.LastName)}&background=FF6B35&color=fff"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new AuthResponseDto
        {
            Token = _tokenService.GenerateToken(user),
            User = MapToUserDto(user)
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var loginId = dto.LoginId.Trim();

        // Match by email (contains @) or by phone number
        var user = loginId.Contains('@')
            ? await _context.Users.FirstOrDefaultAsync(u => u.Email == loginId.ToLower())
            : await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == loginId);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials. Please check your email/mobile and password." });

        if (!user.IsActive)
            return Unauthorized(new { message = "Your account has been deactivated. Please contact support." });

        return Ok(new AuthResponseDto
        {
            Token = _tokenService.GenerateToken(user),
            User = MapToUserDto(user)
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();
        return Ok(MapToUserDto(user));
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<UserDto>> UpdateProfile(UpdateProfileDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.PhoneNumber = dto.PhoneNumber;
        await _context.SaveChangesAsync();

        return Ok(MapToUserDto(user));
    }

    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Current password is incorrect." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password updated successfully." });
    }

    // ── OTP ──────────────────────────────────────────────────────────────

    [HttpPost("send-otp")]
    public async Task<ActionResult<SendOtpResponseDto>> SendOtp(SendOtpDto dto)
    {
        var phone = dto.PhoneNumber.Trim();

        // Phone must belong to a registered account
        var user = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == phone);
        if (user == null)
            return NotFound(new { message = "No account found with this mobile number. Please register first." });

        if (!user.IsActive)
            return Unauthorized(new { message = "Your account has been deactivated." });

        try
        {
            var code = await _otpService.GenerateAndSaveAsync(phone);
            await _otpService.SendSmsAsync(phone, code);

            var response = new SendOtpResponseDto
            {
                Success = true,
                Message = $"OTP sent to {MaskPhone(phone)}",
                ExpiresInSeconds = 120,
            };

            // Return the OTP in the response body only in Development
            if (_env.IsDevelopment())
                response.DevOtp = code;

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("verify-otp")]
    public async Task<ActionResult<AuthResponseDto>> VerifyOtp(VerifyOtpDto dto)
    {
        var phone = dto.PhoneNumber.Trim();
        var valid = await _otpService.VerifyAsync(phone, dto.Code.Trim());

        if (!valid)
            return BadRequest(new { message = "Invalid or expired OTP. Please try again." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == phone);
        if (user == null) return NotFound();

        return Ok(new AuthResponseDto
        {
            Token = _tokenService.GenerateToken(user),
            User = MapToUserDto(user)
        });
    }

    // ── Email OTP ─────────────────────────────────────────────────────────

    [HttpPost("send-email-otp")]
    public async Task<ActionResult<SendOtpResponseDto>> SendEmailOtp(SendEmailOtpDto dto)
    {
        var email = dto.Email.Trim().ToLower();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
            return NotFound(new { message = "No account found with this email. Please register first." });

        if (!user.IsActive)
            return Unauthorized(new { message = "Your account has been deactivated." });

        try
        {
            var code = await _otpService.GenerateAndSaveForEmailAsync(email);

            if (_env.IsDevelopment())
            {
                // Skip actual SMTP in dev — return code directly
                return Ok(new SendOtpResponseDto
                {
                    Success = true,
                    Message = $"OTP sent to {MaskEmail(email)}",
                    ExpiresInSeconds = 120,
                    DevOtp = code,
                });
            }

            await _emailService.SendOtpEmailAsync(email, user.FirstName, code);

            return Ok(new SendOtpResponseDto
            {
                Success = true,
                Message = $"OTP sent to {MaskEmail(email)}",
                ExpiresInSeconds = 120,
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to send email. Please try again.", detail = ex.Message });
        }
    }

    [HttpPost("verify-email-otp")]
    public async Task<ActionResult<AuthResponseDto>> VerifyEmailOtp(VerifyEmailOtpDto dto)
    {
        var email = dto.Email.Trim().ToLower();
        var valid = await _otpService.VerifyForEmailAsync(email, dto.Code.Trim());

        if (!valid)
            return BadRequest(new { message = "Invalid or expired OTP. Please try again." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return NotFound();

        return Ok(new AuthResponseDto
        {
            Token = _tokenService.GenerateToken(user),
            User = MapToUserDto(user)
        });
    }

    // ─────────────────────────────────────────────────────────────────────

    private static string MaskPhone(string phone)
    {
        if (phone.Length <= 4) return "****";
        return $"{"*".PadLeft(phone.Length - 4, '*')}{phone[^4..]}";
    }

    private static string MaskEmail(string email)
    {
        var at = email.IndexOf('@');
        if (at <= 2) return $"**{email[at..]}";
        return $"{email[0]}{"*".PadLeft(at - 1, '*')}{email[at..]}";
    }

    private static UserDto MapToUserDto(User user) => new()
    {
        Id = user.Id,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email,
        PhoneNumber = user.PhoneNumber,
        Role = user.Role,
        AvatarUrl = user.AvatarUrl,
        CreatedAt = user.CreatedAt
    };
}
