$( document ).ready(function() {
  // Handler for .ready() called.
});


// ### random element select > see https://stackoverflow.com/questions/18519975/jquery-get-random-element-from-a-selection-returned-by-selector
$.fn.random = function() {
  return this.eq(Math.floor(Math.random() * this.length));
}          



window.addEventListener("DOMContentLoaded", () => {
    // Initialize the UI.
    const canvas = document.querySelector("#backdrop");
    // Open the WebSocket connection and register event handlers.
    const websocket = new WebSocket("ws://localhost:8001/");
    // const sdwebsocket = new WebSocket("ws://localhost:8000/");
    receiveCommand(canvas, websocket);
    // receiveSD(canvas, sdwebsocket);
    // sendCommand(canvas, sdwebsocket);
  });
  
// function sendCommand(canvas, websocket) {
//     canvas.addEventListener("click", ({ target }) => {
//       console.log("canvas clicked", target)
//       const event = {
//         type: "generate",
//         prompt: "some dog floating in the sea"
//       };
//       websocket.send(JSON.stringify(event));
//     });
//   }
  

//   function receiveSD(canvas, websocket) {
//     websocket.addEventListener("message", ({ data }) => {
//       // const event = JSON.parse(data);
//       // console.log(data);

//     console.log("messaged receiv ed", data);
//     });
//   }

  
function receiveCommand(canvas, websocket) {
    websocket.addEventListener("message", ({ data }) => {
      const event = JSON.parse(data);
      switch (event.type) {

        case "newimg":
          // #cleanup
          $("#relatedpromptsingle").hide();
          $("#imgframe").fadeIn(500);
          $("#gpt3query").empty();
          $("#gpt3reply").empty();
          // console.log(event.type, event.imgurl, event.authorname);
          $("#srcimg").attr("src", event.imgurl);
          $("#srcprompt").html(event.srcprompt);
          $("#promptauthor").html(event.authorname);
          $("#relatedprompt").empty();
          $("#relimgs").empty();
          $("#nerdstats").html("getting new image");
          break;

        case "relatedprompt":
          // $("#relatedprompt").html(event.prompt);
          $(".promptwindow").removeClass("outleft");
          $(".promptwindow").addClass("inleft");
          $("#imgframe").fadeOut(5500);

          if (event.crawltype == "single") {
            $("#relatedprompt").hide();
            $("#relatedpromptsingle").show();
            $("#relatedpromptsingle").html("<li class='relprompt'>"+event.prompt+"</li>");
          } else {
            $("#relatedprompt").show();
            $("#relatedpromptsingle").hide();
            $("#relatedprompt").append("<li class='relprompt'>"+event.prompt+"</li>");
            $("#relatedprompt").append("<li>"+"++++++++++++++++++++++++++++++++++"+"</li>");
            updateScroll();
          }
          $("#nerdstats").html("crawling latent space _" + event.percentage +"% complete" );
          break;

        case "relatedimg":
          prefix = "data/img/lexica/"
          if (event.crawltype == "single") {
            $("#relimgs").hide();
            $("#relimgssingle").show();
            $("#relimgssingle").html("<img class='relimg' src='" + prefix+event.img + "'/>");
          } else {
            $("#relimgs").show();
            $("#relimgssingle").hide();
            $("#relimgs").append("<img class='relimg' src='" + prefix+event.img + "'/>");
            $(".relimg").last().css({'top' : getRandomInt(0,760), 'left' : getRandomInt(500,1560)});
          }
          break;

        case "highlight":
          // console.log(event)
          var el = $(".relprompt").random().addClass("blink");
          scrollToElement(el, $("#relatedprompt"));
        
          $("#nerdstats").html("getting best matches");
          $("#imgframe").removeClass("imgframenew").addClass("imgframegpt3")

          break;

        case "gpt3query":
          // #hide stuff
          $("#relimgs").hide();
          $("#relimgssingle").hide();
          $("#sdimg").hide();
          $("#gpt3query").html(event.gpt3query)
          $("#relatedprompt").removeClass("inleft");
          $("#relatedprompt").addClass("outleft");
          $("#gpt3canvas").removeClass("out");
          $("#gpt3canvas").addClass("in");

          
          // show stuff
          $("#imgframe").fadeIn(500);
          $("#gpt3frame").show();
          $("#gpt3query").fadeIn(500);
          $("#nerdstats").html("asking GPT3 to cook up new prompts");
          break;

        case "gpt3reply":
          $("#gpt3reply").html("<br><br>" + event.gpt3prompt)
          $("#gpt3reply").fadeIn(500);
          $("#nerdstats").html("taking input from GPT3");
          break;


        case "sdimgwait":
          console.log(event)
          $("#gpt3frame").fadeOut(500);
          $("#relatedprompt").empty();
          $("#relimgs").empty();
          $("#sdimg").attr("src", event.url);
          $("#sdprompt").html(event.prompt)
          $("#sdimgframe").fadeIn(500);
          $("#nerdstats").html("starting stable diffusion, sit back, this takes a while");

          break

        case "sdimg":
          // $("#imgframe").fadeIn(500);
          $("#relatedprompt").empty();
          $("#relimgs").empty();
          $("#sdimg").attr("src", event.url);
          $("#sdimg").fadeIn(500);
          $("#sdprompt").html(event.prompt);
          $("#nerdstats").html("showing stable diffusion");
          break;

        case "done":
          // #get everything ready for new
          $("#sdimgframe").fadeOut(500);
          $("#imgframe").fadeOut(500).removeClass("imgframegpt3").addClass("imgframenew");
          $("#gpt3canvas").addClass("out");
          $("#gpt3canvas").removeClass("in");
          $("#nerdstats").html("done, let's start over");
          break;
        case "error":

          console.timeLog(event.message);
          break;
        default:
          throw new Error(`Unsupported event type: ${event.type}.`);
      }
    });
  }

function updateScroll(){
    var element = document.getElementById("relatedprompt");
    element.scrollTop = element.scrollHeight;
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function scrollToElement(scrollTo, container){
  var position = scrollTo.offset().top
    - container.offset().top
    + container.scrollTop();
  container.scrollTop(position);
}