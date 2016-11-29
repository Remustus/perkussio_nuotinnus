if(!d3.djeNotation) d3.djeNotation = {};

d3.djeNotation.scatPlot = function() {
    
    var svg;
    var rootG; //rootLayer g to whic add other visual elements: notG, 
    var notG;  //add all notes of the presented rhythm
    var soundSelG;  //add visual selection elements of the sounds
    
    var selSound ={};//data of the one selected sound, see createNotePalette()
    
    /*every note with it's position in every instrument in the rhythm. 
    Also data for each possible sound in used instruments are added to same data.
    Sounds have selection field, notes don't. All data are visualised in two-dimensional grid.
    Sounds are in the uppermost row, after one row gap starts visualizations for notes.
    Data-fields are:
    x:     //horisontal position
    y:      // vertical position   
    sound:  // name of the sound:  'dje_slap', 'dje_open', 'dun_open', .....
    inst:       //name of the instrumentdjembe, kenkeni, sangban.
    instSpe:    //call, djembe1, djembe2, sangban,
    id:         //unique identifier for the data(y*horizontal length) + horizontal position
    */
    var notesData;  
   

    //virtual dimensions of the chart, soundC tells combined soundChannels of all instruments
    var pattern_length, soundC;  
    var measure;
    var instrsData =[];//names & verPos of the instrument 
    var dirty=false;  //has user changed the notation
    var rhythmName;
    
    var xScale, yScale 
    //size of the coordinating system (where all the notes are embedded)   
    var innerWidth, innerHeight;
    //size of the area where one note is embedded
    var noteWidth;
    var noteHeight;
    
   /* acts as holder for supported strokes of instrument
   and isstruction for drawing visual notes for sounds (or strokes) in soundCells.js */
    var soundCell;  
    
    //horisontal & vertigal marginal inside one visual noteCell. Can be updated dynamically 
    var horNoteMar = 10;  
    var verNoteMar = 12; 
    var pathWidth = 3;   //width of the stroke
    
    //var tamapathWidth = this.pathWidth; //for testing purpose: to make this visible from inner functions
   
    /*marginals for the whole coordinate system of thhe notes: 
    top: space for noteSymbols to select
    left: for axis and names of the instruments
    TODO left according to the length of longest instrument name by help of HTML5 canvas
    */
    var margin = {top: 110, right: 40, bottom: 30, left: 140};
    //koordinaatiston koko näytettävissä nuoteissa
    var maxX, maxY; 
    var headline;  //text element to add the name of the rhythm
    
    // create custom event to notify client 
    var dispatch = d3.dispatch(djeNotation, "saving");

    //initialization function, svgCanvas-param is the svg-element in our HTML
    function djeNotation(svgCanvas) { 
        svg = svgCanvas
        console.log("scatterin constructorissa");
        // g = container;  // lisätty --> käytetään containerina nuotinnus-koordinaatistolle
        rootG= svg.append("g")
    
        //add axels to a root layer g :
        rootG.append("g")
        .classed("xAxis", true)  
    
        rootG.append("g")
        .classed("yAxis", true)
    
        notG = rootG.append("g")  //add notes of the presented rhythm here
        console.log("notG appended");
        soundSelG = rootG.append("g") //visual selection elements of the possible sounds
    
        headline = svg.append("text") //name of the rhythm here
        .attr("text-anchor", "middle")  
        .style("font-size", "34px")  //TODO dynamic
        
        //testing only:
        svg.on("click", function(){
            var xPos, yPos;
	       var point = d3.mouse(this); 
            p ={x:point[0], y: point[1]};
            //console.log("klikattiin: "  + p.x + ", " + p.y);
            xPos = ((p.x - margin.left) / innerWidth) * pattern_length;
            yPos = ((p.y - margin.top) / innerHeight) * soundC
            console.log("klikattiin: "  + xPos + ", " + yPos);
        }) 
        console.dir("tama: " + this);
    }
  
    /*djeNotation.updateGrid = updateGrid;
    djeNotation.createNotePalette = createNotePalette;
    djeNotation.updateNotes = updateNotes;*/
    djeNotation.reset = reset;
    djeNotation.create= create;
    
    
    //resets old values;
    function reset(){
        selSound ={};  //no sound selected as default
        dirty = false;
        //remove visualization items for the old data
        var oldPaths  =  notG.selectAll("path")
        .data([])
        .exit()
        .remove();
        
        notG.selectAll("rect")
        .data([])
        .exit()
        .remove();
        
        return djeNotation;
        /*updateGrid()
        .createNotePalette()
        .updateNotes();*/ 
        
        //TODO return dirty?
    }
    
    // creates visualizations and eventhandling
    function create(){
        
        updateGrid();
        createNotePalette();
        createSave();
        updateNotes();
        
        
        headline   //name of the rhythm
        .attr("x", (width / 4))             
        .attr("y", (margin.top / 3))
        .text(rhythmName);  
    }
    
    
    function updateGrid() {
        console.log("in djeNotation updateGrid, notesData " + notesData);
        maxX = d3.max(notesData, function(d) { return d.x });
        maxY = d3.max(notesData, function(d) { return d.y });
        //soundC = maxY; 
        if(soundC!=maxY){
            console.log("ERROR :" + "scatterin sisäisesti laskema korkeus ei natsaa");
        }
        //maxY is used for size of the grid. visuals for sound selection are included
        //they are situated above the notes + one row gap
        maxY = maxY +2; 
      
      //pattern_length = maxX;
        //var maxScore = d3.max(data, function(d) { return d.data.score })  
      innerWidth = width - margin.left - margin.right;
      innerHeight = height - margin.top - margin.bottom; 
      
    noteWidth = 0.88 * (innerWidth / pattern_length); 
        
    // a little bigger gap between instruments --> steal it from noteHeights
     noteHeight = (innerHeight - ((instrsData.length - 1) * 3)) / maxY;
     
     var tmpH = noteWidth / 8;
     var tmpV = noteHeight/ 8;
      if(tmpH>10){horNoteMar = tmpH;}
      if(tmpV>12){verNoteMar = tmpV;}
      
      if(tmpH>16){horNoteMar = tmpH;}
      if(tmpV>18){verNoteMar = tmpV;}
      
   console.log("nuottialueen koko: Height: " + height + ", width: " + width);
     console.log("InnerWidth: " + innerWidth + ", innerHeight: " + innerHeight + ", noteWidth: " + noteWidth + ", noteHeight: " + noteHeight)
     console.log("horNoteMar: "+horNoteMar);
      console.log("verNoteMar: "+verNoteMar);   

    console.log("maxX: " + maxX + ", maxY: " + maxY);
    //var colorScale = d3.scale.category20();
      
      
    xScale = d3.scale.linear()
        .domain([0, maxX ])
        .range([margin.left, innerWidth])

    //size of the circle according to amount of comments
    /*var yScale = d3.scale.linear()
    .domain(d3.extent(data, function(d) { return d.data.num_comments }))
    .range([3, 15])*/

    yScale = d3.scale.linear()
      .domain([0, maxY ])
      .range([innerHeight + margin.top , margin.top])
  
     var xAxis = d3.svg.axis()
    .scale(xScale)
    .ticks(maxX)
    

    var yAxis = d3.svg.axis()
    .scale(yScale)
    .ticks(maxY)
    .orient("left")

    var xg = rootG.select(".xAxis")
      .classed("axis", true)
      .attr("transform", "translate(" + [0 - noteWidth / 2 ,innerHeight + margin.top] + ")")
      .transition()  //gradually movement
      .call(xAxis)

    var yg = rootG.select(".yAxis")
      .classed("axis", true)
      .classed("yAxis", true)
        .attr("transform", "translate(" + [margin.left - noteWidth / 2 ] + ")")
      .transition()  
      .call(yAxis)
    soundCell = new SoundCell(xScale,yScale, noteWidth,       noteHeight,horNoteMar,verNoteMar,pathWidth);
        
    //return djeNotation;
}
    
    function createSave(){
        console.log("...BEGIN .... createSave() .....");
        
        var dd =[{x:pattern_length - 2, y: soundC + 2}];
       // console.log("data dd: " + JSON.stringify(dd));
        
        var saveRect = notG.selectAll("rect.save")
        .data(dd, function (d) { return 1; });
        
        saveRect.enter()   //Enter
        .append("rect")
        .style("fill", "rgb(80,80,80)")
        .style("opacity", 0.2)          //Update
        .attr("class", "save")
        .attr("height", noteHeight )//  
        .attr("width", noteWidth * 2 )
        .attr("x", function(d,i){return xScale(d.x) - noteWidth / 2;})    
        .attr("y", function(d){return yScale(d.y)})
        .on("mouseover",function(d){
            d3.select(this).style("opacity", 0.32)
        })
        .on("mouseout",function(d){
            d3.select(this)
            .style("opacity", 0.2)
        })
        .on("click",function(d) {
            console.log(" In saveClick, notesData: " + JSON.stringify(notesData));
            dispatch.saving(notesData);
        })
        
        saveRect
        .exit()
        .remove()
        
        notG.append("text")
        .attr("x", xScale(pattern_length - 2))
        .attr("y", yScale(soundC + 2) + noteWidth / 2 + 3)
        .attr("class", "save")
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "black")
        .text("Save");
        
        //console.log(JSON.stringify(saveRect));
        console.log("...Ends .... createSave() .....");
    }
    function saveDetails(d){
        console.log("Savebuttonin koordinaatit: " + d.x + ", " + d.y) ;
    }
    
    
    
    //creating a toolbar for possible sounds to be selected, added to same JSON-collection as notes, positioned above notes with a gap of one row.
    function createNotePalette(){
        var xPositio =0; // horizontal position for a particular note
        var instrTypesData=[]; // 'djembe', 'dundun'  data for captions for palette
        console.log("....BEGINS createNotePalette........")
        
        var curIns, curSoundSou; // instrument & soundsource
        var allInstruments = soundCell.getSoundCells();  //in 'values' -property are sounds
        console.log("allInstruments: " + JSON.stringify(allInstruments));
        for(i=0;i<allInstruments.length;i++){
            
            var curIns = allInstruments[i];
            console.log("current instrument: " + JSON.stringify(curIns))
            console.log("outer loop :" + curIns.name);
            console.log("")
            
            //names for instruments above palette
            instrTypesData.push({name:curIns.name, x: xScale(xPositio), y: yScale(soundC + 2) - noteHeight/ 3});
            
            // add data for notes in notePalette:
            for(j=0;j<curIns.values.length;j++){
                curSoundSou = curIns.values[j];
                console.log("current soundSource: " + JSON.stringify(curSoundSou));
                notesData.push({
                x: xPositio,
                y: soundC + 2, // above the top row of notes + one row gap  
                sound: curSoundSou.name,  // 'slap','open',...
                inst: allInstruments[i].name,  //'djembe' or 'dundun'.
                soundSource:curSoundSou.soundSource,
                selection: allInstruments[i].name, //marker, part of palette
                id: (soundC + 2) * pattern_length + i //identifier in two-dimens grid      
            });
               xPositio=xPositio+1; 
                console.log("xPositio: " + xPositio);
            } 
            xPositio+=1;  //create a gap between instruments     
        }
        
        // palauttaa tyhjännuotin TODO fiksummin
        var emptyNote = soundCell.getSoundCell("ei","ole"); 
        notesData.push({
                x: xPositio,
                y: soundC + 2, // above the top row of notes + one row gap  
                sound: "emp",  // 'slap','open',...
                inst: "emp",  //'djembe' or 'dundun'.
                soundSource:"emp",
                selection: "emp", //marker, part of palette
                id: (soundC + 2) * pattern_length + i //identifier in two-dimens grid 
        });
        
        instrTypeCaptions = notG.selectAll("text.instrType")
        .data(instrTypesData)
      
      instrTypeCaptions
      .enter()
      .append("text")
      .attr("class", "instrType")
      .attr("text-anchor", "start")
      .attr("font-family", "sans-serif")
      .attr("font-size", "18px")
      .attr("fill","teal")
      .attr("x", function(d){return d.x;})
      .attr("y", function(d){return d.y;})
      .text(function(d){return d.name})  //name of the instrument
      
      instrTypeCaptions
      .exit()
      .remove()
       
      //return djeNotation; no need to be part of public API    
    }
     
  function updateNotes() {
      console.log("BEGIN....updateNotes() ");
    //divide the notes into groups by note(sound)
    var dataByNotes = d3.nest()
    .key(function(el) {return el.soundSource})
    .key(function(el){return el.sound})
    .entries(notesData);
     
    // ************************************************************************ 
    // *******  ITERATION  on aggregated groups based on sounds begin  ********
    // ************************************************************************
     //element :  data-items under particular key (particular soundSOurce) in json
      //index is the index of that element in dataByNotes
      //array <==> dataByNotes 
      /* css class given for items identifying DOM to corresponding soundSource&sound currently iterated */
      
      var soundClass;  
      // iterate soundSources
      dataByNotes.forEach(function (element, index, array) {
          
        console.log("BEGIN....in dataByNotes.forEach , element: " + JSON.stringify(element));
        console.log("current sound outer (key): " + element.key);
          
          //iterate sounds inside SoundSource
          element.values.forEach(function(el, ind, ar){
            soundClass = element.key+"_"+el.key;  //create class selection is based on
              
              console.log("INside second loop , key: " + element.key +","+el.key);
              /*console.log("el.values: " + JSON.stringify(el.values));
              
              console.log("END of el.values");*/
        
        // finds object correspondig specific sound of soundsource and get it's 
        // function for drawing instructions of the note
        var drawFunc =soundCell.getSoundCell(element.key, el.key).drawNote;
          //var curSoundCell = soundCell.getSoundCell(element.key, el.key);
          //console.log("curSounCell retrieved in scatter: "+ JSON.stringify(curSoundCell))
                
              console.log("starting to call draw-function for data-items inside particular key: " + soundClass)
                         
                var myPaths  =  notG.selectAll("path." + soundClass)
                .data(el.values) //data-items under the soundSource-sound currently iterated
               
                //give dom for data given previously
                myPaths.enter()
                .append("path") //myPaths
                .attr("class", soundClass) //function(d){return })
                .attr("d", drawFunc)
                .attr("stroke-width", pathWidth)
                .attr("stroke", "black")
                .attr("fill", "none")
                .on("click",function(d){console.log("path " + d.soundSource + "_"+d.sound)})
                 //remove Doms that have no specified data  
                myPaths.exit()
                .remove();
          
                var soundRects = notG.selectAll("rect." + soundClass)
                //function identifies the data item by unique value
                .data(el.values, function (d) { return d.id; }) 
                
                console.log("soundRects data kokonaisudessaan: " + JSON.stringify(el.values));

                soundRects.enter()   //Enter DOM for new data
                .append("rect")
                .style("fill", function(d) {  return evenOrOddColor(d.evenOrOdd,d.x) })
                .style("opacity", 0.2)
                
                soundRects           //Update
                .attr("class", soundClass)
                .attr("height", noteHeight -3)//  
                .attr("width", noteWidth -4)
                .attr("x", function(d,i){return xScale(d.x) - noteWidth / 2})    
                .attr("y", function(d){return yScale(d.y)})	
                
                //click-handling for notePalette toolbar
                //as opposed to data items, notes in notePalette have a 'selection' field
                soundRects
                .filter(function(d) { return d.selection != null })
                .on("click",function(d){
                    
                    console.log("old selected sound: " + JSON.stringify(selSound));
                    prevSelSound = selSound
                    selSound = d;

                    // viz hint for selected sound in palette
                    d3.select(this).style("stroke", "black")
                    .classed("selected", true)
                    .style("stroke-width", 4)
                    .style("opacity",0)
                    .style("rx", 8)  // round corners
                    .style("ry", 8)
                    
                    // viz hint off for pevious selection in palette TODO, ei pelitä
                    /*soundRects
                    .filter(function(d2) { return d2.id == prevSound.id })
                    .classed("selected", false)
                    .attr("stroke-width", 0)
                    .attr("opacity",0.2)
                    .attr("rx", 0)  // round corners off
                    .attr("ry", 0)*/
                   // console.log("new selected sound: " + JSON.stringify(d));
                })
                .on("mouseover",function(d){
                    d3.select(this).style("opacity", 0.42)
                    myPaths.filter(function(d2){return d.x==d2.x && d.y==d2.y})
                    .attr("stroke-width", pathWidth+2)
                })
                .on("mouseout",function(d){
                    d3.select(this)
                    .style("opacity", 0.2)
                    
                    myPaths.filter(function(d2){ return d.x==d2.x&&d.y==d2.y})
                    .attr("stroke-width", pathWidth)
                })
                
                soundRects.exit()     //Exit
                .remove();
              
              
              // click handling for actual notes. This is the last activity in updateNotes on purpose, as handleClick() can call updateNotes - loysy way to avoid overlapping function-calls TODO
              soundRects
              .filter(function(d) { return d.instSpe != null }) //markerfield:a rhythm note
              .on("click",function(d){
                    console.log("in sounRects click, sound saved in rect " + d.sound + " x,y: " + d.x + "," + d.y);
                handleNoteClick(d);
                        })
                .on("mouseover",function(d){
                    d3.select(this).style("opacity", 0.42)
                    myPaths.filter(function(d2){return d.x==d2.x && d.y==d2.y})
                    .attr("stroke-width", pathWidth+2)
                })
                .on("mouseout",function(d){
                    d3.select(this)
                    .style("opacity", 0.2)
                    
                    myPaths.filter(function(d2){ return d.x==d2.x&&d.y==d2.y})
                    .attr("stroke-width", pathWidth)
                })
              
              console.log(JSON.stringify("soundRects selection: " + soundRects));
              
          })  //end of inner forEach, sounds in soundSource           
        })   //end of dataByNotes.forEach  soundSOurces
      
        console.log("instrumentit data scatterissa:")
            angular.forEach(instrsData, function(value, key){
                console.log("nimi: " +value.name +", y-pos: " + value.y)
            })
      
    // names of the instruments on the left
      instrHeadlines = notG.selectAll("text.instruments")
      .data(instrsData)
      
      instrHeadlines
      .enter()
      .append("text")
      .attr("class", "instruments")
      .attr("text-anchor", "start")
      .attr("font-family", "sans-serif")
      .attr("font-size", "18px")
      .attr("fill","teal")
      .attr("x", 4)
      
      instrHeadlines
      .attr("y", function(d){return parseInt(yScale(d.y) + noteHeight / 2)})
      .text(function(d){return d.name})  //name of the instrument
      
      instrHeadlines
      .exit()
      .remove()
       console.log("ENDS....updateNotes() ");
      
      
      //return djeNotation;
  }  //end of updateNotes
    
    
    
    //when one of the notes are clicked, d is data for that old data
    function handleNoteClick(d){
        console.log("in handleNoteClick(d), selection " + d.selection + ",instrument: " + d.inst);
        
        //a note was clicked
        //if some sound is selected in the first place  TODO no hardcoding
        if((!!selSound&&selSound.soundSource==d.soundSource)|| selSound.sound=="emp"){  
           console.log("Changing note, selected new sound from toolbar: " + selSound.sound);
            var oldNote; //temporary, old data of the note clicked
            oldNote = d;
            
            //remove old data
            console.log("amount of dataItems in notesData: " + notesData.length);
            var removeIndex = notesData.map(function(d) { return d.id; })
                       .indexOf(d.id);
            
            console.log("index in notesData to be removed: " + removeIndex);

            ~removeIndex && notesData.splice(removeIndex, 1);
            
             console.log("amount of dataItems in notesData after removing old note : " + notesData.length);
            
            // TODO these should be captured in updateNotes-function in their
            // exit().remove part as the data doesn't exist. Used to work earlier!!
            // Shouldn't need these!!
            notG.selectAll("path")
            .filter(function(dd) { return dd.id== d.id })
            .remove();
            notG.selectAll("rect")
            .filter(function(dd) { return dd.id== d.id })
            .remove(); // end of shouldn't need
            
            console.log("new data: x: "+d.x+", y:"+d.y+", sound: "+selSound.sound);
            notesData.push({
                x:d.x,
                y: d.y,   
                soundSource: d.soundSource,
                sound:selSound.sound,
                inst: d.inst,  //djembe, sangban ym.
                instSpe: d.instSpe,
                id: d.id //identifier in two-dimens grid
            });   
            
            console.log("amount of dataItems in notesData after replacing old note with new one, newly added items are last on the list!!: " + notesData.length +", notesData: " + JSON.stringify(notesData));
            console.log("new item added to notesdata, last one above!!!")
            console.log("")
            updateNotes();  //should remove DOM:s without data!!(=removed item)
           
            dirty = true;

        } //no sound selected
        else{
            console.log("no sound selection made!!");
        }
    }
    
    //param evenOrOddBackgroundColor: color distinction for different instruments
    //param horPos: horizontal position
    //return color for
    function evenOrOddColor(evenOrOddBackgroundColor, horPos){
                var r,g,b;
                if(evenOrOddBackgroundColor==1){
                    r=235;
                    g=235;
                    b=140;
                }
                else if (evenOrOddBackgroundColor==0){
                    r=135;
                    g=235;
                    b=200;
                }
                 else{  //sound selection
                   return "rgb(80,80,80)"; 
                }
        
                var index=0;
                for(i=measure;i<=pattern_length;i+=measure){
                    
                    if(horPos<i){   
                        if(index%2==0){r-=50;g-=80;b-=110;} //make lighter colors
                        break;
                    }
                    console.log("Indeksi in evenOrOddColor: "+ index);
                    index+=1;
                }
               
            return "rgb("+r+","+g+","+b+")";
            
    }

  djeNotation.data = function(value) {
    if(!arguments.length) return notesData;
    notesData = value;
      console.log("asetettiin data scatPlotissa: " + JSON.stringify(notesData));
    return djeNotation;
  }
  
  djeNotation.width = function(value) {
    if(!arguments.length) return width;
    width = value;
    return djeNotation;
  }
  
  djeNotation.height = function(value) {
    if(!arguments.length) return height;
    height = value;
    return djeNotation;
  }
  
  djeNotation.rhythmName = function(value) {
    if(!arguments.length) return rhythmName;
    rhythmName = value;
      console.log("patternLength set in Scatter: " + value);
    return djeNotation;
  }
  
  
  djeNotation.patternLength = function(value) {
    if(!arguments.length) return pattern_length;
    pattern_length = value;
      console.log("patternLength set in Scatter: " + value);
    return djeNotation;
  }
  
  djeNotation.soundChannels = function(value) {
      console.log("in scatter soundChannels: " + value);
    if(!arguments.length) return soundC;
    soundC = value;
      console.log("SoundChannels set in Scatter: " + value);
    return djeNotation;
  }
  
  djeNotation.measure = function(value) {
    if(!arguments.length) return measure;
    measure = value;
    return djeNotation;
  }
  
  //data for instruments used in rhythm
  djeNotation.instruments = function(value) {
    if(!arguments.length) return instrsData;
    instrsData = value
    console.log("Instruments in Scatter: " + JSON.stringify(instrsData));
    return djeNotation;
  }
  
  //has notation been changed
  djeNotation.dirty = function(value) {
    return dirty;
  }

  //return djeNotation; - ei riitä tapahtumien välittämiseen asiakkaalle
  //returning public API & also making possible to the client to listen custom event 'saving'
  return d3.rebind(djeNotation, dispatch, "on");  
}