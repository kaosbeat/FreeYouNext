var websocketadress = CONFIG.wsurl;

// var websocketadress =  "wss://192.168.1.166:8001"
var websocket;


let camera_button = document.querySelector("#start-camera");
let video = document.querySelector("#video");
let click_button = document.querySelector("#click-photo");
let canvas = document.querySelector("#canvas");
let dataurl_container = document.querySelector("#dataurl-container");
let downloadBtn = document.querySelector("#downloadID");
let resetBtn = document.querySelector("#resetBtn");
let fileName = document.querySelector("#fileName");


camera_button.addEventListener('click', async function() {
  let stream = null;
 try {
   stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
 }
 catch(error) {
   alert(error.message);
   return;
 }
 video.srcObject = stream;
 video.style.display = 'block';
 camera_button.style.display = 'none';
 click_button.style.display = 'block';
});

click_button.addEventListener('click', function() {
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
   let image_data_url = canvas.toDataURL('image/jpeg');
downloadBtn.href = image_data_url;
  dataurl_container.style.display = 'block';
  downloadBtn.style.display = 'block';
  fileName.style.display = 'block';
  resetBtn.style.display = 'block';
});


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
                console.log(event);
            // status["apps"]["lawmaker"]['stage'] = 2

                if (event.apps.lawmaker.stage == 2) {
                    
                    console.log ("stage 2 is ready")
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

  
