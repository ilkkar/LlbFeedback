//Login controller for login page

app.controller("RegisterCtrl", function($location, $scope, $http, $rootScope){

//register angular function which check is form field passpoword fields same
//create http.post call sending username and password to express /register 
//if registering succesful set currentUser as response user
//redirect on profile page

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