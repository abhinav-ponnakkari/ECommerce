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
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReviewsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("product/{productId}")]
    public async Task<ActionResult<List<ReviewDto>>> GetProductReviews(int productId)
    {
        var reviews = await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                Rating = r.Rating,
                Title = r.Title,
                Comment = r.Comment,
                IsVerifiedPurchase = r.IsVerifiedPurchase,
                UserName = $"{r.User.FirstName} {r.User.LastName[0]}.",
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(reviews);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ReviewDto>> CreateReview(CreateReviewDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var product = await _context.Products.FindAsync(dto.ProductId);
        if (product == null) return NotFound();

        var existing = await _context.Reviews
            .FirstOrDefaultAsync(r => r.UserId == userId && r.ProductId == dto.ProductId);
        if (existing != null)
            return BadRequest(new { message = "You have already reviewed this product." });

        var isVerified = await _context.OrderItems
            .AnyAsync(oi => oi.ProductId == dto.ProductId && oi.Order.UserId == userId);

        var review = new Review
        {
            UserId = userId,
            ProductId = dto.ProductId,
            Rating = dto.Rating,
            Title = dto.Title,
            Comment = dto.Comment,
            IsVerifiedPurchase = isVerified
        };

        _context.Reviews.Add(review);

        var allReviews = await _context.Reviews
            .Where(r => r.ProductId == dto.ProductId)
            .ToListAsync();

        product.Rating = Math.Round((allReviews.Sum(r => r.Rating) + dto.Rating) / (double)(allReviews.Count + 1), 1);
        product.ReviewCount = allReviews.Count + 1;

        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);

        return Ok(new ReviewDto
        {
            Id = review.Id,
            Rating = review.Rating,
            Title = review.Title,
            Comment = review.Comment,
            IsVerifiedPurchase = review.IsVerifiedPurchase,
            UserName = $"{user!.FirstName} {user.LastName[0]}.",
            CreatedAt = review.CreatedAt
        });
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == id && (r.UserId == userId || role == "Admin"));

        if (review == null) return NotFound();

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
