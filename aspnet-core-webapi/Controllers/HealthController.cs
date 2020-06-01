using Microsoft.AspNetCore.Mvc;

namespace WebApiB2B.Controllers
{
    [ApiController]
    [Route("/")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public string Get()
        {
            return ("alive!");
        }
    }
}
