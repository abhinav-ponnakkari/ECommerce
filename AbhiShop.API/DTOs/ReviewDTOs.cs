using System.ComponentModel.DataAnnotations;

namespace AbhiShop.API.DTOs;

public class ReviewDto
{
    public int Id { get; set; }
    public int Rating { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public bool IsVerifiedPurchase { get; set; }
    public string UserName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateReviewDto
{
    [Required, Range(1, 5)]
    public int Rating { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Comment { get; set; } = string.Empty;

    [Required]
    public int ProductId { get; set; }
}
