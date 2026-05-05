using System.ComponentModel.DataAnnotations;

namespace AbhiShop.API.DTOs;

public class SendOtpDto
{
    [Required]
    public string PhoneNumber { get; set; } = string.Empty;
}

public class VerifyOtpDto
{
    [Required]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required, StringLength(6, MinimumLength = 6)]
    public string Code { get; set; } = string.Empty;
}

public class SendOtpResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int ExpiresInSeconds { get; set; }
    /// <summary>Only populated in Development for easy testing — never send in Production.</summary>
    public string? DevOtp { get; set; }
}
