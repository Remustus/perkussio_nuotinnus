/* src/chart.js */
 
angular.module('djeInstruments')
//rhythm directive
.directive('djeRhythm', [ "d3",
    function($http){
        console.log("djeRhytmissa ennen returnilla palautettavaa objektia")
    return {
      restrict: 'E',
      scope: {
        saverhythm: '&',
        rhythm: '=rhythm',
        instruments:'=instruments'
      },
        require:'djeRhythm',  //must reference itself in order to use controller in link-function!
        //template: '<button ng-click="saverhythm(rhythm.name)">Save rhythm</button>',
      controller: function ($scope) { //DI with two optional injectables: $scope and $elements
        console.log("djeRhythm controller. " )
        //'this' - Public API for directive(or controller)
        soundChannels=9; //vertical domain of the rhythm
        $scope.curRhythm=[]; // JSON in a form scatter plot responsible for notation understands
        var rh_instruments =[];
        instLkm=0;
        
        var dirty //
        $scope.sPlot //notation-palikka tähän 
        var svg //and it's svg 
        var ctrl = this;  // bind public API here
        
        ctrl.isDirty = function(){
            console.log("in Rhythm.isDirty: ");
            if($scope.sPlot){return $scope.sPlot.dirty;} 
        }
         
        ctrl.getSoundChannels = function(){
            return soundChannels;
        }
        
        ctrl.buildJSON = function(rawRhythm){
            console.log("...................djeRhythm buildJSON begins......................")
            if (!rawRhythm) {
                        console.log("!!!!!! ****** ERROR ERROR no parameter in buildJSON")
            }
            $scope.curRhythm=[];  //empty the old notes
                    var patternLen;  //length of the pattern
                    var measure; //length of a measure
                    
                    patternLen = rawRhythm.pattern_length;
                    measure = rawRhythm.measure;
                    
                    var iSc =0; //soundchannels of the instrument
                    //count combined soundchannels of all the instruments in the rhythm
                    var rSc =0; 
                    angular.forEach(rawRhythm.instruments, function(value,key){
                        console.log("joka instrumentti key: " + key + ", value: "+ value);
                        rSc+=value.sound_channels;
                    })
                    console.log("instrumenttien yhtlaskettu soundChannels: " + rSc + ", patternLength : " + patternLen)
                    
                    console.log("in buildJSON let's convert JSON in the form D3-code understands");
                     //verical position of the instrument: decreases by amount of instrument's soundChannel
                    //in every iteration
                    var vertPos = rSc;  
                    //console.log("soundChannels: " + soundChannels);
                    JSON.stringify("buildJSONissa rytmi: " + rawRhythm.name)
                    var instrument;  //general name of the instrument: djembe, sangban etc
                    var specificInstrument // djembe1, djembe2, sangban etc.
                    //iterate instruments in rhythm and give them positions & data for the D3.Notation 
                    var noteId;
                    
                    var evenOrOdd = 1;  //{0,1}background color of the notes in instrument changes 
            
                    //iterate each instrument used in the rhythm:
                    angular.forEach(rawRhythm.instruments, function(value, key) {
                        iSc = value.sound_channels;//soundchannels of the instrument
                        console.log("key: " + key + " & instrumentin nimi: " +value.name);
                        console.log("evenOrOdd: "+ evenOrOdd);
                        console.log(", it's soundChannels by orig data: " + value.sound_channels);
                        
                        instrument = value.instrument;
                        specificInstrument = value.name
                        
                        console.log("Ennen value.notes.length");
                        //iterate each note(particular place in timeline) of the instrument
                        //instrument can have several soundSources in one position(notes.length)
                        for(i=0;i<value.notes.length;i++){
                            //console.log("tunnisti valuen lengthin");
                            var rivi=0; 
                            //jokaiselle äänilähteelle instrumentin kyseisessä kohdassa
                            angular.forEach(value.notes[i], function(value, key){ 
                            console.log("nuotti äänilähde, index: " + i + ", key: " + key + ", value: " + value)
                            //unique identifier for each data-item in two-dimensional grid
                                noteId = (patternLen * (vertPos - rivi)) + i;
                                    $scope.curRhythm.push({
                                        x:i,
                                        y: vertPos -rivi, // - scatPlotin rangen mukaan 
                                        soundSource: key,
                                        sound: value,
                                        inst: instrument,  //djembe, sangban ym.
                                        instSpe: specificInstrument, //djembe1, djembe2, sangban.. 
                                        id: noteId,
                                        evenOrOdd: evenOrOdd //background color for instruments
                                    });
                                rivi+=1     //if instrument has several soundChannels --> vertical position increases      
                            })
                        } //end of for
                        if(evenOrOdd==1){evenOrOdd=0}
                        else{evenOrOdd=1;}
                        //evenOrOdd===1?0:1;  //toggles between 1 and 0
                        
                    //data for texts in the svg
                        rh_instruments.push({
                            name:value.name,
                            y: vertPos,
                            soundChannels: value.sound_channels,
                            patternLength: value.length
                        })
                        //console.log("All instrumentsin buildJSON: " + rh_instruments)
                        console.log("vertikaalinen positio: " + vertPos)
                     vertPos-=iSc  
                     console.log("vertikaalinen positio: " + vertPos)
                   
                    }); //end of forEach(){rawRhythm.instruments
                
                    console.log("buildJSONin lopussa, jalostettu JSON: " + JSON.stringify($scope.curRhythm));                         
                    //in the start-up of program --> let's create the D3-palikka responsible for
                    //visual  representation of the notes
                    if(!$scope.sPlot){
                        $scope.sPlot = new d3.djeNotation.scatPlot();  //Huom! new!!
                        var width = 900, height = 700;
                        console.log("Luotiin d3.djeNotation.scatPlot in buildJSON");
                        svg = d3.select("svg")  //d3 wrapper around our svg element
                        .style("width", width)
                        .style("height", height)
                        //var sgroup = svg.append("g")
                        .attr("transform", "translate(50, 0)")
                        $scope.sPlot(svg)
                        $scope.sPlot.width(width)
                        .height(height)
                    }
                   
                    //use chained methods in D3.notation to initialize rhythm with data
            
                console.log("$scope.sPlot tallainen: " + $scope.sPlot);
                    $scope.sPlot
                    .reset()
                    .data($scope.curRhythm)
                    .rhythmName(rawRhythm.name)
                    .patternLength(rawRhythm.pattern_length)
                    .soundChannels(rSc)
                    .measure(measure)
                    .instruments(rh_instruments)
                    .create();
            
                    /* TODO:  convert rhythm gotten as parameter into the structure of specs, same structure as in rhythms.json originally fetched in app.js
                     get rid of 'x', 'y' -fields */
                    $scope.sPlot.on("saving", function(rhythm_data) {
                            console.log(" In rhythm.js: $scope.sPlot saved !!! : " + JSON.stringify(rhythm_data)); 
                        console.log("katso ylemmäs: Haettiin $scope.sPlotista notesData: " + $scope.sPlot.data());
                        // call function given from outer world to directive 
                        // watch scope-field in DDO
                        $scope.rhythm = rhythm_data;
                        $scope.saverhythm({rhythm_data: $scope.sPlot.rhythmName});//inform app.js     
                    })
                    /*.updateGrid()  //private functions now
                    .createSoundSelection()
                    .updateNotes()*/
                    console.dir("$scope.sPlot.dir tallainen2: " + $scope.sPlot);
                    console.log("...............djeRhythm buildJSON ends...............")
                } //end of buildJSNON
     
      },
      link: function(scope, iElem, attrs, rhythmCtrl) {   
          //add svg to the directives DOM TODO size dynamically
         svg = d3.select(iElem[0]).append('svg')
                    .style("border", "solid 3px gray");
          
                // Watch the data attribute of the scope
                scope.$watch('rhythm', function(newVal, oldVal, scope) {
                    console.log("Muuttui annettu rytmi: rhythm: " + JSON.stringify(scope.rhythm) )
                    // Update the chart
                    if(rhythmCtrl.isDirty()){
                        console.log("Do you want to save changes in the previous rhythm?");  
                    }
                    else{console.log("previous rhythm is not dirty")}
                    if (scope.rhythm) {
                        console.log("Post $watch(ryhythm), uusi rytmi valittu eikä ole tyhjä");
                        rhythmCtrl.buildJSON(scope.rhythm);                
                    }
                }, true);
                
                scope.$watchCollection('instruments.instruments', function(newVal, oldVal, scope) {
                    console.log("Uudet instrumentit $watcCollectionissa:" + JSON.stringify(scope.instruments) )
                    // Update the chart
                    if (scope.instruments.instruments) {
                        console.log("Post $watch(instruments.instruments), uudet instrumentit, ei tyhjä");
                       
                    }
                });
        }      
    };
    }
])

