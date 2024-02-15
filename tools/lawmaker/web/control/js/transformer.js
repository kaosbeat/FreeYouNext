var websocketadress = CONFIG.wsurl;
var websocket;

screenconnected = false;
sketchconnected = false;

scrollspeedscale = 5 

var changeseasondone = true;
// var customprompt, promptprefix, promptsuffix, negativeprompt;
var imagetransform, metaphortexttransform, metaphorpaintingtransform, soundtransform


$( document ).ready(function() {
    // Handler for .ready() called.
    console.log("jquery ready");
    $(".seasonpromptlist").hide();
    $("#transforms").show()
    // send init

    $("#vbtn-edit").click(function(){
        $(".seasonpromptlist").hide();
        $("#edittransforms").show();
        // $("#currentseason").html("autumn");
        });
    $("#vbtn-transforms").click(function(){
        $(".seasonpromptlist").hide();
        $("#transforms").show();
        // $("#currentseason").html("winter");
        });

    
    $("#imagetransformpromptsubmit").click(function(){
        imagetransformprompt = $("#imagetransformprompt").val();
        // console.log(imagetransformprompt);
        var event = {
            type: "command",
            command: "imagetransformpromptupdate",
            src: "transformer",
            data: imagetransformprompt
        }
        websocket.send(JSON.stringify(event));

    });

    $("#metaphortextsubmit").click(function(){
        metaphortext = $("#metaphortext").val();
        // console.log(imagetransformprompt);
        var event = {
            type: "command",
            command: "metaphortextupdate",
            src: "transformer",
            data: metaphortext
        }
        websocket.send(JSON.stringify(event));

    });

    $("#metaphorpaintingsubmit").click(function(){
        metaphorpainting = $("#metaphorpainting").val();
        // console.log(imagetransformprompt);
        var event = {
            type: "command",
            command: "metaphorpaintingupdate",
            src: "transformer",
            data: metaphorpainting
        }
        websocket.send(JSON.stringify(event));

    });

    $("#soundtransformsubmit").click(function(){
        soundtransform = $("#soundtransform").val();
        // console.log(imagetransformprompt);
        var event = {
            type: "command",
            command: "soundtransformupdate",
            src: "transformer",
            data: soundtransform
        }
        websocket.send(JSON.stringify(event));

    });
    
    $("#transformpromptsubmit").click(function(){
        transformprompt = $("#transformprompt").val();
        var event = {
            type: "command",
            command: "transformpromptupdate",
            src: "transformer",
            data: transformprompt
        }
        websocket.send(JSON.stringify(event));

    });
    
    $(".transformtypescheck").click(function(){
        console.log($('#'+this.id).prop('checked'))
        var event = {
            type: "command",
            command: this.id,
            src: "transformer",
            data: $('#'+this.id).prop('checked')
        }
        websocket.send(JSON.stringify(event));

    });
});


window.addEventListener("DOMContentLoaded", () => {
    console.log("DOM ready")
    // // Initialize the UI.

});


function startWebsocket() {
    websocket = new WebSocket(websocketadress);
    
  
    websocket.onopen = function(e) {
        console.log("[open] Connection established");
        var event = {
            type: "status",
            status: "init",
            src: "transformer"
        };
        websocket.send(JSON.stringify(event));
    };



    websocket.onmessage = function(msg) {
            // console.log(`[message] Data received from server: ${msg.data}`);
            const event = JSON.parse(msg.data);
            switch (event.type) {
                case "status":
                    console.log("Doing status update")
                    console.log(event)
                    
                    if (event.connectioninfo.connidjson.screen.length == 0) {screenconnected = false} else {screenconnected = true;}
                    //     // if (event.data.sketch.length == 0) {sketchconnected = false} else {sketchconnected = true;}

                    $("#connections").html("");
                    $("#connections").append('<li>screens connected: ' + event.connectioninfo.connidjson.screen.length  + '</li>');
                    $("#connections").append('<li>control connected: ' + event.connectioninfo.connidjson.control.length  + '</li>');
                    $("#connections").append('<li>transformer connected: ' + event.connectioninfo.connidjson.transformer.length  + '</li>');
                    // $("#connections").append('<li>sketch connected: ' + event.data.sketch.length + '</li>');
                    // if (event.data.sketch.length > 1) {
                    //     $("#connections").append('more thamn 1 sketch connected, this is a problem, close suplemental sketch screens before proceeeding');
                    // }

                    if (event.connectioninfo.readystate == true){
                        $("#readystate").removeClass("btn-danger")
                        $("#readystate").addClass("btn-success")
                        $("#readystate").html("ready")
                        $('.timebutton').removeClass("disabled")
                    } else {
                        $("#readystate").removeClass("btn-success")
                        $("#readystate").addClass("btn-danger")
                        $("#readystate").html("not ready")
                        $('.timebutton').addClass("disabled")
                    }

                    if (event.transformparams.imagetransform.init != imagetransform){
                        console.log("check this out: ", event.transformparams.imagetransform.init )
                        imagetransform = event.transformparams.imagetransform.init ;
                        $('#imagetransformprompt').html(imagetransform)
                    }
                    if (event.transformparams.metaphortexttransform.init != metaphortexttransform){
                        metaphortexttransform = event.transformparams.metaphortexttransform.init ;
                        $('#metaphortext').html(metaphortexttransform)
                    }
                    if (event.transformparams.metaphorpaintingtransform.init != metaphorpaintingtransform){
                        metaphorpaintingtransform = event.transformparams.metaphorpaintingtransform.init ;
                        $('#metaphorpainting').html(metaphorpaintingtransform)
                    }
                    if (event.transformparams.soundtransform.init != soundtransform){
                        soundtransform = event.transformparams.soundtransform.init ;
                        $('#soundtransform').html(soundtransform)
                    }
                    $('#imagecheck').prop('checked', event.transformparams.imagetransform.enabled )
                    $('#metaphorcheck').prop('checked', event.transformparams.metaphortexttransform.enabled )
                    $('#paintingcheck').prop('checked', event.transformparams.metaphorpaintingtransform.enabled )
                    $('#soundcheck').prop('checked', event.transformparams.soundtransform.enabled )

                    $('#imageanswer').html(event.transformparams.imagetransform.answer)
                    $('#metaphoranswer').html(event.transformparams.metaphortexttransform.answer)
                    $('#paintinganswer').html(event.transformparams.metaphorpaintingtransform.answer)
                    $('#soundanswer').html(event.transformparams.soundtransform.answer)


                    break;
                case "command":
                    console.log("comnmand here", event.command);
                    break;
                case "error":
                    console.log(event);
                    break;
                default:
                    throw new Error(`Unsupported event type: ${event.type}.`);
                }
        };


    websocket.onclose = function(event) {
        if (event.wasClean) {
            console.log(event)
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            // e.g. server process killed or network down
            // event.code is usually 1006 in this case
            console.log('[close] Connection died');
        }
        $("#connections").html("");
        $("#connections").html("disconnected from server");
        $("#readystate").removeClass("btn-success")
        $("#readystate").addClass("btn-danger")
        $("#readystate").html("not ready")
        $('.timebutton').addClass("disabled")
        websocket = null
        setTimeout(startWebsocket, 5000)
    }
}
    
startWebsocket();
  