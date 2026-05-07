using AbhiShop.API.Data;
using AbhiShop.API.DTOs;
using AbhiShop.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AbhiShop.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetStats()
    {
        var totalUsers = await _context.Users.CountAsync();
        var totalProducts = await _context.Products.CountAsync(p => p.IsActive);
        var totalOrders = await _context.Orders.CountAsync();
        var totalRevenue = await _context.Orders
            .Where(o => o.Status != OrderStatus.Cancelled)
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;
        var pendingOrders = await _context.Orders
            .CountAsync(o => o.Status == OrderStatus.Pending || o.Status == OrderStatus.Confirmed);
        var lowStockProducts = await _context.Products
            .CountAsync(p => p.IsActive && p.StockQuantity < 10);

        var recentOrders = await _context.Orders
            .Include(o => o.User)
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new RecentOrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerName = o.User.FirstName + " " + o.User.LastName,
                TotalAmount = o.TotalAmount,
                Status = o.Status.ToString(),
                CreatedAt = o.CreatedAt
            })
            .ToListAsync();

        var topProducts = await _context.OrderItems
            .Include(oi => oi.Product)
            .GroupBy(oi => new { oi.ProductId, oi.Product.Name, oi.Product.ImageUrl })
            .Select(g => new TopProductDto
            {
                Id = g.Key.ProductId,
                Name = g.Key.Name,
                ImageUrl = g.Key.ImageUrl,
                SoldCount = g.Sum(oi => oi.Quantity),
                Revenue = g.Sum(oi => oi.TotalPrice)
            })
            .OrderByDescending(p => p.SoldCount)
            .Take(5)
            .ToListAsync();

        return Ok(new DashboardStatsDto
        {
            TotalUsers = totalUsers,
            TotalProducts = totalProducts,
            TotalOrders = totalOrders,
            TotalRevenue = totalRevenue,
            PendingOrders = pendingOrders,
            LowStockProducts = lowStockProducts,
            RecentOrders = recentOrders,
            TopProducts = topProducts
        });
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<AdminUserDto>>> GetUsers()
    {
        var users = await _context.Users
            .Select(u => new AdminUserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                Role = u.Role,
                IsActive = u.IsActive,
                OrderCount = u.Orders.Count,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPut("users/{id}/toggle-active")]
    public async Task<ActionResult<object>> ToggleUserActive(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync();

        return Ok(new { isActive = user.IsActive });
    }
}
