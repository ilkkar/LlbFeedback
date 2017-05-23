app.controller("AddBrandCtrl", function($scope, $http, $location, $timeout, Upload, $rootScope){
	
geocoder = new google.maps.Geocoder();

//Global variables for location 

var longLat=""; 
var lng = "";
var lat=""; 
	
//Google geocoder function for getting location fom address

$scope.geocodeAddress = function(address){
	
	//set address from add brand form fields
	
	address = $scope.brand.street + " " + $scope.brand.postalCode + " " + $scope.brand.city;  
	
	geocoder.geocode({address: address}, function(results, status){
	
			longLat = results[0].geometry.location;// call the callback passing to it the address and we're done.
			lat = results[0].geometry.location.lat().toString();
			lng = results[0].geometry.location.lng().toString();
			
			if(lat == ""){
				$scope.addressErr ="Check your address! Address is not valid";
				
			}
			console.log('geocode location:' + longLat);	
	});
	console.log('Location:' + longLat);
}

//Upload image angular function for uploading image 

 $scope.uploadFiles = function(file, errFiles) {
        $scope.f = file;
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            file.upload = Upload.upload({
                url: './upload/',
				method: 'POST',
				file: file
                //data: {file: file}
            });
            file.upload.then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                });
            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * 
                                         evt.loaded / evt.total));
            });
        }   
    }
	  
//http call for getting all users 	  
	  
	$http.get('/rest/user')
	.success(function(users){
		$scope.users = users;	
			console.log('users taulu' + $scope.users);
	});
//****Start All Company&Quests-http-call***********************
	var help = 0;
	
//resfreshing function for updating content when change happen
	var refresh = function() {

	//http call for getting brand data in order of loggedin user
	//http :id = currentUser objectId
	//response set on brands angular variable
	
		$http.get('/rest/brand/' + $scope.currentUser._id)
		.success(function(response){
			$rootScope.brands = response;
			console.log('brands table' + $rootScope.brands[0]);
		
		
		//companies[0] is set and help is o then call editBrand angular function
		
			if($rootScope.brands[0] && help==0){
				editBrand($scope.brand[0]._id);
				help= 1;
			}
		});
	}	
	refresh();

//****Company-http-call****************************************
		
	//angular fuction for adding brand	
		
	$scope.addBrand = function(){
		
		//set lat value from geocoder function
		
		$scope.brand.lat = lat.toString();
		
		//set lng value from geocoder function
		
		$scope.brand.lng = lng.toString();
		console.log("loc value:"+$scope.brand.loc);
		
		//set company logo name from image uploadFiles function
		
		$scope.brand.logo = $scope.f.name;
		
		//set userid field as currentUser objectId
		
		$scope.brand.userid = $scope.currentUser._id;
		
		//http call to add data in BrandModel document as company variable as content
		//success response redirect profile page
		
		$http.post('/addBrand', $scope.brand).success(function(response){
				console.log(response);
				refresh();
				$scope.brands ='';
				$location.url("/profile");
			});
	}
	
	//Angular function for removing brand
	//id: is selected brand objectId
	//if call succesful then reset brand form and refresh function call
	
	$scope.removeBrand = function(id){
		console.log(id);
		$http.delete('/brand/' + id).success(function(response){
				console.log(id);
				$scope.company ='';
				refresh();
			});
	}
	
	//angular function for edit brand
	//id: brand objectId
	//response set in angular variable company
	
	var editBrand = function(id){
		console.log(id);
		$http.get('/brand/' + id).success(function(response){
				$scope.brands = response;
				refresh();
			});
	}
	
	//angular function for updating quest
	
	$scope.Update = function(){
		
		//variables for location
		$scope.brand.lat = lat.toString();
		$scope.brand.lng = lng.toString();
		
		//http call for updating company information in db
		//id: company objectId
		//content company variable
		//response redirect profile page
		
		$http.put('/brand/' + $scope.brand._id, $scope.brand).success(function(response){
				refresh();
				$scope.brand ='';
				$location.url("/profile");
			});
	}
});