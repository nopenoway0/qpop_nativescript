/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

/*
NativeScript adheres to the CommonJS specification for dealing with
JavaScript modules. The CommonJS require() function is how you import
JavaScript modules defined in other files.
*/ 
var createViewModel = require("./main-view-model").createViewModel;
var page;
var http = require("http");
var SocketIO = require("nativescript-socketio").SocketIO;
var dialogs = require("ui/dialogs");
var socket = null;
var timer = require("timer");
var myTimer;
var pressable = false;
function onNavigatingTo(args) {
    /*
    This gets a reference this page’s <Page> UI component. You can
    view the API reference of the Page to see what’s available at
    https://docs.nativescript.org/api-reference/classes/_ui_page_.page.html
    */
    page = args.object;
    /*
    A page’s bindingContext is an object that should be used to perform
    data binding between XML markup and JavaScript code. Properties
    on the bindingContext can be accessed using the {{ }} syntax in XML.
    In this example, the {{ message }} and {{ onTap }} bindings are resolved
    against the object returned by createViewModel().

    You can learn more about data binding in NativeScript at
    https://docs.nativescript.org/core-concepts/data-binding.
    */
    page.bindingContext = createViewModel();
}

exports.queueAccept = function(){
    console.log("pressable?: " + pressable);
    if(pressable){
        socket.emit("queueAccept", {"response": "accepted"});
        pressable = false;
        var button = page.getViewById("button1");
        button.src = "~/button.png";
    }
}

exports.submit = function(args){
    var input = page.getViewById("ipadd");
    var views = page.getViewById("spinner");
    var button = page.getViewById("button1");
    var connect_button = page.getViewById("connect_button");
    connect_button.visibility = "collapsed";
    input.visibility = "collapsed";
    views.visibility = "visible";
    console.log(input.text);

    console.log("Fetching...");
    mytimer = timer.setTimeout(function(){
        dialogs.alert("No server found", {});
        console.log("timeout reached");
        views.visibility = "collapsed";
        input.visibility = "visible";
        connect_button.visibility = "visible";
        if(socket != null) socket.disconnect();
    }, 10000); // For 10 second timeout, if no server is found
    if(socket == null){
        try{
            socket = new SocketIO("http://" + input.text + ":8000", {});
        }catch(e){
            console.log(e);
        }
        console.log("creating socket");
        socket.on("connect", function(){
            console.log("connected to socket");
            socket.emit("handshake", {"Connected to ": "android phone"});
            views.visibility = "collapsed";
            button.visibility = "visible";
            try{
                timer.clearTimeout(mytimer);
            }catch(e){
                console.log(e);
            }
            // add cleanup and next pane here
        });
        socket.on("disconnect", function(){
            connect_button.visibility = "visible";
            input.visibility = "visible";
            views.visibility = "collapsed";
            button.visibility = "collapsed";
            button.src="~/button.png";
            pressable = false;
            socket.disconnect();
            dialogs.alert("Disconnected From Server", {});
            console.log("disconnected");
            try{
                timer.clearTimeout(mytimer);
            }catch(e){
                console.log(e);
            }        
        });
        socket.on("event", function(data){
            console.dir(data);
        });
        socket.on("queueEvent", function(data){
            if(data.status == "true"){
                button.src="~/accept.png";
                pressable = true;
            }
            console.log("Status of queue: " + data.status);
        });
    };
    socket.connect();
}

/*
Exporting a function in a NativeScript code-behind file makes it accessible
to the file’s corresponding XML file. In this case, exporting the onNavigatingTo
function here makes the navigatingTo="onNavigatingTo" binding in this page’s XML
file work.
*/
exports.onNavigatingTo = onNavigatingTo;