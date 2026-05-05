using AbhiShop.API.Data;
using AbhiShop.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AbhiShop.API.Services;

public class OtpService : IOtpService
{
    private const int OtpValidSeconds = 120; // 2 minutes
    private const int MaxAttemptsPerHour = 5;

    private readonly AppDbContext _context;
    private readonly ILogger<OtpService> _logger;
    private readonly IWebHostEnvironment _env;

    public OtpService(AppDbContext context, ILogger<OtpService> logger, IWebHostEnvironment env)
    {
        _context = context;
        _logger = logger;
        _env = env;
    }

    public async Task<string> GenerateAndSaveAsync(string phoneNumber)
    {
        // Rate-limit: max 5 OTPs per phone per hour
        var recentCount = await _context.OtpCodes
            .CountAsync(o => o.PhoneNumber == phoneNumber && o.CreatedAt >= DateTime.UtcNow.AddHours(-1));

        if (recentCount >= MaxAttemptsPerHour)
            throw new InvalidOperationException("Too many OTP requests. Please try again later.");

        // Invalidate any previous unused OTPs for this number
        var previous = await _context.OtpCodes
            .Where(o => o.PhoneNumber == phoneNumber && !o.IsUsed && o.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();
        previous.ForEach(o => o.IsUsed = true);

        var code = GenerateCode();

        _context.OtpCodes.Add(new OtpCode
        {
            PhoneNumber = phoneNumber,
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddSeconds(OtpValidSeconds),
        });

        await _context.SaveChangesAsync();
        return code;
    }

    public async Task<bool> VerifyAsync(string phoneNumber, string code)
    {
        var otp = await _context.OtpCodes
            .Where(o =>
                o.PhoneNumber == phoneNumber &&
                o.Code == code &&
                !o.IsUsed &&
                o.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otp == null) return false;

        otp.IsUsed = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public Task SendSmsAsync(string phoneNumber, string code)
    {
        // ── In Development: just log the OTP to the console ──────────────
        // ── In Production: swap this body with a real provider call ──────
        //
        //   Twilio:   await _twilioClient.Messages.CreateAsync(...)
        //   AWS SNS:  await _snsClient.PublishAsync(...)
        //   MSG91:    await httpClient.PostAsync("https://api.msg91.com/...", ...)

        _logger.LogWarning(
            "📱 [DEV SMS] OTP for {Phone}: {Code}  (valid {Sec}s)",
            phoneNumber, code, OtpValidSeconds);

        return Task.CompletedTask;
    }

    // ── helpers ─────────────────────────────────────────────────────────
    private static string GenerateCode()
    {
        // Cryptographically random 6-digit code
        var bytes = new byte[4];
        System.Security.Cryptography.RandomNumberGenerator.Fill(bytes);
        var value = Math.Abs(BitConverter.ToInt32(bytes, 0)) % 1_000_000;
        return value.ToString("D6");
    }
}
