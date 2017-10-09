var Observable = require("data/observable").Observable;
var app = require("tns-core-modules/application");
function createViewModel() {
    var viewModel = new Observable();
    viewModel.counter = 42;
    viewModel.message = "";

    viewModel.onTap = function(args) {
        this.set("message", "connecting...");
        var context = android.content.Context;
        var wifiManager = app.android.context.getSystemService(context.WIFI_SERVICE);
        console.log("IP address: " + wifiManager.getConnectionInfo().getIpAddress());
    }

    return viewModel;
}
exports.createViewModel = createViewModel;