(function ($) {
    /*
    <script src="/Scripts/jquery.signalR-2.2.3.min.js"></script>
    <script type="text/javascript" src="http://127.0.0.1:5051/signalr/hubs"></script>
    使用方法：
    //socket连接
    $.signalrApi.start(function () {
        //执行服务器方法
        $.signalrApi.server.uploadLatLng(lb.data.get("Userid").toString(), data.lat, data.lng, lb.data.get("FRescueInfoID"), "");
    });
    //初始化
    function socket() {
        $.signalrApi({
            serverUrl: "http://www.nbgycr.com/signalr",
            clientHub: "GYHub",
            clientEvents: [
            {
                name: "onClientLive",
                method: function (data) {}
            }, {
                name: "onLoginOut",
                method: function (data) {}
            }
            ]
        });
    };
    */
    $.signalrApi = function (options) {
        /********内部变量开始********/
        //signalr通讯中间项
        /********内部变量结束*******/
        /********外部变量开始********/
        //客户端变量
        $.signalrApi.client = undefined;
        //服务端变量
        $.signalrApi.server = undefined;
        /********外部变量结束*******/
        options = $.extend({
            //服务器地址
            serverUrl: "",
            clientHub:"",
            //客户端事件数组
            clientEvents: []
        }, options);
        //var clientHubObj = $.connection.IMHub;
        //eval("var clientHubObj = $.connection." + options.clientHub);
        $.connection[options.clientHub].url = options.serverUrl;
        $.signalrApi.client = $.connection[options.clientHub].client;
        $.signalrApi.server = $.connection[options.clientHub].server;
        $.connection.hub.url = options.serverUrl;
        //执行注册客户端事件
        RegisterClientMethods();

        /*******内部事件开始******/
        //注册客户端事件
        function RegisterClientMethods() {
            for (var i = 0; i < options.clientEvents.length; i++) {
                eval("$.signalrApi.client." + options.clientEvents[i].name + " = " + options.clientEvents[i].method);
            }
        }
        /*******内部事件结束******/


        /*******外部事件开始******/
        //连接开始事件
        $.signalrApi.start = function (callBack, failFun) {
            $.connection.hub.start().done(function () {
                if (typeof (callBack) === "function") {
                    callBack();
                }
            }).fail(function(e){
                // alert(JSON.stringify(e));
                if (typeof (failFun) === "function") {
                    failFun(e);
                }
            });
        }
        /*******外部事件结束******/
        return $.connection[options.clientHub];
    }
})($);
