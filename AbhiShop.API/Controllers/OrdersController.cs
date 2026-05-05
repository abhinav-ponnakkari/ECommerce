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
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetMyOrders()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return Ok(orders.Select(MapToOrderDto).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrder(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == id && (o.UserId == userId || role == "Admin"));

        if (order == null) return NotFound();

        return Ok(MapToOrderDto(order));
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder(CreateOrderDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var cartItems = await _context.CartItems
            .Include(ci => ci.Product)
            .Where(ci => ci.UserId == userId)
            .ToListAsync();

        if (!cartItems.Any())
            return BadRequest(new { message = "Cart is empty." });

        foreach (var item in cartItems)
        {
            if (item.Product.StockQuantity < item.Quantity)
                return BadRequest(new { message = $"Insufficient stock for {item.Product.Name}." });
        }

        var subTotal = cartItems.Sum(ci =>
        {
            var price = ci.Product.DiscountPrice ?? ci.Product.Price;
            return price * ci.Quantity;
        });
        var shippingCost = subTotal > 50 ? 0 : 9.99m;
        var tax = Math.Round(subTotal * 0.08m, 2);
        var total = subTotal + shippingCost + tax;

        var order = new Order
        {
            OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}",
            UserId = userId,
            ShippingAddress = dto.ShippingAddress,
            PaymentMethod = dto.PaymentMethod,
            Notes = dto.Notes,
            SubTotal = subTotal,
            ShippingCost = shippingCost,
            Tax = tax,
            TotalAmount = total,
            Status = OrderStatus.Confirmed,
            PaymentStatus = PaymentStatus.Paid,
        };

        order.OrderItems = cartItems.Select(ci =>
        {
            var price = ci.Product.DiscountPrice ?? ci.Product.Price;
            ci.Product.StockQuantity -= ci.Quantity;
            return new OrderItem
            {
                ProductId = ci.ProductId,
                ProductName = ci.Product.Name,
                ProductImage = ci.Product.ImageUrl,
                Quantity = ci.Quantity,
                UnitPrice = price,
                TotalPrice = price * ci.Quantity
            };
        }).ToList();

        _context.Orders.Add(order);
        _context.CartItems.RemoveRange(cartItems);

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, MapToOrderDto(order));
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("all")]
    public async Task<ActionResult<List<OrderDto>>> GetAllOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.User)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return Ok(orders.Select(MapToOrderDto).ToList());
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] string status)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound();

        if (Enum.TryParse<OrderStatus>(status, true, out var orderStatus))
            order.Status = orderStatus;

        order.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order == null) return NotFound();

        if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Confirmed)
            return BadRequest(new { message = "Order cannot be cancelled at this stage." });

        order.Status = OrderStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;

        foreach (var item in order.OrderItems)
        {
            var product = await _context.Products.FindAsync(item.ProductId);
            if (product != null) product.StockQuantity += item.Quantity;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static OrderDto MapToOrderDto(Order o) => new()
    {
        Id = o.Id,
        OrderNumber = o.OrderNumber,
        Status = o.Status.ToString(),
        PaymentStatus = o.PaymentStatus.ToString(),
        PaymentMethod = o.PaymentMethod,
        SubTotal = o.SubTotal,
        ShippingCost = o.ShippingCost,
        Tax = o.Tax,
        TotalAmount = o.TotalAmount,
        ShippingAddress = o.ShippingAddress,
        Notes = o.Notes,
        CreatedAt = o.CreatedAt,
        Items = o.OrderItems.Select(oi => new OrderItemDto
        {
            Id = oi.Id,
            ProductId = oi.ProductId,
            ProductName = oi.ProductName,
            ProductImage = oi.ProductImage,
            Quantity = oi.Quantity,
            UnitPrice = oi.UnitPrice,
            TotalPrice = oi.TotalPrice
        }).ToList()
    };
}
