
//Controller for profile page

app.controller("ProfileCtrl", function($scope, $http, $location, $timeout, Upload, $rootScope){
	
//http call to get users
	
	$http.get('/rest/user')
	.success(function(users){
		$scope.users = users;	
			console.log('users taulu' + $scope.users);
	});

//****Start All Company&Quests-http-call***********************
	
	//refresh function which refresh content when changes are made
	
	var refresh = function() {
		
	//Check if loggedin user roles field is brand
		
		if($scope.currentUser.roles == "brand"){
			
		// Create http call to server.js and retrieve brand document from db in order of currentUser objectId
		//Set response on angular variable brands
			
			$http.get('/rest/brand/' + $scope.currentUser._id)
			.success(function(response){
				$rootScope.brands = response;
				console.log('brands taulu: ' + $rootScope.brands[0]._id);
				
				//if brand[0] _id is not empty create http call to get companies belonging to brand
				//brand[0] _id used as :id
				//set response brandCompanies angular variable
				
				if($rootScope.brands[0]._id){
					
					$http.get('/brandCompanies/' + $rootScope.brands[0]._id).success(function(response){
						$scope.brandCompanies = response;
						console.log('brands companies' + $scope.brandCompanies);
					});
				}
			});
		}
			
	// Create http call to server.js and retrieve company document from db in orrder of currentUser objectId	
				
		$http.get('/rest/company/' + $scope.currentUser._id)
			.success(function(response){
			$rootScope.companies = response;
		
		//Check if company has brandId and user roles company. Then retrieve company and brand info from db
		//response set in companyBrand angular variable
		
			if($rootScope.companies[0].brandId && $scope.currentUser.roles == "company"){
				
				$http.get('/brand/' + $rootScope.companies[0].brandId).success(function(response){
				$scope.companyBrand = response;
						console.log('companywithbrand:' + $scope.companyBrand.name);
				});
			}	
			
		//Check is user roles "company"
			
			if($scope.currentUser.roles == "company"){
			
		//Http call to retrieve all quest from db in order angular variable companies[0] objectId
		//set response on quests angular variable	
			
				$http.get('/rest/quest/' + $rootScope.companies[0]._id)
				.success(function(response){
					$scope.quests = response;
					console.log('quests taulu' + $scope.quests);
				});
			}	
		});
	}	
	refresh();
	
//customNavigate variable for sending quest ObjectId for addquest.js in case of editing
	
	$scope.customNavigate=function(msg){
       $location.path("/addquest"+msg)
    }
});