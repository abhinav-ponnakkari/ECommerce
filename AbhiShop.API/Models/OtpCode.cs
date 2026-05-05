namespace AbhiShop.API.Models;

public enum OtpChannel { Phone, Email }

public class OtpCode
{
    public int Id { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public OtpChannel Channel { get; set; } = OtpChannel.Phone;
    public string Code { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
