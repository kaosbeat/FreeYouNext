var websocketadress = CONFIG.wsurl;
var websocket;




$( document ).ready(function() {

    $("#test").on("click", function() {
        grabCamImageAndSend()
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

