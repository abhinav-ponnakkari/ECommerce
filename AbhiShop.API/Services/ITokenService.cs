using AbhiShop.API.Models;

namespace AbhiShop.API.Services;

public interface ITokenService
{
    string GenerateToken(User user);
}
