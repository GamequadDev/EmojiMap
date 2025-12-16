using EmojiMapNet9.Controllers;
using EmojiMapNet9.Models;
using EmojiMapNet9.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace EmojiMapNet9.Tests;

public class MarkersControllerTests
{
    private readonly Mock<IMarkerService> _mockMarkerService;
    private readonly MarkersController _controller;

    public MarkersControllerTests()
    {
        _mockMarkerService = new Mock<IMarkerService>();
        _controller = new MarkersController(_mockMarkerService.Object);
    }

    [Fact]
    public async Task GetMarkersByUserId_ReturnsOk_WhenMarkersExist()
    {
        var userId = Guid.NewGuid();
        var markers = new List<MarkerDto> { new MarkerDto { Id = Guid.NewGuid(), Title = "Test Marker" } };
        _mockMarkerService.Setup(s => s.GetMarkersByUserIdAsync(userId)).ReturnsAsync(markers);

        var result = await _controller.GetMarkersByUserId(userId);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedMarkers = Assert.IsType<List<MarkerDto>>(okResult.Value);
        Assert.Single(returnedMarkers);
    }

    [Fact]
    public async Task GetMarkersByUserId_ReturnsBadRequest_WhenServiceReturnsNull()
    {
        var userId = Guid.NewGuid();
        _mockMarkerService.Setup(s => s.GetMarkersByUserIdAsync(userId)).ReturnsAsync((List<MarkerDto>?)null);

        var result = await _controller.GetMarkersByUserId(userId);

        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("Invalid username on marker doensn't exist", badRequestResult.Value);
    }

    [Fact]
    public async Task AddMarker_ReturnsOk_WhenMarkerCreated()
    {
        var markerDto = new MarkerDto { Title = "New Marker" };
        var createdMarker = new MarkerDto { Id = Guid.NewGuid(), Title = "New Marker" };
        _mockMarkerService.Setup(s => s.CreateMarkerAsync(markerDto)).ReturnsAsync(createdMarker);

        var result = await _controller.AddMarker(markerDto);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedMarker = Assert.IsType<MarkerDto>(okResult.Value);
        Assert.Equal(createdMarker.Id, returnedMarker.Id);
    }

    [Fact]
    public async Task UpdateMarker_ReturnsOk_WhenMarkerUpdated()
    {
        var markerDto = new MarkerDto { Id = Guid.NewGuid(), Title = "Updated Marker" };
        _mockMarkerService.Setup(s => s.UpdateMarkerAsync(markerDto)).ReturnsAsync(markerDto);

        var result = await _controller.UpdateMarker(markerDto);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedMarker = Assert.IsType<MarkerDto>(okResult.Value);
        Assert.Equal(markerDto.Title, returnedMarker.Title);
    }

    [Fact]
    public async Task DeleteMarker_ReturnsOk_WhenMarkerDeleted()
    {
        var markerId = Guid.NewGuid();
        _mockMarkerService.Setup(s => s.DeleteMarkerAsync(markerId)).ReturnsAsync(true);

        var result = await _controller.DeleteMarker(markerId);

        Assert.IsType<OkResult>(result);
    }
}
