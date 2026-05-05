using AbhiShop.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AbhiShop.API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();

        if (!await context.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new() { Name = "Electronics", Description = "Gadgets, phones, laptops and more", ImageUrl = "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400" },
                new() { Name = "Clothing", Description = "Fashion for men, women and kids", ImageUrl = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400" },
                new() { Name = "Books", Description = "Books, eBooks and audiobooks", ImageUrl = "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400" },
                new() { Name = "Home & Kitchen", Description = "Appliances and home essentials", ImageUrl = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400" },
                new() { Name = "Sports", Description = "Fitness and outdoor equipment", ImageUrl = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400" },
                new() { Name = "Beauty", Description = "Skincare, makeup and personal care", ImageUrl = "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400" },
                new() { Name = "Toys", Description = "Games and toys for all ages", ImageUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400" },
                new() { Name = "Automotive", Description = "Car accessories and tools", ImageUrl = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400" },
            };
            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }

        if (!await context.Users.AnyAsync())
        {
            var adminUser = new User
            {
                FirstName = "Abhi",
                LastName = "Admin",
                Email = "admin@abhishop.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = "Admin",
                PhoneNumber = "+1234567890",
                AvatarUrl = "https://ui-avatars.com/api/?name=Abhi+Admin&background=FF6B35&color=fff"
            };
            await context.Users.AddAsync(adminUser);
            await context.SaveChangesAsync();
        }

        if (!await context.Products.AnyAsync())
        {
            var electronicsId = (await context.Categories.FirstAsync(c => c.Name == "Electronics")).Id;
            var clothingId = (await context.Categories.FirstAsync(c => c.Name == "Clothing")).Id;
            var booksId = (await context.Categories.FirstAsync(c => c.Name == "Books")).Id;
            var homeId = (await context.Categories.FirstAsync(c => c.Name == "Home & Kitchen")).Id;
            var sportsId = (await context.Categories.FirstAsync(c => c.Name == "Sports")).Id;
            var beautyId = (await context.Categories.FirstAsync(c => c.Name == "Beauty")).Id;

            var products = new List<Product>
            {
                new() { Name = "iPhone 15 Pro", Description = "The latest iPhone with A17 Pro chip, titanium design, and advanced camera system. Features a 6.1-inch Super Retina XDR display.", Price = 999.99m, DiscountPrice = 949.99m, ImageUrl = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400", StockQuantity = 50, Brand = "Apple", SKU = "APL-IP15P-001", Rating = 4.8, ReviewCount = 1250, IsFeatured = true, CategoryId = electronicsId, Images = new List<string> { "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600" } },
                new() { Name = "Samsung Galaxy S24 Ultra", Description = "AI-powered smartphone with 200MP camera, S Pen, and Snapdragon 8 Gen 3 processor.", Price = 1299.99m, DiscountPrice = 1199.99m, ImageUrl = "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400", StockQuantity = 35, Brand = "Samsung", SKU = "SAM-GS24U-001", Rating = 4.7, ReviewCount = 890, IsFeatured = true, CategoryId = electronicsId },
                new() { Name = "MacBook Pro 16-inch M3", Description = "Powerful laptop with Apple M3 Pro chip, 18-hour battery life, and stunning Liquid Retina XDR display.", Price = 2499.99m, DiscountPrice = 2299.99m, ImageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", StockQuantity = 20, Brand = "Apple", SKU = "APL-MBP16-M3", Rating = 4.9, ReviewCount = 456, IsFeatured = true, CategoryId = electronicsId },
                new() { Name = "Sony WH-1000XM5 Headphones", Description = "Industry-leading noise canceling headphones with 30-hour battery and multipoint connection.", Price = 399.99m, DiscountPrice = 299.99m, ImageUrl = "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400", StockQuantity = 100, Brand = "Sony", SKU = "SNY-WH1000XM5", Rating = 4.7, ReviewCount = 2100, IsFeatured = true, CategoryId = electronicsId },
                new() { Name = "iPad Pro 12.9-inch M2", Description = "The ultimate iPad experience with M2 chip, ProMotion display, and Apple Pencil support.", Price = 1099.99m, DiscountPrice = null, ImageUrl = "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400", StockQuantity = 40, Brand = "Apple", SKU = "APL-IPADPRO-M2", Rating = 4.8, ReviewCount = 678, IsFeatured = false, CategoryId = electronicsId },
                new() { Name = "Dell XPS 15 Laptop", Description = "Premium 15.6\" OLED laptop with Intel Core i9, 32GB RAM, and NVIDIA RTX 4070.", Price = 1799.99m, DiscountPrice = 1599.99m, ImageUrl = "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400", StockQuantity = 15, Brand = "Dell", SKU = "DELL-XPS15-I9", Rating = 4.6, ReviewCount = 345, IsFeatured = false, CategoryId = electronicsId },
                new() { Name = "Nike Air Max 270", Description = "Iconic Nike Air Max cushioning provides all-day comfort. Mesh upper for breathability.", Price = 149.99m, DiscountPrice = 119.99m, ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", StockQuantity = 200, Brand = "Nike", SKU = "NIKE-AM270-001", Rating = 4.5, ReviewCount = 3200, IsFeatured = true, CategoryId = clothingId },
                new() { Name = "Levi's 501 Original Jeans", Description = "The original straight fit jean that started it all. Made with 100% cotton denim.", Price = 89.99m, DiscountPrice = 69.99m, ImageUrl = "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400", StockQuantity = 150, Brand = "Levi's", SKU = "LEV-501-32X32", Rating = 4.4, ReviewCount = 1890, IsFeatured = false, CategoryId = clothingId },
                new() { Name = "The Design of Everyday Things", Description = "A powerful primer on how design serves as the interface to the world, by Don Norman.", Price = 24.99m, DiscountPrice = 19.99m, ImageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", StockQuantity = 300, Brand = "Basic Books", SKU = "BOOK-DOEDT-001", Rating = 4.7, ReviewCount = 4500, IsFeatured = false, CategoryId = booksId },
                new() { Name = "Atomic Habits", Description = "An easy and proven way to build good habits and break bad ones by James Clear.", Price = 27.99m, DiscountPrice = 21.99m, ImageUrl = "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400", StockQuantity = 500, Brand = "Avery", SKU = "BOOK-ATOHAB-001", Rating = 4.9, ReviewCount = 8900, IsFeatured = true, CategoryId = booksId },
                new() { Name = "Instant Pot Duo 7-in-1", Description = "Electric pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker & warmer.", Price = 99.99m, DiscountPrice = 79.99m, ImageUrl = "https://images.unsplash.com/photo-1585515656973-c1cb45f35c83?w=400", StockQuantity = 80, Brand = "Instant Pot", SKU = "INST-DUO-7IN1", Rating = 4.7, ReviewCount = 12000, IsFeatured = true, CategoryId = homeId },
                new() { Name = "Dyson V15 Detect Vacuum", Description = "Laser dust detection, scientific proof of a deep clean. 60-minute battery life.", Price = 749.99m, DiscountPrice = 649.99m, ImageUrl = "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400", StockQuantity = 30, Brand = "Dyson", SKU = "DYS-V15-DET", Rating = 4.8, ReviewCount = 2300, IsFeatured = true, CategoryId = homeId },
                new() { Name = "Yoga Mat Premium", Description = "Non-slip eco-friendly yoga mat, 6mm thick, perfect for all types of yoga and exercise.", Price = 49.99m, DiscountPrice = 39.99m, ImageUrl = "https://images.unsplash.com/photo-1601925228166-f8fdb21ef9b9?w=400", StockQuantity = 200, Brand = "Manduka", SKU = "MAN-YOGA-6MM", Rating = 4.6, ReviewCount = 1560, IsFeatured = false, CategoryId = sportsId },
                new() { Name = "CeraVe Moisturizing Cream", Description = "Daily face and body moisturizer for dry skin. Developed with dermatologists.", Price = 19.99m, DiscountPrice = 15.99m, ImageUrl = "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400", StockQuantity = 500, Brand = "CeraVe", SKU = "CVE-MOIST-16OZ", Rating = 4.8, ReviewCount = 25000, IsFeatured = false, CategoryId = beautyId },
                new() { Name = "Apple Watch Series 9", Description = "Advanced health monitoring with blood oxygen, ECG, crash detection, and more.", Price = 399.99m, DiscountPrice = 349.99m, ImageUrl = "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400", StockQuantity = 75, Brand = "Apple", SKU = "APL-AW-S9-45MM", Rating = 4.7, ReviewCount = 3400, IsFeatured = true, CategoryId = electronicsId },
                new() { Name = "The Psychology of Money", Description = "Timeless lessons on wealth, greed, and happiness by Morgan Housel.", Price = 22.99m, DiscountPrice = 17.99m, ImageUrl = "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400", StockQuantity = 400, Brand = "Harriman House", SKU = "BOOK-PSYMNY-001", Rating = 4.8, ReviewCount = 6700, IsFeatured = true, CategoryId = booksId },
            };

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();
        }
    }
}
