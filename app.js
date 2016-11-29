/* src/app.js */
// Application Module 
angular.module('myApp', ['djeInstruments'])
// Main application controller
.controller('MainCtrl', ["$scope", "d3", "SimpleHttpLoader","rhythmService", "instrumentService" ,
    function ($scope, d3, SimpleHttpLoader, rhythmService, instrumentService) {                  
    console.log("in MainCtrl - beginning");
    $scope.mainRhythmSrc = 'files/soli_simple.json';  //fetch as default
    $scope.allRhythms = "files/rhythms.json"; //notations of all rhythm
    $scope.instruments ={};
    $scope.elem_width="600px";
    $scope.rhythms = {};
    $scope.selRhythm;
     
    // run when application is loaded
    SimpleHttpLoader($scope.mainRhythmSrc).then(function(response){
       console.log("in SimpleHttpLoader app käynnistyy" );
        $scope.getRhythms();
    });
        
      $scope.defaultInstruments = function() {
            instrumentService.getDefaultInstruments().then(function(response){
                $scope.instruments = response.data;
                console.log("haettiin instrumentit: " + $scope.instruments)
             });
        }; 
        
        //retrieve all rhythms fro json
      $scope.getRhythms = function(){
          rhythmService.getRhythms($scope.allRhythms).then(function(response){
              $scope.rhythms = response.data
              console.log("rytmit: " )
              $scope.rhythms.forEach(function(item){
                  console.log("nimi: " + item.name);
              })
          })   
      }
      
      $scope.saverhythm = function (rhythm) {
            console.log("!!!....in app.js saveRhythm: " + JSON.stringify(rhythm));
          
          console.log("By magic of two-way binding from directive: "+ JSON.stringify($scope.selRhythm))
          console.log("Ylläoleva tuli direktiivistä, joka kuunteli rytmin visualisointi-palikan itse luotua 'saving' -tapahtumaa, joka käynnistyi kun 'sava' -namiskaa painettiin. Siinä on siis (muutetunkin) rytmin nuotit, tosin ei tallennettavassa muodossa, vaan siinä jonka visualisointipalikka ymmärsi - pitäis muuttaa matkan varrella, eli direktiivissä. Paitsi ettei oikeesti tullu. Mut pitäis! #€££## ( ja tulikii joskus)");
            /*rhythmService.update(rhythm).then(function (result) {
                console.log("Managed to update rhythm")
            }, function (reason) {
                console.log('ERROR in updating rhythm', reason);
            });*/
        };

        $scope.createRhythm = function (rhythm) {
            console.log("createRhythm nimeltaan " + rhythm.name);
            var newID = rhythmsService.create(rhythm);//.then(function (result) {  
            var message=(newID!==null)? "mainCtrl.createRhytm, new rhythm created: " + rhythm.name : "error in creating rhythm: " + rhythm.name
            console.log(message);
               
        };

       
        
                      
}]);