var XSBApi = {
    //-------signalr-----begin
    /*    
    <script src="/Scripts/jquery.signalR-2.2.3.min.js"></script>
        //signalR对象
        var MyclientHub;
        //发送signalR
        function KQQLTest(data) {
            MyclientHub.dom.server.setData("KQCY_QL");
            MyclientHub.send("setData","获取本地串口列表");
        }
        //接收signalR数据
        function receive(data) { $("#getcontent").prepend("" + data + "<br />"); }
        $(function () {
           kqApi.socket({
                ip: "127.0.0.1",
                port: "5051",
                hub: "MyHub",
                fun: [{
                    //parms:多个参数的时候，用英文逗号隔开
                    name: "OnGetData", fun: "receive", parms: "data"
                }]
            });
        },function(opt){MyclientHub=opt;})
    */
    socket: function (opt, funct) {
        opt = $.extend({
            id: "f" + new Date().getTime(),
            //连接成功后的对象
            dom: null,
            //服务器地址
            ip: "127.0.0.1",
            //端口号
            port: "35051",
            //服务器对象
            hub: "MyHub",
            fun: [{
                //接收函数
                name: "OnGetData", fun: "receive", parms: "data"
            }]
        }, opt);

        //
        window["funs" + opt.id] = opt.fun;
        //创建一个隐藏的iframe，承载signalR
        $("body").append('<div style="display:none;"><iframe name="' + opt.id + '" id="' + opt.id + '"></iframe></div>');
        //传入signalR相关配置对象内容
        $("#" + opt.id).attr("src", "/Scripts/signalRFrame.aspx?ip=" + opt.ip + "&port=" + opt.port + "&hub=" + opt.hub + "&id=" + opt.id);
        //加载完毕后执行对象赋值
        $("#" + opt.id).load(function () {
            //获取对象
            opt.dom = window.frames[opt.id].window.MyclientHub;
            opt.send = window.frames[opt.id].window.send;
            funct(opt);
        });
        return opt;
    }
    //-------signalr-----end  
}


