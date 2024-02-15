var websocketadress = CONFIG.wsurl;
var websocket;

screenconnected = false;
sketchconnected = false;

scrollspeedscale = 5 

var changeseasondone = true;
var custommode, customprompt, promptprefix, promptsuffix, negativeprompt;

var laststatus = {type:"init"}


function getDate() {
    var d = new Date();
    var datestring = d.getFullYear() + ("0"+(d.getMonth()+1)).slice(-2) + ("0" + d.getDate()).slice(-2) + "_" + ("0" + d.getHours()).slice(-2) + ("0" + d.getMinutes()).slice(-2);
    return datestring
}

function initSort() {
    /////http://johnny.github.io/jquery-sortable/
    // $("#segmentlist").sortable({
    //     onDrop: function  ($item, container, _super) {
    //         var $clonedItem = $('<li/>').css({height: 0});
    //         $item.before($clonedItem);
    //         $clonedItem.animate({'height': $item.height()});
        
    //         $item.animate($clonedItem.position(), function  () {
    //         $clonedItem.detach();
    //         _super($item, container);
    //         });
    //         // console.log("drop it like its hot", segmentlist)
    //     },
    // });
}

function loadSession(session_id) {
    session = laststatus.apps.infinitePanorama["session"]
    console.log("showing session", session)

    /// all the stuff for the session load/create tab
    $("#titlefield").val(session["config"]["title"])
    $("#modeltype").val(session["config"]["model"])
    $("#imgsize").val(session["config"]["size"])
    $("#pathfield").val(session["config"]["path"])
    $("#timestamp").html(session["config"]["timestamp"])
    $("#sessionid").html(session_id)
    $("#sessionid").val(session_id)
    
    $("#segmentlist").html("");

    if (session["config"]["segments"].length == 1){
        $(".segbuttons").addClass("disabled")
    } else {
        $(".segbuttons").removeClass("disabled")
        $("#segmenttitledisplay").html("<span id='currentsegmentprompt'> "+ session["config"]["segments"][0].pos +" </span><span>"+ session["config"]["segments"][0].title + "</span>")
        $("#currentsegmentprompt").val(session["config"]["segments"][0].pos)

    }
    session["config"]["segments"].forEach(segment => {
        $("#segmentlist").append("<li><h5>"+ segment.pos +"</h5><h6>"+ segment.title + " duration: " + segment.time + "</h6></li>")
    });
    initSort()
    $("#createsession").hide();
    sessionformChanged = false




    ///all the stuff for the session prompt 
    
}


function updateSegments(laststatus){
    // console.log("segments:" , laststatus.apps.infinitePanorama.currentsegment)
    currentsegment =  laststatus.apps.infinitePanorama.currentsegment
    $(".segprompt").hide();
    $(".segid"+laststatus.apps.infinitePanorama.currentsegment).show();
    $("#segmenttitledisplay").html("<span id='currentsegmentprompt'> "+ 
    laststatus.apps.infinitePanorama.session["config"]["segments"][currentsegment].pos +" </span><span>"+ laststatus.apps.infinitePanorama.session["config"]["segments"][currentsegment].title + "</span>")
    $("#currentsegmentprompt").val(
    laststatus.apps.infinitePanorama.session["config"]["segments"][0].pos)
    // laststatus.apps.infinitePanorama["currentsegment"] = currentsegment
}


function prepPrompts(laststatus){
    $("#sessionpromptlist").html("")
    for (let key in laststatus.apps.infinitePanorama.session.prompts) {
        $("#sessionpromptlist").append("<p class='lead text-dark prompt segprompt segid"+ laststatus.apps.infinitePanorama.session.prompts[key]["segment_id"] +"'>" + laststatus.apps.infinitePanorama.session.prompts[key]["prompt"] +"</p>")
    }

    $(".prompt").hover(function() {
            $(this).addClass("bg-info-subtle");
        }, function() {
            $(this).removeClass("bg-info-subtle");
        });
    $(".stylepromptimg").hover(function() {
            $(this).addClass("bg-info-subtle");
        }, function() {
            $(this).removeClass("bg-info-subtle");
        });

    $(".prompt").click(function(){
        $(".prompt").removeClass("bg-info");
        $(this).addClass("bg-info");
        // console.log($(this).parent().get(0).id)
        prompttext = $(this).html();
        var event = {
            type: "command",
            command: "promptupdate",
            src: "control",
            data: prompttext
        }
        websocket.send(JSON.stringify(event));
    });
    updateSegments(laststatus)
}



