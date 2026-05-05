namespace AbhiShop.API.Services;

public interface IOtpService
{
    Task<string> GenerateAndSaveAsync(string phoneNumber);
    Task<bool> VerifyAsync(string phoneNumber, string code);
    Task SendSmsAsync(string phoneNumber, string code);
}
