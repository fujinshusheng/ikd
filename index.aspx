<%@ Page Language="C#" AutoEventWireup="false" %>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>串口服务使用例子</title>
    <script src="Scripts/jquery-1.6.4.min.js"></script>
    <script src="/Scripts/jquery.y9socket.min.js"></script>
    <script src="/Scripts/XSBApi.js"></script>
</head>
<body>
    <script type="text/javascript">
        var MyclientHub;
        //接收signalR数据
        function receive(data) { 
            $("#sss").prepend(data + "<hr />");
        }

        $(function () {
            $("#sss").append("<b>程序加载完成</b><hr />");
            XSBApi.socket({
            //服务器地址
            ip: "172.28.0.202",
            //端口号
            port: "23345"

            }, function (opt) {
                MyclientHub = opt;
            });
        })
        //
        function testFun() {
            MyclientHub.send("setData", "" + $("#kjjds").val() + "," + new Date().getTime());
        }
    </script>
    测试内容：<input id="kjjds" />
    <input type="button" value="发送测试数据" onclick="testFun();" />
    <div id="sss"></div>
</body>
</html>