$( document ).ready(function() {
    // Handler for .ready() called.
    console.log("jquery ready");
    $(".seasonpromptlist").hide();
    // $("#segmentprompting").hide();
    $("#customprompts").show()
    $(".segprompt").hide();
    $(".segid0").show();
    // send init
    $("#black").click(function(){
        var event = {
            type: "command",
            src: "control",
            command: "black"
          };
        // console.log("hello from black")
        websocket.send(JSON.stringify(event));
        });

    $("#seedlock").click(function(){
        var event = {
            type: "command",
            src: "control",
            command: "seedlock"
            };
        websocket.send(JSON.stringify(event));
        });
    
    $("#showprompt").click(function(){
        var event = {
            type: "command",
            src: "control",
            command: "showprompt"
            };
        websocket.send(JSON.stringify(event));
        });

    //// sketch refresh
    $(".sketchrefresh").click(function(){
        var event = {
            type: "command",
            src: "control",
            command: "sketchrefresh",
            data: $(this).html() 
        }
        $("#sketchrefreshindicator").html(event["data"]+"s");
        websocket.send(JSON.stringify(event));
    })
    $("#sketchrefreshindicator").click(function(){
        console.log("sketchrefresh")
    })
    //// ai refresh
    $(".airefresh").click(function(){
        var event = {
            type: "command",
            src: "control",
            command: "airefresh",
            data: $(this).html() 
        }
        websocket.send(JSON.stringify(event));
    })
    $("#airefreshindicator").click(function(){
        console.log("airefresh")
    })

    /// season select


    $("#vbtn-hacker").click(function(){
        $(".seasonpromptlist").hide();
        $("#hackerprompts").show();
        // $("#currentseason").html("autumn");
        });
    $("#vbtn-autumn").click(function(){
        $(".seasonpromptlist").hide();
        $("#autumnprompts").show();
        // $("#currentseason").html("winter");
        });
    $("#vbtn-winter").click(function(){
        $(".seasonpromptlist").hide();
        $("#winterprompts").show();
        // $("#currentseason").html("winter");
        
        });
    $("#vbtn-spring").click(function(){
        $(".seasonpromptlist").hide();
        $("#springprompts").show();
        // $("#currentseason").html("spring");
        
        });
    $("#vbtn-summer").click(function(){
        $(".seasonpromptlist").hide();
        $("#summerprompts").show();
        // $("#currentseason").html("summer");
        });
    $("#vbtn-session").click(function(){
            let prompt = $("#custompromptprefix").val() + " " + $("#customprompt").val() + " " + $("#custompromptsuffix").val()
            let negativeprompt = $("#negativeprompt").val()
            $(".seasonpromptlist").hide();
            $("#sessionprompts").show();
            $("#sessioneditprompt").html(prompt)
            $("#sessioneditnegativeprompt").html(negativeprompt)

            // fillsession()
            // $("#currentseason").html("summer");
            });
    $("#vbtn-live").click(function(){
        $(".seasonpromptlist").hide();
        $("#customprompts").show();
        $(".custompromptbtn").removeClass("disabled")
        // $("#currentseason").html("custom");     
        });
    
    $('#scrollspeedslider').change( function() {
            scrollspeed = $("#scrollspeed").val()/scrollspeedscale;
            var event = {
                type: "command",
                command: "scrollspeed",
                src: "control",
                data: scrollspeed
            }
            websocket.send(JSON.stringify(event));
        });
    
        
    $("#promptmodetoggle").click(function(){
        var event = {
            type: "command",
            src: "control",
            command: "promptmode"
          };
        websocket.send(JSON.stringify(event));
        });


    $(".stylepromptimg").click(function(){
        $(".stylepromptimg").removeClass("bg-info");
        $(this).addClass("bg-info");
        // if (this.id == "currentcustomstyleprompt") {
        style = $(this).html();
        // } else {
        //     style = $(this).attr('alt');
        // }
        var event = {
            type: "command",
            command: "styleupdate",
            data: style
        }
        websocket.send(JSON.stringify(event));

    });
    $("#airefreshtoggle").click(function(){
        var event = {
            type: "command",
            command: "startai",
            src: "control",
            data: $(this).html()
        }
        websocket.send(JSON.stringify(event));
        console.log(event)

    });

    $("#custompromptsubmit").click(function(){
        $(".prompt").removeClass("bg-info");
        $("#currentcustomprompt").addClass("bg-info");
        // newseason = "custom"
        // if (newseason != $("#currentseason").html()) {
        //     // change season if season needs changing
        //     $("#currentseason").html("custom");
        //     // seasonpower = $("#seasonpower").val();
        //     season = "custom"
        //     var event = {
        //         type: "command",
        //         command: "changeseasonintensity",
        //         src: "control",
        //         data: season
        //     }
        //     websocket.send(JSON.stringify(event));
        // }
        
        prompttext = $("#customprompt").val();
        // console.log(prompttext);
        var event = {
            type: "command",
            command: "promptupdate",
            src: "control",
            data: prompttext
        }
        $("#currentcustomprompt").html(prompttext);
        websocket.send(JSON.stringify(event));

    });

    $("#custompromptprefixsubmit").click(function(){
        // $(".stylepromptimg").removeClass("bg-info");
        // $("#currentcustomstyleprompt").addClass("bg-info");
        // $("#style4").addClass("bg-info");
        
        var event = {
            type: "command",
            command: "promptprefixupdate",
            src: "control",
            data: $("#custompromptprefix").val()
        }
        // $("#style4").html(style);
        websocket.send(JSON.stringify(event));
    });

    $("#custompromptsuffixsubmit").click(function(){
        // $(".stylepromptimg").removeClass("bg-info");
        // $("#currentcustomstyleprompt").addClass("bg-info");
        // $("#style4").addClass("bg-info");
        var event = {
            type: "command",
            command: "promptsuffixupdate",
            src: "control",
            data: $("#custompromptsuffix").val()

        }
        // $("#style4").html(style);
        websocket.send(JSON.stringify(event));
    });

    $("#negativepromptsubmit").click(function(){
        // $(".stylepromptimg").removeClass("bg-info");
        // $("#currentcustomstyleprompt").addClass("bg-info");
        // $("#style4").addClass("bg-info");
        negativeprompt = $("#negativeprompt").val();
        var event = {
            type: "command",
            command: "negativepromptupdate",
            src: "control",
            data: negativeprompt
        }
        // $("#style4").html(style);
        websocket.send(JSON.stringify(event));
    });

    $("#resetcount").click(function(){
        var event = {
            type: "command",
            command: "resetcount",
            src: "control",
        }
        websocket.send(JSON.stringify(event));
    });
    $("#seedsend").click(function(){
        var event = {
            type: "command",
            command: "seed",
            src: "control",
            data: $("#seednumber").val()
        }
        websocket.send(JSON.stringify(event));
    });
    // $("#seedlock").click(function(){
    //     var event = {
    //         type: "command",
    //         command: "seedlock",
    //         src: "control",
    //         data: $("#seednumber").val()
    //     }
    //     websocket.send(JSON.stringify(event));
    // });


    $(".dashboardcolumn").hide();
    $("#sessioncolumn").show();
    $(".window").hide();
    $("#windowsession").show();
    $("#modebuttonsession").addClass("active")

    $(".modebutton").click(function(){
        console.log(this.id)
        $(".dashboardcolumn").hide();
        $(".window").hide();
        $(".modebutton").removeClass("active")
        $(this).addClass("active")
        if (this.id == "modebuttonsession") {
            $("#sessioncolumn").show();
            $("#windowsession").show();

        } else if (this.id == "modebuttonprompt") {
            $("#controlcolumn").show();
            $("#windowcontrol").show();

        }
    });
    

    
    ///sessionwindow form
    $("#timestamp").html("/"+getDate())
    $("#timestamp").click(function(){
        $(this).html("/"+getDate())
    });

    $("#segmentadd").click(function(){
        let pos = segmentlist.length  
        let title = $("#segmenttitle").val()
        let time = $("#segmenttime").val()
        segmentlist.push({"pos":pos, "title":title, "time":time})
        // $("#segmentlist").append("<li>test</li>")
        $("#segmentlist").append("<li><h6>"+ title + " duration: " + time + "</h6></li>")
        $("#segmenttitle").val("")
        $("#segmenttime").val("")

        initSort();

        // console.log(sessionsegments)
    });

    $("#loadsession").click(function(){
        // console.log(sessions[$("#sessiondropdown").val()])
        session_id = $("#sessiondropdown").val()
        var event = {
            type: "command",
            command: "loadSession",
            src: "control",
            data: session_id}
        websocket.send(JSON.stringify(event)); 
        
    });

    $("#prevsegprompt").click(function(){
        currentsegment = laststatus.apps.infinitePanorama["currentsegment"]

        if (currentsegment == 0) {
            currentsegment = laststatus.apps.infinitePanorama.session.config["segments"].length - 1
        } else {
            currentsegment -= 1
        }


        // $("#segmenttitledisplay").html("<span id='currentsegmentprompt'> "+ 
        // laststatus.apps.infinitePanorama.session["config"]["segments"][currentsegment].pos +" </span><span>"+ laststatus.apps.infinitePanorama.session["config"]["segments"][currentsegment].title + "</span>")
        
        // $("#currentsegmentprompt").val(
        // laststatus.apps.infinitePanorama.session["config"]["segments"][0].pos)
        // laststatus.apps.infinitePanorama["currentsegment"] = currentsegment
        // updateSegments(laststatus)
        var event = {
            type: "command",
            command: "currentsegment",
            src: "control",
            data: currentsegment
        }
        websocket.send(JSON.stringify(event));

    });

    $("#nextsegprompt").click(function(){
        // currentsegment = parseInt(($("#currentsegmentprompt").html()))
        currentsegment = laststatus.apps.infinitePanorama["currentsegment"]

        if (currentsegment == laststatus.apps.infinitePanorama.session.config["segments"].length - 1) {
            currentsegment = 0
        } else {
            currentsegment += 1
        }

        // $("#segmenttitledisplay").html("<span id='currentsegmentprompt'> "+ 
        // laststatus.apps.infinitePanorama.session["config"]["segments"][currentsegment].pos +" </span><span>"+ laststatus.apps.infinitePanorama.session["config"]["segments"][currentsegment].title + "</span>")
        // $("#currentsegmentprompt").val(
        // laststatus.apps.infinitePanorama.session["config"]["segments"][0].pos)
        // laststatus.apps.infinitePanorama["currentsegment"] = currentsegment
        // updateSegments(laststatus)
        var event = {
            type: "command",
            command: "currentsegment",
            src: "control",
            data: currentsegment
        }
        websocket.send(JSON.stringify(event));
        
    });

    var segmentlist = []
    $("#newsession").click(function(){
        console.log("new session")
        $("#titlefield").val("")
        $("#modeltype").val("")
        $("#imgsize").val("")
        $("#pathfield").val("")
        $("#timestamp").html("")
        $("#sessionid").html("")
        segmentlist = []
        $("#segmentlist").html("")
        segmentlist.push({"pos":0, "title":"main", "time":0})
        $("#segmentlist").append("<li><h6>"+ "main" + " duration: " + 0 + "</h6></li>")
        initSort();
        // console.log(sessionsegments)
        $("#createsession").show()
        // $("#updatesession").hide()
    });




    // $("#updatesession").click(function(){
    //     console.log("updatig a session should have restriction, this is not yet implemented. eg. sessionid and path could be conflicting")
    //     let title = $("#titlefield").val()
    //     let model = $("#modeltype").val()
    //     let size = $("#imgsize").val()
    //     let path = $("#pathfield").val()
    //     let timestamp = $("#timestamp").html()
    //     let sessionid = $("#sessionid").html()
    //     config = {"title":title, "model":model, "size":size, "path":path, "timestamp": timestamp, "segments":sessionsegments}
    //     if (title == "" || model == "" || size == "" || path == "" || $("#pathfield").val() == "") {
    //         console.log("correct mistake")
    //         console.log(config)
    //     } else {
    //         var event = {
    //             type: "command",
    //             command: "updateSession",
    //             src: "control",
    //             data: sessionid, config
    //         };
    //         websocket.send(JSON.stringify(event));
    //     }
    // });

    $("#createsession").click(function(){
        let title = $("#titlefield").val()
        let model = $("#modeltype").val()
        let size = $("#imgsize").val()
        let path = $("#pathfield").val()
        let timestamp = $("#timestamp").html()
        config = {"title":title, "model":model, "size":size, "path":path, "timestamp": timestamp, "segments":segmentlist}
        if (title == "" || model == "" || size == "" || path == "" || $("#pathfield").val() == "") {
            console.log("correct mistake")
            console.log(config)
        } else {
            var event = {
                type: "command",
                command: "createSession",
                src: "control",
                data: config
            };
            websocket.send(JSON.stringify(event));
        }
   
    });
    
    $("#segmentpromptsubmit").click(function(){
        let prompt = $("#sessioneditprompt").val() 
        let negativeprompt = $("#sessioneditnegativeprompt").val()
        let session_id = $("#sessionid").val()
        let segment_id = parseInt($("#currentsegmentprompt").html())
        sessionprompts = {prompt:prompt, negativeprompt:negativeprompt,session_id:session_id, segment_id:segment_id }
        var event = {
            type: "command",
            command: "addSessionPrompts",
            src: "control",
            data: sessionprompts
        };
        websocket.send(JSON.stringify(event));
    });

    var sessionformChanged = false;
    $('input').change(function() { 
        sessionformChanged = true;
        $("#createsession").show();
    }); 


    ///sessiontimer
    $("#fillscreen").click(function(){
        $("#sessioncontrols").toggleClass("fullscreen")
    });

    $("#smallscreen").click(function(){
        $("#timersessiontitle").toggleClass("display-4")
        $("#sessiontime").toggleClass("display-4")
        $(".segbtn").toggleClass("btn-lg")
        $(".segbtn").toggleClass("btn-sm")
    });
    
    $("#sessionstart").click(function(){

        var event = {
            type: "command",
            command: "starttimer",
            src: "control",
            data: $("#sessiontime").val()
        };
        websocket.send(JSON.stringify(event));
    })
    $("#sessionstop").click(function(){

        var event = {
            type: "command",
            command: "stoptimer",
            src: "control",
        };
        websocket.send(JSON.stringify(event));
    })

    $("#prevsegment").click(function(){
        seg = laststatus.apps.infinitePanorama.timersegment
        if (seg <= 1) {
            seg = laststatus.apps.infinitePanorama.session.config.segments.length - 1
        } else {
            seg = seg - 1
        }
        $('#timersessiontitle').html(laststatus.apps.infinitePanorama.session.config.segments[seg].title)
        $('#sessiontime').val(parseInt(laststatus.apps.infinitePanorama.session.config.segments[seg].time))
        $('#sessiontime').html(parseInt(laststatus.apps.infinitePanorama.session.config.segments[seg].time))
        var event = {
            type: "command",
            command: "changetimersegment",
            src: "control",
            data: seg
        };
        websocket.send(JSON.stringify(event));
    })
    $("#nextsegment").click(function(){
        seg = laststatus.apps.infinitePanorama.timersegment
        if (seg >= laststatus.apps.infinitePanorama.session.config.segments.length - 1) {
            seg = 1
        } else {
            seg = seg + 1
        }
        console.log(seg)
        $('#timersessiontitle').html(laststatus.apps.infinitePanorama.session.config.segments[seg].title)
        $('#sessiontime').val(parseInt(laststatus.apps.infinitePanorama.session.config.segments[seg].time))
        $('#sessiontime').html(parseInt(laststatus.apps.infinitePanorama.session.config.segments[seg].time))
        var event = {
            type: "command",
            command: "changetimersegment",
            src: "control",
            data: seg
        };
        websocket.send(JSON.stringify(event));
    })
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
            src: "control"
        };
        websocket.send(JSON.stringify(event));
        var event = {
            type: "command",
            command: "getSessions",
            src: "control"
        };
        websocket.send(JSON.stringify(event));
    };



    websocket.onmessage = function(msg) {
            // console.log(`[message] Data received from server: ${msg.data}`);
            const event = JSON.parse(msg.data);
            switch (event.type) {
                case "heartbeat":
                    $("#sessiontime").html(parseInt(event.time-event.currentsegmenttime))

                    break;
                case "status":
                    console.log("Doing status update")
                    console.log(event)
                    if (laststatus.type != "init"){
                        if (event["apps"]["infinitePanorama"]["timersegment"] != laststatus["apps"]["infinitePanorama"]["timersegment"]){
                            $('#timersessiontitle').html(event.apps.infinitePanorama.session.config.segments[event.apps.infinitePanorama.timersegment].title)
                            $('#sessiontime').val(parseInt(event.apps.infinitePanorama.session.config.segments[event.apps.infinitePanorama.timersegment].time))
                            $('#sessiontime').html(parseInt(event.apps.infinitePanorama.session.config.segments[event.apps.infinitePanorama.timersegment].time))
                        }
                        
                        if (laststatus.apps.infinitePanorama.session_id != null){
                            loadSession(laststatus.apps.infinitePanorama.session_id)
                            
                            if (event.control.promptmode == "session"){
                                $("#promptmode").html("live session mode")
                                $("#segmentprompting").show();
                                // $(".custompromptbtn").removeClass("disabled")
                                $("#sessionpromptsubmit").hide();
                                $("#sessioneditprompts").hide()
                                $('#sessionpromptlist').show()
                                prepPrompts(laststatus)
                            } else{
                                $("#promptmode").html("session edit mode")
                                $("#sessioneditprompts").show()
                                $('#sessionpromptlist').hide()
                                // session = sessions[$("#sessiondropdown").val()]
                                // if (laststatus.apps.infinitePanorama.session_id) {
                                    // session = laststatus.sessions[laststatus.session.session_id]
                                $("#segmentprompting").show();
                                $("#sessiontitle").html(laststatus.apps.infinitePanorama.session["title"])
                                // $(".custompromptbtn").addClass("disabled")
                                $("#sessionpromptsubmit").show();
                                $("#sessionpromptlist").html("")
                                prepPrompts(laststatus)
                                updateSegments(laststatus)
        
                                // }
                            }
                        }
                        
                        if (event.currentapp == "infinitePanorama") {
                            // console.log(event.apps.infinitePanorama.scrollspeed)
                            $("#currentimage").html(event.apps.infinitePanorama.currentimage) 
                            $("#scrollimage").html(event.apps.infinitePanorama.scrollimage) 
                            $("#scrollspeed").val(event.apps.infinitePanorama.scrollspeed*scrollspeedscale) 
                        }
                        if (event.sdparams.aistarted){
                            // $("#airefreshtoggle").html("stop");
                            $("#airefreshindicator").html(event.sdparams.airefresh + "s");
                            $("#airefreshindicator").removeClass("btn-outline-secondary");
                            $("#airefreshindicator").removeClass("btn-outline-danger");
                            $("#airefreshindicator").addClass("btn-outline-success");
                        } else {
                            $("#airefreshindicator").html("stopped");
                            $("#airefreshindicator").removeClass("btn-outline-secondary");
                            $("#airefreshindicator").removeClass("btn-outline-success");
                            $("#airefreshindicator").addClass("btn-outline-danger");
                        }
                        if (event.sdparams.aiready){
                            $('#aiindicator').removeClass("btn-outline-danger");
                            $('#aiindicator').addClass("btn-succes");
                            $("#aiindicator").html("ready");
                        } else {
                            $('#aiindicator').removeClass("btn-succes");
                            $('#aiindicator').addClass("btn-outline-danger");
                            $("#aiindicator").html("busy");                       
                        }
                        if (event.screen.black){
                            $("#blackindicator").html("black");
                            $("#blackindicator").removeClass("btn-secondary");
                            $("#blackindicator").removeClass("btn-light");
                            $("#blackindicator").addClass("btn-dark");
                        } else {
                            $("#blackindicator").html("show");
                            $("#blackindicator").removeClass("btn-secondary");
                            $("#blackindicator").removeClass("btn-dark");
                            $("#blackindicator").addClass("btn-light");
                        }
                        if (event.screen.showprompt) {
                            $("#promptindicator").html("shown");
                            // $("#promptindicator").removeClass("btn-secondary");
                            $("#promptindicator").removeClass("btn-light");
                            $("#promptindicator").addClass("btn-success");
                        } else {
                            $("#promptindicator").html("hidden");
                            // $("#promptindicator").removeClass("btn-secondary");
                            $("#promptindicator").removeClass("btn-success");
                            $("#promptindicator").addClass("btn-light");
                        }
                        
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

                        
                        if (promptprefix != event.sdparams.globalstylepromptprefix) {
                            $('#custompromptprefix').val(event.sdparams.globalstylepromptprefix);
                            promptprefix = event.sdparams.globalstylepromptprefix
                        } 
                        if ( customprompt != event.sdparams.prompt){
                            $('#customprompt').val(event.sdparams.prompt)
                            customprompt = event.sdparams.prompt
                        }
                        if (promptsuffix != event.sdparams.globalstylepromptsuffix){
                            $('#custompromptsuffix').val(event.sdparams.globalstylepromptsuffix);
                            promptsuffix = event.sdparams.globalstylepromptsuffix
                        }
                        if (negativeprompt != event.sdparams.globalstylepromptsuffix){
                            $('#negativeprompt').val(event.sdparams.negativeprompt);
                            negativeprompt = event.sdparams.globalstylepromptsuffix
                        }

                        if (event.apps.infinitePanorama.seedlock == true) {
                            $("#seedlockindicator").html("locked");
                            $("#seedlockindicator").removeClass("btn-secondary");
                            $("#seedlockindicator").removeClass("btn-success");
                            $("#seedlockindicator").addClass("btn-danger");
                        } else {
                            $("#seedlockindicator").html("random");
                            $("#seedlockindicator").removeClass("btn-secondary");
                            $("#seedlockindicator").removeClass("btn-danger");
                            $("#seedlockindicator").addClass("btn-success");
                        }
                        if (event.apps.infinitePanorama.sessions != 0) {
                            $("#sessiondropdown").html("")
                            for (let key in event.apps.infinitePanorama.sessions) {
                                $("#sessiondropdown").append("<option value='"+key+"' >" + "<span>" + key+": </span>"  + event.apps.infinitePanorama.sessions[key]["title"] +"</option>" );
                            }
                            $("#sessiondropdown").val(0) 
                        } else {
                            console.log("nothing in sessions")
                            $("#sessiondropdown").html("off");
                        }

                    }
                    laststatus = event
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
  