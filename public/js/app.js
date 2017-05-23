var app = angular.module('Passport', ['ngRoute','ngFileUpload']); 
	
app.run(function ($rootScope, $location) {
    $rootScope.$on('$locationChangeSuccess', function () {
       	$rootScope.currentPage = $location.path().substr(1);
    });
});

// Angular routes for page structures and controllers for the pages

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
	   .when('/addquest', {
		templateUrl: '/views/profile/addquest.html',
		controller: 'AddQuestCtrl',
		resolve:{
			logincheck: checkLoggedin
		}
	  })
	  .when('/addquest/:id?', {
		controller: 'AddQuestCtrl', 
		templateUrl: '/views/profile/addquest.html',
	  })
	  .when('/addcompany', {
		templateUrl: '/views/profile/addcompany.html',
		controller: 'AddCompanyCtrl',
		resolve:{
			logincheck: checkLoggedin
		}
	  })
	    .when('/addbrand', {
		templateUrl: '/views/profile/addbrand.html',
		controller: 'AddBrandCtrl',
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
  
  //Angular function which check is user logged in
  
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
  
  //NavController and logout angular function which reset currentUser and redirect /home page
  
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