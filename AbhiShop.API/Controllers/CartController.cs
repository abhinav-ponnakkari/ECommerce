using AbhiShop.API.Data;
using AbhiShop.API.DTOs;
using AbhiShop.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AbhiShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly AppDbContext _context;

    public CartController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<CartDto>> GetCart()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var items = await _context.CartItems
            .Include(ci => ci.Product)
            .Where(ci => ci.UserId == userId)
            .ToListAsync();

        return Ok(BuildCartDto(items));
    }

    [HttpPost]
    public async Task<ActionResult<CartDto>> AddToCart(AddToCartDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var product = await _context.Products.FindAsync(dto.ProductId);
        if (product == null || !product.IsActive)
            return NotFound(new { message = "Product not found." });

        if (product.StockQuantity < dto.Quantity)
            return BadRequest(new { message = "Insufficient stock." });

        var existing = await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == dto.ProductId);

        if (existing != null)
        {
            existing.Quantity += dto.Quantity;
            if (existing.Quantity > product.StockQuantity)
                existing.Quantity = product.StockQuantity;
        }
        else
        {
            _context.CartItems.Add(new CartItem
            {
                UserId = userId,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity
            });
        }

        await _context.SaveChangesAsync();

        var items = await _context.CartItems
            .Include(ci => ci.Product)
            .Where(ci => ci.UserId == userId)
            .ToListAsync();

        return Ok(BuildCartDto(items));
    }

    [HttpPut("{itemId}")]
    public async Task<ActionResult<CartDto>> UpdateCartItem(int itemId, UpdateCartItemDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var item = await _context.CartItems
            .Include(ci => ci.Product)
            .FirstOrDefaultAsync(ci => ci.Id == itemId && ci.UserId == userId);

        if (item == null) return NotFound();

        if (dto.Quantity <= 0)
        {
            _context.CartItems.Remove(item);
        }
        else
        {
            item.Quantity = Math.Min(dto.Quantity, item.Product.StockQuantity);
        }

        await _context.SaveChangesAsync();

        var items = await _context.CartItems
            .Include(ci => ci.Product)
            .Where(ci => ci.UserId == userId)
            .ToListAsync();

        return Ok(BuildCartDto(items));
    }

    [HttpDelete("{itemId}")]
    public async Task<ActionResult<CartDto>> RemoveFromCart(int itemId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var item = await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.Id == itemId && ci.UserId == userId);

        if (item == null) return NotFound();

        _context.CartItems.Remove(item);
        await _context.SaveChangesAsync();

        var items = await _context.CartItems
            .Include(ci => ci.Product)
            .Where(ci => ci.UserId == userId)
            .ToListAsync();

        return Ok(BuildCartDto(items));
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var items = await _context.CartItems.Where(ci => ci.UserId == userId).ToListAsync();
        _context.CartItems.RemoveRange(items);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static CartDto BuildCartDto(List<CartItem> items)
    {
        var cartItems = items.Select(ci =>
        {
            var price = ci.Product.DiscountPrice ?? ci.Product.Price;
            return new CartItemDto
            {
                Id = ci.Id,
                ProductId = ci.ProductId,
                ProductName = ci.Product.Name,
                ProductImage = ci.Product.ImageUrl,
                ProductPrice = ci.Product.Price,
                ProductDiscountPrice = ci.Product.DiscountPrice,
                Quantity = ci.Quantity,
                StockQuantity = ci.Product.StockQuantity,
                SubTotal = price * ci.Quantity
            };
        }).ToList();

        var subTotal = cartItems.Sum(i => i.SubTotal);
        var shippingCost = subTotal > 50 ? 0 : 9.99m;
        var tax = subTotal * 0.08m;

        return new CartDto
        {
            Items = cartItems,
            SubTotal = subTotal,
            ShippingCost = shippingCost,
            Tax = Math.Round(tax, 2),
            Total = Math.Round(subTotal + shippingCost + tax, 2),
            ItemCount = cartItems.Sum(i => i.Quantity)
        };
    }
}
