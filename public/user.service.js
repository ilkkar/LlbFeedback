(function()
{
	angular
		.module("Passport")
		.factory("UserService", UserService);
		
		function UserService($http)
		{
			var service ={
				createUser: createUser
				login : loginUser
			};
			return Service;
			function createUser(user, callback)
			{
				$http.post("/register",user).success(callback);
			}
			function loginUser(user, callback)
			{
				$http.post("/login", user).success(callback);
			}
		}
})();