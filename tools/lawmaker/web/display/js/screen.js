var websocketadress = CONFIG.wsurl;
var websocket;

var stagestatus = 0

var resultb64="";

// "currentfine": {"img":"path/to/imggen/fromweb", "law":"sandwichbreakerlaw"}
function fillWebContent(image, laws){
    console.log(image, laws)
  var brokenLaws = document.getElementById('laws');
  var img = document.getElementById('cctv-img');

  var date = document.getElementById('date');
  var code = document.getElementById('code');
  var systemNumber = document.getElementById('system-number');
  var prNumber = document.getElementById('pr-number');
  var price = document.getElementById('price');

  //Random generated fine page content
  date.innerHTML = `${Math.floor(Math.random()*31)+1}/${Math.floor(Math.random()*12)+1}/2023`;
  code.innerHTML = `AN.${Math.floor(Math.random()*100)}.L${Math.floor(Math.random()*100)}.${Math.floor(Math.random()*100)}/2023`
  systemNumber.innerHTML = `System number: ${Math.floor(Math.random()*100)}JF${Math.floor(Math.random()*100)}`;
  prNumber.innerHTML = `P.R Number AN.${Math.floor(Math.random()*100)}.L${Math.floor(Math.random()*100)}.${Math.floor(Math.random()*100)}/2023`
  price.innerHTML = `${Math.floor(Math.random()*1000)+100}`;
  brokenLaws.innerHTML = laws;
  //insert img
//   img.src = '/web/display/img/cctv_002.png';
  img.src = image;

  //insert violated laws

}


function  grabCamImageAndSend() {        
//    var canvas = document.getElementById('canvas');     
//    var video = document.getElementById('video');
//    canvas.width = 512;
//    canvas.height = 512;
//    canvas.getContext('2d').drawImage(video, -85, 0, 682,512);  
//    resultb64=canvas.toDataURL();
//    document.getElementById("printresult").innerHTML = canvas.toDataURL();
    var event = {
        type: "command",
        command: "grabimage",
        src: "screen",
        // data: resultb64
    };
    websocket.send(JSON.stringify(event));
};

//  document.getElementById("printresult").innerHTML = resultb64;

var currentpage = 1
var idleSeconds = 25;

$(function(){
  var idleTimer;
  function resetTimer(){
    clearTimeout(idleTimer);
    idleTimer = setTimeout(whenUserIdle,idleSeconds*1000);
  }
  $(document.body).bind('mousemove keydown click mousemove keydown DOMMouseScroll mousewheel mousedown touchstart touchmove ',resetTimer); //space separated events list that we want to monitor
  resetTimer(); // Start the timer when the page loads
});

function whenUserIdle(){
//   $("#instructions").fadeIn(500)
    var event = {
        type: "command",
        command: "reset",
        src: "screen"
    };
    websocket.send(JSON.stringify(event));
}

function resetScreen() {
    currentpage = 1
    $(".boete-container").hide()
    $(".page").hide()
    $("#p"+currentpage).show()

}

$( document ).ready(function() {    
      $("#magazine").on("click", function() {
        // status["apps"]["lawmaker"]["stage"] = 0
        if (stagestatus == 0){
            grabCamImageAndSend()
        }
        $(".page").hide()
        if (currentpage == 3){
        currentpage = 1
        } else {
            currentpage = currentpage+1
        }
        $("#p"+currentpage).show()
        // capture()
      });
    
      resetScreen() 



});

window.addEventListener("DOMContentLoaded", () => {});


function startWebsocket() {
    websocket = new WebSocket(websocketadress);
    
    websocket.onopen = function(e) {
        console.log("[open] Connection established");
        var event = {
            type: "status",
            status: "init",
            src: "screen"
          };
        websocket.send(JSON.stringify(event));
      };
    

    websocket.onmessage = function(msg) {
        // console.log(`[message] Data received from server: ${msg.data}`);
        const event = JSON.parse(msg.data);
        // console.log(event.screen.showprompt)
        switch (event.type) {
            case "command":
                if (event.command == "new") {
                    console.log("new");
                }
                
                else {
                    // console.log(event)
                }
                break;
                
            case "status":
                localstatus = event
                console.log(event);
            // status["apps"]["lawmaker"]['stage'] = 
            stagestatus = event.apps.lawmaker.stage
            if (event.apps.lawmaker.stage == 0) {
                resetScreen() 
                console.log ("stage 0 is ready")
                //fillWebContent();
            }
                if (event.apps.lawmaker.stage == 1) {
                        
                    console.log ("stage 1 is ready")
                    //fillWebContent();
                }
                if (event.apps.lawmaker.stage == 2) {
                    
                    console.log ("stage 2 is ready")
                    //fillWebContent();
                }
                if (event.apps.lawmaker.stage == 3) {
                    
                    console.log ("stage 3 is ready")
                    fillWebContent(event.apps.lawmaker.currentfine.img, event.apps.lawmaker.currentfine.law);
                    $(".boete-container").show()
                    resetTimer()



                }
                break;         
            case "error":
                console.log(event);
                break;
            default:
                throw new Error(`Unsupported event type: ${event.type}.`);
            }
      };
    
  
    websocket.onclose = function(){
      // connection closed, discard old websocket and create a new one in 5s
      console.log("[closed] Connection closed");
      websocket = null
      setTimeout(startWebsocket, 5000)
    }
  }
  
  startWebsocket();

  
