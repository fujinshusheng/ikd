<%@ Page Language="C#" AutoEventWireup="false" %>

<%
    //127.0.0.1
    string ip = Request.QueryString["ip"].ToString();
    //5051
    string port = Request.QueryString["port"].ToString();
    //MyHub
    string hub = Request.QueryString["hub"].ToString();
    //直接写死
    hub = "MyHub";
    //id
    string id = Request.QueryString["id"].ToString();
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>通讯框架</title>
    <script src="/Scripts/jquery-1.6.4.min.js"></script>
    <script src="/Scripts/jquery.y9socket.min.js"></script>
    <script type="text/javascript" src="http://<%=ip %>:<%=port %>/signalr/hubs"></script>
    <script type="text/javascript">
        var MyclientHub;
        $(function () {
            startSignalR();
        })
        //
        function startSignalR() {
            try {
                //地址
                var serverUrl = "http://<%=ip %>:<%=port %>/signalr";
                MyclientHub = $.connection["<%=hub %>"];
                MyclientHub.url = serverUrl;
                $.connection.hub.url = serverUrl;
                //出现异常错误
                $.connection.hub.error(function (error) {
                    //alert('SignalR error: ' + error)
                    var er = 'SignalR error: ' + error;
                    //断开重连
                    if (er.indexOf("WebSocket closed") != -1) {
                        //alert(''+error);
                        window.setTimeout(function () {
                            window.location.reload();
                        }, 15000);
                    }
                });
                //接收的方法
                var testsArr = window.parent.window["funs<%=id %>"];
                for (var i = 0; i < testsArr.length; i++) {
                    eval('MyclientHub.client.' + testsArr[i].name + '=function(' + testsArr[i].parms + '){window.parent.window.' + testsArr[i].fun + '(' + testsArr[i].parms + ');}');
                }
                //开始连接
                $.connection.hub.start().done(function () { }).fail(function (e) { });
            } catch (e) {
                //alert(1);
                window.setTimeout(function () {
                    window.location.reload();
                }, 10000);
            }
        }
        //发送
        function send(funname, content) {
            if (content == undefined)
                eval('MyclientHub.server.' + funname + '();');
            else
                eval('MyclientHub.server.' + funname + '("' + content.replace(/"/g, '\\"') + '");');
        }

    </script>
</head>
<body></body>
</html>
