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
public class AddressesController : ControllerBase
{
    private readonly AppDbContext _context;

    public AddressesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<AddressDto>>> GetAddresses()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var addresses = await _context.Addresses
            .Where(a => a.UserId == userId)
            .Select(a => new AddressDto
            {
                Id = a.Id,
                FullName = a.FullName,
                Street = a.Street,
                City = a.City,
                State = a.State,
                ZipCode = a.ZipCode,
                Country = a.Country,
                PhoneNumber = a.PhoneNumber,
                IsDefault = a.IsDefault
            })
            .ToListAsync();

        return Ok(addresses);
    }

    [HttpPost]
    public async Task<ActionResult<AddressDto>> CreateAddress(CreateAddressDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (dto.IsDefault)
        {
            var existing = await _context.Addresses.Where(a => a.UserId == userId && a.IsDefault).ToListAsync();
            existing.ForEach(a => a.IsDefault = false);
        }

        var address = new Address
        {
            UserId = userId,
            FullName = dto.FullName,
            Street = dto.Street,
            City = dto.City,
            State = dto.State,
            ZipCode = dto.ZipCode,
            Country = dto.Country,
            PhoneNumber = dto.PhoneNumber,
            IsDefault = dto.IsDefault
        };

        _context.Addresses.Add(address);
        await _context.SaveChangesAsync();

        return Ok(new AddressDto
        {
            Id = address.Id,
            FullName = address.FullName,
            Street = address.Street,
            City = address.City,
            State = address.State,
            ZipCode = address.ZipCode,
            Country = address.Country,
            PhoneNumber = address.PhoneNumber,
            IsDefault = address.IsDefault
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAddress(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var address = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        if (address == null) return NotFound();

        _context.Addresses.Remove(address);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
