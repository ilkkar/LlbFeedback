app.controller("RegisterCtrl", function($location, $scope, $http, $rootScope){
	$scope.register = function(user)
	{
		console.log(user);
		//ToDo verify two passwords are same and notify user
		if(user.password == user.password2)
		{
			$http.post('/register', user).success(function(user){
				$rootScope.currentUser = user;
				console.log(user);
				$location.url("/profile");
			});
		}
	};
});