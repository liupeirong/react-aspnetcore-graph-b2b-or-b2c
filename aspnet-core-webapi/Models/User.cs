using System;

namespace WebApiB2B.Models
{
    public class UserStatus
    {
        public string UserPrincipalName { get; set; }
        public string UserType { get; set; }
        public string Email { get; set; }
        public string ExternalUserState { get; set;}
        public string StatusCode { get; set; }
    }
}
