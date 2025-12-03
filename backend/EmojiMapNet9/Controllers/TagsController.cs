using EmojiMapNet9.Models;
using EmojiMapNet9.Services;
using Microsoft.AspNetCore.Mvc;

namespace EmojiMapNet9.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TagsController(ITagService tagService) : ControllerBase
    {

        [HttpPost("add")]
        public async Task<ActionResult<TagDto>> AddTag(TagDto tagRequest)
        {
            var tag = await tagService.CreateTagAsync(tagRequest);
            if (tag == null)
            {
                return BadRequest("Invalid data on tag exist");
            }
            return Ok(tag);
        }

        [HttpPut("update")]
        public async Task<ActionResult<TagDto>> UpdateTag(TagDto tagRequest)
        {
            var tag = await tagService.UpdateTagAsync(tagRequest);
            if (tag == null)
            {
                return NotFound("Tag not found");
            }
            return Ok(tag);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteTag(Guid id)
        {
            var bDeleted = await tagService.DeleteTagAsync(id);
            if (!bDeleted)
            {
                return BadRequest("Marker exist doesn't exist");
            }
            ;
            return Ok();
        }



        [HttpGet("public")]
        public async Task<ActionResult<List<TagDto>>> GetAllPublicTags()
        {
            var tags = await tagService.GetAllPublicTagsAsync();
            return Ok(tags);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<TagDto>>> GetUserTags(Guid userId)
        {
            var tags = await tagService.GetUserTagsAsync(userId);
            return Ok(tags);
        }

    }
}
