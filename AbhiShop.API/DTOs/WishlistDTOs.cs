namespace AbhiShop.API.DTOs;
public class WishlistItemDto {
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public float Rating { get; set; }
    public int ReviewCount { get; set; }
    public int StockQuantity { get; set; }
    public DateTime AddedAt { get; set; }
}
