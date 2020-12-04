// var com = {
//     //测试
//     test: function (ip, port, fun) {
//         // return this.WebSocket('ws://' + location.hostname + ':14444', '{"requiredSmallScaleData": {"IPAddress": "' + ip + '","address": 0,"length": 4,"Port": "'
//         //     + port + '"}}', fun);
//         return this.WebSocket('ws://localhost:14444', '{"requiredSmallScaleData": {"IPAddress": "' + ip + '","address": 0,"length": 4,"Port": "'
//             + port + '"}}', fun);
//     },
//     //web socket链接
//     WebSocket: function (url, sendMsg, fun) {
//
//         if ("WebSocket" in window || "MozWebSocket" in window) {
//
//             if (typeof MozWebSocket == 'function') WebSocket = MozWebSocket;
//             // 打开一个 web socket
//             var ws = new WebSocket(url);//"ws://localhost:9998/echo"
//             var timeout;
//
//             // 链接成功
//             ws.onopen = function () {
//                 // Web Socket 已连接上，使用 send() 方法发送数据
//                 console.log("Web Socket 已连接上！");
//                 ws.send(sendMsg);
//                 timeout = setTimeout(function () {
//                     ws && ws.close();
//                 }, 1000 * 30);
//             };
//             /* 接受信息 */
//             ws.onmessage = function (evt) {
//                 //var received_msg = evt.data;
//                 //alert("数据已接收...");
//                 timeout && clearTimeout(timeout);
//                 fun && fun(evt, ws);
//             };
//             /* 报错 */
//             ws.onerror = function (e) {
//                 timeout && clearTimeout(timeout);
//                 // 通信发生错误时触发
//                 console.error(e);
//                 if (layer) layer.msg('上位机链接失败！');
//                 else alert('上位机链接失败！');
//             };
//             /* 关闭 */
//             ws.onclose = function () {
//                 timeout && clearTimeout(timeout);
//                 // 关闭 websocket
//                 //ws.close();
//                 console.log("Web Socket 连接已关闭！");
//             };
//
//             // 0 - 表示连接尚未建立。
//             // 1 - 表示连接已建立，可以进行通信。
//             // 2 - 表示连接正在进行关闭。
//             // 3 - 表示连接已经关闭或者连接不能打开。
//             //ws.readyState();
//             return ws;
//         } else {
//             // 浏览器不支持 WebSocket
//             console.warn("您的浏览器不支持 WebSocket!");
//             return '';
//         }
//     }
// };


+(function (window) {
    var defaults;

    window.jw_websock = function (data) {
        var option = $.extend(true,{
            socketUrl: "ws://127.0.0.1:12345",
            msg: '',
            isReconnect: true, /* 是否断线重连 */
            onopen: function () {},
            onmessage: function () {},
            onerror: function () {},
            onclose: function () {}
        }, data);

        if ("WebSocket" in window || "MozWebSocket" in window) {
            //"ws://localhost:9998/echo"
            var lockReconnect = false;  //避免ws重复连接
            var ws = null;          // 判断当前浏览器是否支持WebSocket
            var wsUrl = option.socketUrl;
            createWebSocket(wsUrl);   //连接ws

            function createWebSocket(url) {
                console.log(wsUrl);                
                try{
                    if('WebSocket' in window){
                        ws = new WebSocket(url);
                    }
                    initEventHandle();
                }catch(e){
                    reconnect(url);
                    console.log(e);
                }
            }

            function initEventHandle() {
                ws.onclose = function () {
                    if (option.isReconnect){
                        reconnect(wsUrl);
                    }
                    console.log(option.msg + "连接关闭!"+new Date().toLocaleString());
                    option.onclose();
                };
                ws.onerror = function (e) {
                    if (option.isReconnect) {
                        reconnect(wsUrl);
                    }
                    
                    console.log(option.msg + "连接错误!");
                    option.onerror(e);
                };
                ws.onopen = function () {
                    heartCheck.reset().start();      //心跳检测重置
                    console.log(option.msg + "连接成功!" + new Date().toLocaleString());
                    option.onopen();
                };
                ws.onmessage = function (event) {    //如果获取到消息，心跳检测重置
                    heartCheck.reset().start();      //拿到任何消息都说明当前连接是正常的
                    // console.log("llws收到消息啦:" +event.data);
                    option.onmessage(event.data);
                };
            }


            // 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
            window.onbeforeunload = function() {
                ws.close();
            }

            function reconnect(url) {
                if(lockReconnect) return;
                lockReconnect = true;
                setTimeout(function () {     //没连接上会一直重连，设置延迟避免请求过多
                    createWebSocket(url);
                    lockReconnect = false;
                }, 2000);
            }

            //心跳检测
            var heartCheck = {
                timeout: 1000*60,        //1分钟发一次心跳
                timeoutObj: null,
                serverTimeoutObj: null,
                reset: function(){
                    clearTimeout(this.timeoutObj);
                    clearTimeout(this.serverTimeoutObj);
                    return this;
                },
                start: function(){
                    var self = this;
                    this.timeoutObj = setTimeout(function(){
                        //这里发送一个心跳，后端收到后，返回一个心跳消息，
                        //onmessage拿到返回的心跳就说明连接正常
                        ws.send("ping");
                        console.log("ping!")
                        self.serverTimeoutObj = setTimeout(function(){//如果超过一定时间还没重置，说明后端主动断开了
                            //如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
                            if (option.isReconnect){
                                ws.close();
                            }else {
                                reconnect(wsUrl);
                            }
                        }, self.timeout)
                    }, this.timeout*60)
                }
            }
            return {
                send: function(data){
                    ws.send(data);
                },
                close: function () {
                    option.isReconnect = false;                    
                    ws.close();
                  //  console.log('close:' + option.isReconnect);
                },
                open: function () {
                   // console.log('open1:' + option.isReconnect);
                    //规避重复打开问题
                    if (!option.isReconnect) {
                      //  console.log('open2:' + option.isReconnect);
                        option.isReconnect = true;
                        reconnect(wsUrl);
                    }
                }
            };
        } else {
            alert("当前浏览器不支持websocket");
        }
    }

})(window);
