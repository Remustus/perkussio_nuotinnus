function SoundCell(xs, ys, nw, nh,hnm, vnm,pw){
    xSca = xs;
    ySca = ys;
    xxScale=xs;
    yyScale=ys;
    var noteWidth = nw;
    //console.log("SoundCell.noteWidth inside SoundCell: " + SoundCell.noteWidth);
    //console.log("xSca inside SoundCell: " + xSca);
    var noteHeight = nh;
    var horNoteMar = hnm;
    var verNoteMar = vnm ;
    var pathWidth = pw;
    var extraGap= 3;  //between instruments
    
    
    
    this.getSoundCell = function (ss,soundName){
        //verNoteMar = noteHeight / 12;
        console.log("****  BEGINS SoundCell.getSoundcell()");
        console.log("parametri ss: "+ ss);
        console.log("parameter soundName: " + soundName);
        var instr;  // data of instruments
        var soundsInInstrument;
        for(i=0;i<this.instrumentTypes.length;i++){
        console.log("in SoundCell.forEach outer, instrument: " + JSON.stringify(this.instrumentTypes[i]));
        console.log("current instrument in SoundCell outer: " + this.instrumentTypes[i].name);
           
            soundsInInstrument = this.instrumentTypes[i].values.length;
             console.log("äänien määrä: " + soundsInInstrument);
            
                for(j=0;j<soundsInInstrument;j++){
                    
                    console.log("in SoundCell.forEach inner, index: " + j + " values: " + JSON.stringify(this.instrumentTypes[i].values[j]));
                    
                    console.log("objektin soundSource: " + this.instrumentTypes[i].values[j].soundSource)
 console.log("objektin soundname: " + this.instrumentTypes[i].values[j].name)                   
                    
                    if(this.instrumentTypes[i].values[j].soundSource===ss&&this.instrumentTypes[i].values[j].name===soundName){
                  console.log("iteraatiosta löytyi soundCell: " + ss + "_", soundName)
                  return this.instrumentTypes[i].values[j];
                    }  
                }         
          };
         return { 
         "name":"emp",
         "values":  [{
         soundSource:"emp",
         name:"emp",
        drawNote: function(d){return "";}
         }]
            };
      };
    
    this.getSoundCells= function(){
        return this.instrumentTypes;
    };
    
    //should be private
    this.instrumentTypes = [{
        "name": "djembe",
        "soundChannels":1,
        "values":[{
        soundSource:"djembe",
        name:"slap",
        drawNote: function(d){
            
      var polku = "M" + parseInt(xSca(d.x) - (noteWidth  / 2 -horNoteMar)) + " " +    parseInt(ySca(d.y)  + pathWidth)+ " L" + parseInt(xSca(d.x) + (noteWidth  / 2 -horNoteMar) ) + " " + parseInt(ySca(d.y) + pathWidth)
      //Vertical line
      polku = polku + " M" + parseInt(xSca(d.x)) + " " + parseInt(ySca(d.y)+ pathWidth) + "v" + (noteHeight - verNoteMar)
      return polku
        }
    },
    {
        soundSource:"djembe",
        name:"open",
        drawNote: function(d){
            console.log("in drawDjeOpen , sound: " + d.sound + "x: " + d.x + ", y: " + d.y);
     // return "M" + parseInt(xScale(d.x) - (noteWidth  / 2 -horNoteMar)) +
       polku = "M" + parseInt(xSca(d.x)+  horNoteMar/3) + " " + parseInt(ySca(d.y) + verNoteMar / 4) + " A" + (noteWidth  / 5) + ", " + noteHeight / 6 + " 0 1,0 " + parseInt(xSca(d.x) - horNoteMar / 2)  + ", " + parseInt(ySca(d.y) + (noteHeight - verNoteMar -3)  / 2)
       
      polku += " M" + parseInt(xSca(d.x) - horNoteMar / 2)  + ", " + parseInt(ySca(d.y) + (noteHeight - verNoteMar - 3)  / 2) + " A" + (noteWidth  / 6) + ", " + parseInt(noteHeight / 6) + " 0 0,1 " + parseInt(xSca(d.x) - 2 * horNoteMar) + ", " + parseInt(ySca(d.y) + noteHeight - verNoteMar -4)
       //console.log("djeeOpen polku2: " + polku2)
      return polku;
        }
     }
    ,
    {
    soundSource:"djembe",
      name:"bass",
        drawNote: function(d){
           console.log("in drawDjeBass , sound: " + d.sound + "x: " + d.x + ", y: " + d.y);
          //Symbol resembling letter 'B'
         polku = "M"+ parseInt(xSca(d.x) - (noteWidth  / 2 - (1.5 * horNoteMar))) + " " + ySca(d.y) +   verNoteMar +  "v" +         (noteHeight - verNoteMar)
         polku = polku + " M" + parseInt(xSca(d.x) - (noteWidth  / 2 -(1.5 * horNoteMar))) + ", " + ySca(d.y) + verNoteMar + " A" + (noteWidth  / 2 + 3) + ", " + noteHeight / 4 + " 0 0,1 " + parseInt(xSca(d.x) - (noteWidth  / 2 -(1.5 * horNoteMar))) + ", " + parseInt(ySca(d.y) + (noteHeight - verNoteMar/ 2)  / 2)

         polku+= " M" + parseInt(xSca(d.x) - (noteWidth  / 2 -(1.5 * horNoteMar))) + ", " +  parseInt(ySca(d.y) + noteHeight   / 3 )  + " A" + (noteWidth  / 2 + horNoteMar/2) + ", " + noteHeight / 4 + " 0 0,1 " + parseInt(xSca(d.x) - (noteWidth  / 2 -(1.5 * horNoteMar))) + ", " + parseInt(ySca(d.y) + noteHeight - verNoteMar + 1)
         
        // consoleog("dje_bass polku: " + polku4)
     return polku; 
        }       
    }
    ] }  // end of djembe notes
    ,
     { 
         "name":"dundun",
         "soundChannels":2,
         "values":  [{
         soundSource:"bell",
         name:"open",
        drawNote: function(d){
              console.log("in drawBellOpen , sound: " + d.sound + "x: " + d.x + ", y: " + d.y);
      
      var polku = "M" + parseInt(xSca(d.x) - noteWidth / 2 + horNoteMar) + " " + parseInt(ySca(d.y) + noteHeight - verNoteMar) + " L" + parseInt(xSca(d.x) + noteWidth / 2 - horNoteMar) + " " + parseInt(ySca(d.y) + (1.5 * verNoteMar))
      
      polku += " M" + parseInt(xSca(d.x) - noteWidth / 2 + horNoteMar) + " " +  parseInt(ySca(d.y) + (1.5 * verNoteMar)) +" L" + parseInt(xSca(d.x) + noteWidth / 2 - horNoteMar) + " " + parseInt(ySca(d.y) + noteHeight - verNoteMar)
      
      return polku;
          }
     }
    ,
    {
        soundSource:"dundun",
        name:"bass",
        drawNote: function(d){
            console.log("in drawDunBass , sound: " + d.sound + "x: " + d.x + ", y: " + d.y);
      
      //Symbol resembling letter 'B'
    polku = "M"+ parseInt(xSca(d.x) - (noteWidth  / 2 - (1.5 * horNoteMar))) + " " + parseInt(ySca(d.y) +   verNoteMar) +  "v" +         (noteHeight - 2 * verNoteMar)
         polku = polku + " M" + parseInt(xSca(d.x) - (noteWidth  / 2 -(1.5 * horNoteMar))) + ", " + parseInt(ySca(d.y) + verNoteMar) + " A" + (noteWidth  / 2 + 3) + ", " + noteHeight / 4 + " 0 0,1 " + parseInt(xSca(d.x) - (noteWidth  / 2 -(1.5 * horNoteMar))) + ", " + parseInt(ySca(d.y) + (noteHeight - verNoteMar/ 2)  / 2)

         polku+= " M" + parseInt(xSca(d.x) - (noteWidth  / 2 -(1.5 * horNoteMar))) + ", " +  parseInt(ySca(d.y) + noteHeight   / 3 )  + " A" + (noteWidth  / 2 + horNoteMar/2) + ", " + noteHeight / 4 + " 0 0,1 " + parseInt(xSca(d.x) - (noteWidth  / 2 -(1.5 * horNoteMar))) + ", " + parseInt(ySca(d.y) + noteHeight - verNoteMar + 1)    
        // consoleog("drawDunBass: " + polku4)
     return polku;
        }   
    }
    ,
    {
        soundSource:"dundun",
        name:"closed",
        drawNote: function(d){
         console.log("IN SoundCell. dundun_closed BEGINS, d: " +JSON.stringify(d));   
        var polku ="M "+ xSca(d.x) + " " + ySca(d.y) + noteWidth / 2 + " a " + noteWidth / 4 + " " + noteWidth / 4 + " 0 1 0 0.00001 0";
            console.log("IN SoundCell. dundun_closed, drawNote, palautetaan: " + polku)
        return polku
           // M 100 100 a 50 50 0 1 0 0.00001 0  esim. 09999% circle
        }
        /*drawNote: function(d){
        console.log("in drawDunClosed , sound: " + d.sound + "x: " + d.x + ", y: " + d.y);
      var polku = "M" + xSca(d.x) + ", " + parseInt(ySca(d.y) + verNoteMar) + " A" + (noteWidth -  (2 * horNoteMar)) / 2 + ", " + parseInt((noteHeight - 1.5 * verNoteMar) / 2) + " 0 0, 1 " + xSca(d.x) + ", " + parseInt(ySca(d.y) + verNoteMar - 6)
      console.log("dun_closed polku: " + polku)
        } */
        
    }]
    }
    ]
}

