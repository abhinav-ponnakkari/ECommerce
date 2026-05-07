using AbhiShop.API.Data;
using AbhiShop.API.DTOs;
using AbhiShop.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AbhiShop.API.Controllers;

[ApiController]
[Route("api/wishlist")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly AppDbContext _context;

    public WishlistController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<WishlistItemDto>>> GetWishlist()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var items = await _context.WishlistItems
            .Where(w => w.UserId == userId)
            .Include(w => w.Product)
            .Select(w => new WishlistItemDto
            {
                Id = w.Id,
                ProductId = w.ProductId,
                Name = w.Product.Name,
                Price = w.Product.Price,
                DiscountPrice = w.Product.DiscountPrice,
                ImageUrl = w.Product.ImageUrl,
                Brand = w.Product.Brand,
                Rating = (float)w.Product.Rating,
                ReviewCount = w.Product.ReviewCount,
                StockQuantity = w.Product.StockQuantity,
                AddedAt = w.AddedAt
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost("{productId}")]
    public async Task<ActionResult<object>> ToggleWishlist(int productId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var existing = await _context.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);

        if (existing != null)
        {
            _context.WishlistItems.Remove(existing);
            await _context.SaveChangesAsync();
            return Ok(new { added = false, message = "Removed from wishlist" });
        }

        var product = await _context.Products.FindAsync(productId);
        if (product == null) return NotFound(new { message = "Product not found" });

        var item = new WishlistItem
        {
            UserId = userId,
            ProductId = productId,
            AddedAt = DateTime.UtcNow
        };

        _context.WishlistItems.Add(item);
        await _context.SaveChangesAsync();
        return Ok(new { added = true, message = "Added to wishlist" });
    }

    [HttpDelete("{productId}")]
    public async Task<IActionResult> RemoveFromWishlist(int productId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var item = await _context.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);

        if (item == null) return NotFound();

        _context.WishlistItems.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
