var app = angular.module('Passport', ['ngRoute']);

app.config(function($routeProvider) {
	$routeProvider
	   .when('/home', {
		templateUrl: '/views/home.html'
	  })
		.when('/profile', {
		templateUrl: '/views/profile/profile.html',
		controller: 'ProfileCtrl',
		resolve:{
			logincheck: checkLoggedin
		}
	  })
		  .when('/login', {
		templateUrl: '/views/login/login.html',
		controller: 'LoginCtrl'
	  })
	  	  .when('/logout', {
		templateUrl: '/views/logout.html'
	  })
		  .when('/register', {
		templateUrl: '/views/register/register.html',
		controller: 'RegisterCtrl'
	  })
	  .otherwise({
		 redirectTo: '/home' 
	  })
  });
  
  var checkLoggedin = function($q, $timeout, $http, $location, $rootScope)
  {
	  var deferred = $q.defer();
	  
	  $http.get('/loggedin').success(function(user)
	  {
		  $rootScope.errorMessage = null;
		  //User is Authenticated
		  if(user!== '0')
		  {
			  $rootScope.currentUser= user;
			  deferred.resolve();
		  }
		  else
		  {
			  $rootScope.errorMessage = 'You need to log in.';
			  deferred.reject();
			  $location.url('/login');
		  }
	  });
	  return deferred.promise;
  }; 
  
  app.controller("NavCtrl", function ($rootScope, $scope, $http, $location){
	  $scope.logout = function()
	  {
		 $http.post("/logout")
		.success(function(){
			$rootScope.currentUser = null;
			$location.url("/home");
		});		 
	  }
  });
     angular.module('checkboxExample', [])
    .controller('ExampleController', ['$scope', function($scope) {
      $scope.checkboxModel = {
       value1 : true,
       value2 : 'YES'
     };
    }]);
 