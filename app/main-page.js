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
var websockets = require("nativescript-websockets");
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
    
    // test putting things into textview on load
    var view = page.getViewById("ipadd");


    // find ip address and set it to the text
    var ip_address;

    view.text = ip_address;

}

// Clean up Code
// Ping sweep all ips and name for selection
exports.queueAccept = function(){
    console.log("pressable? : " + pressable);
    if(pressable){
        socket.send("accepted");
        pressable = false;
        var button = page.getViewById("button1");
        button.src = "~/button.png";
    }
}

hide_fields = function(){
    var auth_input = page.getViewById("auth_num");
    var input = page.getViewById("ipadd");
    var views = page.getViewById("spinner");
    var button = page.getViewById("button1");
    var connect_button = page.getViewById("connect_button");
    var ip_text = page.getViewById("ipad_label");
    var code_label = page.getViewById("code_label");
    ip_text.visibility = "collapsed";
    code_label.visibility = "collapsed";
    auth_input.visibility = "collapsed";
    input.visibility = "collapsed";
    views.visibility = "collapsed";
    button.visibility = "visible";
    connect_button.visibility = "collapsed";
}

show_fields = function(){
    var auth_input = page.getViewById("auth_num");
    var input = page.getViewById("ipadd");
    var views = page.getViewById("spinner");
    var button = page.getViewById("button1");
    var connect_button = page.getViewById("connect_button");
    var ip_text = page.getViewById("ipad_label");
    var code_label = page.getViewById("code_label");
    ip_text.visibility = "visible";
    code_label.visibility = "visible";
    auth_input.visibility = "visible";
    input.visibility = "visible";
    views.visibility = "collapsed";
    button.visibility = "collapsed";
    connect_button.visibility = "visible";
}

exports.submit = function(args){
    var auth_input = page.getViewById("auth_num");
    var input = page.getViewById("ipadd");
    var views = page.getViewById("spinner");
    var button = page.getViewById("button1");
    var connect_button = page.getViewById("connect_button");
    hide_fields();
    button.visibility = "collapsed";
    views.visibility = "visible";
    console.log(input.text);
    console.log("Fetching...");
    mytimer = timer.setTimeout(function(){
        dialogs.alert("No server found", {});
        console.log("timeout reached");
        show_fields();
        if(socket != null) socket.close();
        console.log("socket closed")
    }, 10000);
    if(1){
        try{
            socket = new WebSocket("ws://" + input.text +":8000/" + auth_input.text);
        }catch(e){
            console.log(e);
        }
        console.log("creating socket");
        socket.on("open", function(socket){
            timer.clearTimeout(mytimer);
            try{
                socket.send("pass");
            }catch(e){
                console.log(e);
            }
            console.log("connected");
            console.log("connected to socket");
            //socket.emit("handshake", {"Connected to ": "android phone"});
            hide_fields();
        });
        socket.on("error", function(){
            try{
                timer.clearTimeout(mytimer);
            }catch(e){
                console.log(e);
            }   
            show_fields();
            button.src="~/button.png";
            pressable = false;
            socket.close();  
        });
        socket.on("close", function(){
            try{
                timer.clearTimeout(mytimer);
            }catch(e){
                console.log(e);
            }   
            show_fields();
            button.src="~/button.png";
            pressable = false;
            console.log("socket closed");
            dialogs.alert("Disconnected From Server", {});
            console.log("disconnected");  
        });
        socket.on("message", function(data){
            console.log("message: " + data.data);
            if(data.data == "popped"){
                 button.src="~/accept.png";
                pressable = true;;
            }
            if(data.data == "queued"){
                if(button.src != "~/button.png") button.src = "~/button.png";
            }
        });/*
        socket.on("queueEvent", function(data){
            if(data.status == "true"){

            }
            console.log("Status of queue: " + data.status);
        });*/
    }
    //console.log(socket.readyState());
    console.log("opening socket at: ");
    try{
        socket.open();
        console.log(socket.url);
        console.log("socket opened");
    }catch(err){
        console.dir(err);
    }
}

/*
Exporting a function in a NativeScript code-behind file makes it accessible
to the file’s corresponding XML file. In this case, exporting the onNavigatingTo
function here makes the navigatingTo="onNavigatingTo" binding in this page’s XML
file work.
*/
exports.onNavigatingTo = onNavigatingTo;