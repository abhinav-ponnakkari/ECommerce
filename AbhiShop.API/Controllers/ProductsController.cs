using AbhiShop.API.Data;
using AbhiShop.API.DTOs;
using AbhiShop.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AbhiShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductSummaryDto>>> GetProducts([FromQuery] ProductQueryParams query)
    {
        var products = _context.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
            products = products.Where(p =>
                p.Name.Contains(query.Search) ||
                p.Description.Contains(query.Search) ||
                p.Brand.Contains(query.Search));

        if (query.CategoryId.HasValue)
            products = products.Where(p => p.CategoryId == query.CategoryId.Value);

        if (query.MinPrice.HasValue)
            products = products.Where(p => p.Price >= query.MinPrice.Value);

        if (query.MaxPrice.HasValue)
            products = products.Where(p => p.Price <= query.MaxPrice.Value);

        if (!string.IsNullOrWhiteSpace(query.Brand))
            products = products.Where(p => p.Brand == query.Brand);

        if (query.IsFeatured.HasValue)
            products = products.Where(p => p.IsFeatured == query.IsFeatured.Value);

        if (query.InStock.HasValue && query.InStock.Value)
            products = products.Where(p => p.StockQuantity > 0);

        products = query.SortBy?.ToLower() switch
        {
            "price" => query.SortOrder == "asc" ? products.OrderBy(p => p.Price) : products.OrderByDescending(p => p.Price),
            "name" => query.SortOrder == "asc" ? products.OrderBy(p => p.Name) : products.OrderByDescending(p => p.Name),
            "rating" => products.OrderByDescending(p => p.Rating),
            "popular" => products.OrderByDescending(p => p.ReviewCount),
            _ => products.OrderByDescending(p => p.CreatedAt)
        };

        var totalCount = await products.CountAsync();

        var items = await products
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(p => new ProductSummaryDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                DiscountPrice = p.DiscountPrice,
                ImageUrl = p.ImageUrl,
                Brand = p.Brand,
                Rating = p.Rating,
                ReviewCount = p.ReviewCount,
                StockQuantity = p.StockQuantity,
                IsFeatured = p.IsFeatured,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name
            })
            .ToListAsync();

        return Ok(new PagedResult<ProductSummaryDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Reviews)
            .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);

        if (product == null) return NotFound();

        return Ok(MapToProductDto(product));
    }

    [HttpGet("featured")]
    public async Task<ActionResult<List<ProductSummaryDto>>> GetFeaturedProducts()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive && p.IsFeatured)
            .OrderByDescending(p => p.Rating)
            .Take(8)
            .Select(p => new ProductSummaryDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                DiscountPrice = p.DiscountPrice,
                ImageUrl = p.ImageUrl,
                Brand = p.Brand,
                Rating = p.Rating,
                ReviewCount = p.ReviewCount,
                StockQuantity = p.StockQuantity,
                IsFeatured = p.IsFeatured,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name
            })
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("brands")]
    public async Task<ActionResult<List<string>>> GetBrands([FromQuery] int? categoryId)
    {
        var query = _context.Products.Where(p => p.IsActive);
        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        var brands = await query.Select(p => p.Brand).Distinct().OrderBy(b => b).ToListAsync();
        return Ok(brands);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            DiscountPrice = dto.DiscountPrice,
            ImageUrl = dto.ImageUrl,
            Images = dto.Images,
            StockQuantity = dto.StockQuantity,
            Brand = dto.Brand,
            SKU = dto.SKU,
            IsFeatured = dto.IsFeatured,
            CategoryId = dto.CategoryId
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        await _context.Entry(product).Reference(p => p.Category).LoadAsync();

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, MapToProductDto(product));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, UpdateProductDto dto)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.DiscountPrice = dto.DiscountPrice;
        product.ImageUrl = dto.ImageUrl;
        product.Images = dto.Images;
        product.StockQuantity = dto.StockQuantity;
        product.Brand = dto.Brand;
        product.SKU = dto.SKU;
        product.IsFeatured = dto.IsFeatured;
        product.CategoryId = dto.CategoryId;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();

        product.IsActive = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static ProductDto MapToProductDto(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        Price = p.Price,
        DiscountPrice = p.DiscountPrice,
        ImageUrl = p.ImageUrl,
        Images = p.Images,
        StockQuantity = p.StockQuantity,
        Brand = p.Brand,
        SKU = p.SKU,
        Rating = p.Rating,
        ReviewCount = p.ReviewCount,
        IsFeatured = p.IsFeatured,
        CategoryId = p.CategoryId,
        CategoryName = p.Category?.Name ?? string.Empty,
        CreatedAt = p.CreatedAt
    };
}
