
//Login controller for login page

app.controller("LoginCtrl", function($location, $scope, $http, $rootScope){

//Login angular function which create hhp post call sending user data to express node server
//If call get response user data is set on currentUser variable
//variable is $rootScope and can be used anywhere on sites

	$scope.login = function(user)
	{
		console.log(user);
		
		$http.post('/login', user).success(function(response){
			
			if(response==null){
			}
			console.log(response);
			$rootScope.currentUser = response;
			$location.url("/profile");
		});
	};
});