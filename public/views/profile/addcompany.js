app.controller("AddCompanyCtrl", function($scope, $http, $location, $timeout, Upload, $rootScope){
	
geocoder = new google.maps.Geocoder();

//Global variables for location

var longLat=""; 
var lng = "";
var lat=""; 

//Arrays for brand and selected option

$scope.brands = 0;
$scope.diffBrands = ['Select your brand'];
$scope.brandsIdArray = ['empty'];
$scope.selectedOption = $scope.diffBrands[0];

//http call for get all brands in brand document
//response set in brands variable
	
	$http.get('/rest/brand')
		.success(function(response){
			$rootScope.brands = response;
						
				//go through respose brand .json and add option in arrays
				//arrays used to show info in form
						
				if($rootScope.brands[1]){
					for(var i=0; i < $rootScope.brands.length;i++) {
						//console.log($rootScope.brands[i].name);
						$scope.diffBrands[i+1] = $rootScope.brands[i].name;
						$scope.brandsIdArray[i+1] = $rootScope.brands[i]._id;
					}
				}
			}
		);
	
//Google geocoder function for getting location fom address

$scope.geocodeAddress = function(address){
	
	address = $scope.company.street + " " + $scope.company.postalCode + " " + $scope.company.city;  
	
	geocoder.geocode({address: address}, function(results, status){
	
			longLat = results[0].geometry.location;// call the callback passing to it the address and we're done.
			lat = results[0].geometry.location.lat().toString();
			lng = results[0].geometry.location.lng().toString();
			
			if(lat == ""){
				$scope.addressErr ="Check your address! Address is not valid";
				
			}	
	});
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
		
	//http call for getting company data in order of loggedin user
	//http :id = currentUser objectId
	//response set on companies angular variable
	
		$http.get('/rest/company/' + $scope.currentUser._id)
		.success(function(response){
			$rootScope.companies = response;
			console.log('companies taulu' + $rootScope.companies[0]);
		
			//companies[0 is set and help is o then call editCompany angular function
			
			if($rootScope.companies[0] && help==0){
				editCompany($scope.companies[0]._id);
				//console.log('companies löytyy');
				help= 1;
			}
		});
	}	
	refresh();

//****Company-http-call****************************************	
	
	//angular fuction for adding company	
	
	$scope.addCompany = function(){
			
		//If diffbarnds[1] is set then loop throgh diffbrands array and find company.brandId from array
		
		if($scope.diffBrands[1]){
			for(var i=0; i <$scope.diffBrands.length;i++) {
				
				if($scope.selectedOption == $scope.diffBrands[i]){
						$scope.company.brandId = $scope.brandsIdArray[i];
						console.log("Brand Id: "+$scope.company.brandId);
			}
		}
		}
		
		//set lat value from geocoder function
		
		$scope.company.lat = lat.toString();
		
		//set lng value from geocoder function
		
		$scope.company.lng = lng.toString();
		
		console.log("loc arvo:"+$scope.company.loc);
		
		//set company logo name from image uploadFiles function
		
		$scope.company.logo = $scope.f.name;
		
		//set userid field as currentUser objectId
		
		$scope.company.userid = $scope.currentUser._id;

		
		//http call to add data in CompanyModel document as company variable as content
		//success response redirect profile page
		
		$http.post('/add', $scope.company).success(function(response){
				console.log(response);
				refresh();
				$scope.company ='';
				$location.url("/profile");
			});
	}
	
	//Angular function for removing company
	//id: is selected company objectId
	//if call succesful then reset company form and refresh function call
	
	$scope.removeCompany = function(id){
		console.log(id);
		$http.delete('/company/' + id).success(function(response){
				console.log(id);
				$scope.company ='';
				refresh();
			});
		/*$http.delete('/removeQuest/' + id).success(function(response){
			console.log(id);
		});*/
	}
	
	//angular function for edit company
	//id: company objectId
	//response set in angular variable company
	
	var editCompany = function(id){
		console.log(id);
		$http.get('/company/' + id).success(function(response){
				$scope.company = response;
				refresh();
			});
	}
	
	//angular function for updating quest
	
	$scope.Update = function(){
		
		//for loop to check do diffbrands from field has new value
		
		for(var i=0; i <$scope.diffBrands.length;i++) {
			
			if($scope.selectedOption == $scope.diffBrands[i]){
					$scope.company.brandId = $scope.brandsIdArray[i];
					console.log("Brand Id: "+$scope.company.brandId);
			}
		}
		
		//variables for location
		
		$scope.company.lat = lat.toString();
		$scope.company.lng = lng.toString();
		
		//http call for updating company information in db
		//id: company objectId
		//content company variable
		//response redirect profile page
		
		$http.put('/company/' + $scope.company._id, $scope.company).success(function(response){
				refresh();
				$scope.company ='';
				$location.url("/profile");
			});
	}
});