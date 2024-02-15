var websocketadress = CONFIG.wsurl;
var websocket;

var video = document.querySelector("#video");
if (navigator.mediaDevices.getUserMedia) {
     navigator.mediaDevices.getUserMedia({ video: true })
       .then(function (stream) {
         video.srcObject = stream;
       })
       .catch(function (err0r) {
         console.log("Something went wrong!");
       });
}

var resultb64="";

// function capture() {        
//    var canvas = document.getElementById('canvas');     
//    var video = document.getElementById('video');
//    canvas.width = 500;
//    canvas.height = 500;
//    canvas.getContext('2d').drawImage(video, 0, 0, 500,500);  
//    resultb64=canvas.toDataURL();
//    document.getElementById("printresult").innerHTML = canvas.toDataURL();
// }
//  document.getElementById("printresult").innerHTML = resultb64;


function  grabCamImageAndSend() {        
   var canvas = document.getElementById('canvas');     
   var video = document.getElementById('video');
   canvas.width = 512;
   canvas.height = 512;
   canvas.getContext('2d').drawImage(video, -85, 0, 682,512);  
   resultb64=canvas.toDataURL();
//    document.getElementById("printresult").innerHTML = canvas.toDataURL();
    var event = {
        type: "command",
        command: "inputimage1",
        src: "screen",
        data: resultb64
    };
    websocket.send(JSON.stringify(event));
};

//  document.getElementById("printresult").innerHTML = resultb64;


$( document ).ready(function() {

    $("#capture").on("click", function() {
        grabCamImageAndSend()
        // capture()
      });
    
      


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
                $("#prompt").html(event.sdparams.prompt)

                if (event.screen.showprompt) {
                    $("#prompt").fadeIn(500);
                } else {
                    $("#prompt").fadeOut(500);
                }

                // console.log(event);
                if (event.status == "promptupdate") {
                    $("#prompt").html(event.data)
                }
                else if (event.status == "currentimage") {
                    currentimage = event.data
                    // if scrollindex
                }else if (event.status == "scrollspeed") {
                    scrollspeed = event.data;
                    console.log(scrollspeed)
                } else {
                    // console.log(event)
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

  
