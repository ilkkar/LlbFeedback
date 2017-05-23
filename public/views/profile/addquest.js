app.controller("AddQuestCtrl", function($scope, $http, $location, $timeout, Upload, $rootScope, $routeParams){
	
geocoder = new google.maps.Geocoder();

//Global variables for location

var longLat=""; 
var lng = "";
var lat=""; 

//Google geocoder function for getting location fom address

$scope.geocodeAddress = function(address){
	
	address = $scope.company.street + " " + $scope.company.postalCode + " " + $scope.company.city;  
	
	geocoder.geocode({address: address}, function(results, status){
	
			longLat = results[0].geometry.location;
			ltn = results[0].geometry.location.lat();
			lng = results[0].geometry.location.lat(), results[0].geometry.location.lng();
			console.log('geocode location:' + longLat);	
	});
	console.log('Location:' + longLat);
}

//Upload image angular function for uploading image 
	
 $scope.uploadFiles = function(file, errFiles) {
        
		$scope.f = file;
		$scope.clues[$scope.clues.length-1].icon = $scope.f.name;
		
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            file.upload = Upload.upload({
                url: './upload/',
				method: 'POST',
				file: file
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
	  
//http call for getting users	  
	  
	$http.get('/rest/user')
	.success(function(users){
		$scope.users = users;	
			console.log('users taulu' + $scope.users);
	});

//****Add new clue field***************************************

//array for form phase clues array

   $scope.clues = [{name: '', clue: 'clue'}];
   $scope.phaseTitle = [{phase : 'Phase 1'}];
   
   //variable for adding new phase sections
   
   var newItemNo = 0;
   
   //angular function which add new phase section in form
   //name new instance on clues array
   
   $scope.addNewChoice = function() {
     newItemNo = $scope.clues.length+1;
     $scope.clues.push({'name' : 'phase' + newItemNo + ' name', 'clue' : 'clue' + newItemNo});
	 $scope.phaseTitle.push({'phase' : 'Phase' + newItemNo});
   };
   
   //angular function for removing phase section on addquest form
   //remove instance from clues array
   
   $scope.removeNewChoice = function() {
     newItemNo = $scope.clues.length-1;
	 
     if ( newItemNo !== 0 ) {
      $scope.clues.pop();
	  $scope.phaseTitle.pop();
     }
   };
      $scope.phaseSelected = function() {
		return $scope.phaseTitle[$scope.phaseTitle.length-1].phase;   
   }


//****Start All Company&Quests-http-call***********************

	//Single quest id for edit
	$scope.id = $routeParams.id;
	
	//refresh fuction for resfreshing content data when changes are made
	
	var refresh = function() {
		
	//http call for getting company data in order of loggedin user
	//http :id = currentUser objectId
	//response set on companies angular variable
	
		$http.get('/rest/company/' + $scope.currentUser._id)
		.success(function(response){
			$rootScope.companies = response;
			
			
			//http call for getting all quest of the company
			//http :id angular variable companies[0] objectId
			//response set on quests angular variable
			
			$http.get('/rest/quest/' + $rootScope.companies[0]._id)
			.success(function(response){
				$scope.quests = response;
				
				//If angular variable id is set then call editQuests function
				//Id is variable passed from profile page when editing quests
				
				if($scope.id){
					editQuest($scope.id);
				}
			});			
		});
	}	
	refresh();

//****Quest-http-calls*****************************************
		
	//angular fuction for adding quests	
		
	$scope.addQuest = function(){ 
		
		//set values from form on quest variable enabling values to be send
		
		$scope.quest.questIcon = $scope.selectedOption + ".png";
		$scope.quest.questType = $scope.selectedOption;
		
		//if questDurationHours is set add it on quest variable
		
		if($scope.quest.questDurationHours){
				$scope.quest.questDuration = $scope.quest.questDurationHours;
		}
		
		//if questDurationMin is set add it on quest variable
		
		if($scope.quest.questDurationMin){ 
			$scope.quest.questDuration = $scope.quest.questDurationMin;
		}
		
		//if questDurationMin and questDurationHours is set add it on quest variable
		
		if($scope.quest.questDurationHours && $scope.quest.questDurationMin){
			$scope.quest.questDuration = $scope.quest.questDurationHours + "." + $scope.quest.questDurationMin;
		}
		
		//set quest companyId as companies[0] objectId 	
		
		$scope.quest.companyId = $rootScope.companies[0]._id;
		
		//Add angulars variables on data variable
		
		var data = {
			quest: $scope.quest,
			clues: $scope.clues
		};
		
		//http call to add quest as content of data
		
		$http.post('/addQuest', data).success(function(response){
			
				console.log(response);
				$location.url("/profile");
			});
	}
	
	//angular function for redirecting location
	
	$scope.goProfile = function(){
		$location.url("/profile");
	}
	
	//Angular function for removing quest
	//id: is selected quest objectId
	//if call succesful redirecting in profile page
	
	$scope.removeQuest = function(id){
		console.log(id);
		$http.delete('/quest/' + id).success(function(response){
				console.log(id);
				$scope.quest ='';
				$location.url("/profile");
			});
	}
	
	//angular variable for quest types and selected option for form
	
	$scope.questType = ['Select quest type', 'Treasure-Quest', 'Exploring-quest','Competitor-quest', 'Craftsman-quest', 'Achiever-quest', 'Performer-quest' ,'Collector-quest', 'Social-achiever-quest', 'Gambler-quest', 'Random-quest'];
	
	$scope.selectedOption = $scope.questType[0];

	//angular function for edit quests
	//id: quest objectId
	//response set in angular variable quest
	
	var editQuest = function(id){
		$http.get('/quest/' + id).success(function(response){
				$scope.quest = response;

		//Set clues array first instance from response data
		
		$scope.clues = [{name: $scope.quest.questClues[0].name, clue: $scope.quest.questClues[0].clue, icon: $scope.quest.questClues[0].icon, endCode: $scope.quest.questClues[0].endCode}];
				 
				 //loop and set clues array remaining values from response data
				 
				for(i=1; i < $scope.quest.questClues.length;i++) {
					$scope.clues.push({'name' : $scope.quest.questClues[i].name, 'clue' : $scope.quest.questClues[i].clue, 'icon' : $scope.quest.questClues[0].icon, 'endCode' : $scope.quest.questClues[i].endCode});
				}
				
				//set quest type from response data
				
				for(a=0; a < $scope.questType.length;a++) {
					if($scope.quest.questType == $scope.questType[a]){
						$scope.selectedOption = $scope.questType[a];
						console.log($scope.questType[a]);	
					}
					console.log('Valittu kohde: ' + $scope.quest.questType);	
				}
				
			});
	}
	
	//angular function for updating quest
	
	$scope.updateQuest = function(){
		
		//set quest variable fields from form data
		
		$scope.quest.questIcon = $scope.selectedOption + ".png";
		$scope.quest.questType = $scope.selectedOption;
		
		//set data variable containing angular variables
		
			var data = {
			quest: $scope.quest,
			clues: $scope.clues
		};
		
		//http call for updating quest information
		//id: quest object id
		//succesful response redirect profile page
		
		$http.put('/quest/' + $scope.quest._id, data).success(function(response){
				refresh();
				$scope.quest ='';
				$location.url("/profile");
			});
	}
//****End-quest-http-calls******************************************
});