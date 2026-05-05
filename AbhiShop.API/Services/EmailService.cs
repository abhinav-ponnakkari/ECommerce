using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace AbhiShop.API.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task SendOtpEmailAsync(string toEmail, string toName, string otpCode)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = $"{otpCode} is your AbhiShop verification code";

        message.Body = new TextPart("html") { Text = BuildHtmlBody(toName, otpCode) };

        using var client = new SmtpClient();
        try
        {
            await client.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_settings.Username, _settings.Password);
            await client.SendAsync(message);
        }
        finally
        {
            await client.DisconnectAsync(true);
        }

        _logger.LogInformation("OTP email sent to {Email}", toEmail);
    }

    private static string BuildHtmlBody(string name, string code) => $"""
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
            <tr><td align="center">
              <table width="480" cellpadding="0" cellspacing="0"
                     style="background:#ffffff;border-radius:16px;overflow:hidden;
                            box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#FF6B35,#e85d2a);
                             padding:28px 32px;text-align:center;">
                    <span style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
                      Abhi<span style="color:#ffe4d6;">Shop</span>
                    </span>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:36px 40px 28px;">
                    <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1a1a1a;">
                      Hi {name},
                    </p>
                    <p style="margin:0 0 28px;font-size:14px;color:#555;line-height:1.6;">
                      Use the code below to sign in to AbhiShop.
                      It expires in <strong>2 minutes</strong>.
                    </p>

                    <!-- OTP box -->
                    <div style="text-align:center;margin-bottom:28px;">
                      <div style="display:inline-block;background:#fff8f5;
                                  border:2px solid #FF6B35;border-radius:14px;
                                  padding:18px 40px;">
                        <span style="font-size:40px;font-weight:800;letter-spacing:10px;
                                     color:#FF6B35;font-family:monospace;">
                          {code}
                        </span>
                      </div>
                    </div>

                    <p style="margin:0 0 6px;font-size:13px;color:#888;text-align:center;">
                      If you didn't request this, you can safely ignore this email.
                    </p>
                    <p style="margin:0;font-size:13px;color:#888;text-align:center;">
                      Never share this code with anyone.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f9f9f9;padding:16px 40px;text-align:center;
                             border-top:1px solid #eee;">
                    <p style="margin:0;font-size:12px;color:#bbb;">
                      &copy; 2024 AbhiShop. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """;
}
