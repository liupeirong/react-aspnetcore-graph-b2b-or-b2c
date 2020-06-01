using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using Microsoft.Identity.Web;
using Microsoft.Identity.Client;
using WebApiB2B.Models;

namespace WebApiB2B.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        readonly ILogger<UserController> _logger;
        readonly string graphEndpoint = "https://graph.microsoft.com/v1.0";
        readonly string[] scopes = { "user.read" };

        readonly ITokenAcquisition _tokenAcquisition;

        public UserController(ILogger<UserController> logger, ITokenAcquisition tokenAcquisition)
        {
            _logger = logger;
            _tokenAcquisition = tokenAcquisition;
        }

        [HttpGet("{email}")]
        public async Task<ActionResult<UserStatus>> Get(string email)
        {
            string accessToken = await _tokenAcquisition.GetAccessTokenForUserAsync(scopes);

            GraphServiceClient graphClient = new GraphServiceClient(
                graphEndpoint,
                new DelegateAuthenticationProvider(async (requestMessage) => {
                    requestMessage.Headers.Authorization = 
                        new AuthenticationHeaderValue("Bearer", accessToken);
                })
            );

            try {
                var userInfo = await graphClient.Users[HttpUtility.UrlEncode(email)]
                    .Request()
                    .Select("email,externalUserState,userPrincipalName")
                    .GetAsync();
                var userData = userInfo.AdditionalData;
                var user = new UserStatus {
                    UserPrincipalName = userInfo.UserPrincipalName,
                    UserType = userInfo.UserType,
                    Email = userInfo.Mail,
                    ExternalUserState = userData["externalUserState"] == null ? 
                        "null" : userData["externalUserState"].ToString(),
                    StatusCode = userData["statusCode"] == null ? 
                        "null" : userData["statusCode"].ToString(),
                };
                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return Problem(ex.Message);
            }
        }

        [HttpPost]
        public async Task<ActionResult> Invite([FromBody]EmailPayload emailPayload)
        {
            string[] inviteScopes = { "User.Invite.All" };
            string accessToken = await _tokenAcquisition.GetAccessTokenForUserAsync(inviteScopes);

            GraphServiceClient graphClient = new GraphServiceClient(
                graphEndpoint,
                new DelegateAuthenticationProvider(async (requestMessage) => {
                    requestMessage.Headers.Authorization = 
                        new AuthenticationHeaderValue("Bearer", accessToken);
                })
            );
            var invitation = new Invitation
            {
	            InvitedUserEmailAddress = emailPayload.Email,
                InviteRedirectUrl = "https://redirect_guests_after_invitation_is_accepted",
                SendInvitationMessage = true
            };

            try
            {
                invitation = await graphClient.Invitations.Request().AddAsync(invitation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return Problem(ex.Message);
            }

            return Ok();
        }
    }
}
