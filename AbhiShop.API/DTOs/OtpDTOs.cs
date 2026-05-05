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
    public string? DevOtp { get; set; }
}

public class SendEmailOtpDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class VerifyEmailOtpDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(6, MinimumLength = 6)]
    public string Code { get; set; } = string.Empty;
}
