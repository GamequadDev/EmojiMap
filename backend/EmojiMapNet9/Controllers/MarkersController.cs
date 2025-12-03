using Azure.Core;
using EmojiMapNet9.Data;
using EmojiMapNet9.Entities;
using EmojiMapNet9.Models;
using EmojiMapNet9.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace EmojiMapNet9.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MarkersController(IMarkerService markerService) : ControllerBase
    {

        [HttpGet("getByUserId")]
        public async Task<ActionResult<List<MarkerDto?>>> GetMarkersByUserId(Guid UserId)
        {

            var marker = await markerService.GetMarkersByUserIdAsync(UserId);
            if (marker == null)
            {
                return BadRequest("Invalid username on marker doensn't exist");
            }
            return Ok(marker);
        }

        [HttpGet("public")]
        public async Task<ActionResult<List<MarkerDto>>> GetPublicMarkers()
        {
            var markers = await markerService.GetPublicMarkersAsync();
            return Ok(markers);
        }

        [HttpPost("add")]
        public async Task<ActionResult<MarkerDto>> AddMarker(MarkerDto markerRequest)
        {
            var marker = await markerService.CreateMarkerAsync(markerRequest);
            if (marker == null)
            {
                return BadRequest("Invalid data on marker or marker exist");
            }
            return Ok(marker);
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateMarker(MarkerDto markerUpdatedRequest)
        {
            var marker = await markerService.UpdateMarkerAsync(markerUpdatedRequest);
            if (marker == null)
            {
                return BadRequest("Invalid data on marker or marker exist doesn't exist");
            }
            return Ok(marker);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteMarker(Guid id)
        {
            var bDeleted = await markerService.DeleteMarkerAsync(id);
            if (!bDeleted)
            {
                return BadRequest("Marker exist doesn't exist");
            }
            ;
            return Ok();
        }

        /*
        private bool MarkerExists(Guid id)
        {
            return context.Markers.Any(e => e.Id == id);
        }
        */
    }
}
