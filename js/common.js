;
!function (window) {

    var com = {

        //LODOP打印------------begin
        lodop: function (opt) {
            opt = $.extend({
                //需要打印的内容
                PrintContent: '',
                //true：直接打印，false：预览
                isprint: true,
                /*
                打印方向及纸张类型，数字型，
                1---纵(正)向打印，固定纸张；
                2---横向打印，固定纸张；
                3---纵(正)向打印，宽度固定，高度按打印内容的高度自适应；
                0(或其它)----打印方向由操作者自行选择或按打印机缺省设置；
                */
                intOrient: "2",
                BARCODE: {
                    Top: 10, Left: 40, Width: 80, Height: 80,
                    /*
                    条码类型，字符型。目前支持的类型（条码规制）如下：
    128A，128B，128C，128Auto，EAN8，EAN13，EAN128A，EAN128B，EAN128C，Code39，39Extended，2_5interleaved，2_5industrial，2_5matrix，UPC_A，UPC_E0，UPC_E1，UPCsupp2，UPCsupp5，Code93，93Extended，MSI，PostNet，Codabar，QRCode，PDF417。
    其中QRCode和PDF417是二维码，其它为一维码。默认情况下“QRCode的版本”、“PDF417压缩模式”、“PDF417容错级别” “PDF417数据列数” “PDF417基条高(倍数)”等参数会根据宽度和高度自动调整，当然页面程序也可以直接设置它们的具体值。
                    */
                    CodeType: 'QRCode', CodeValue: '', isHideText: false,//isHideText true隐藏文字 false不隐藏文字
                    CustomTextValue: '', CustomTextSize: 14
                },
                TEXTS: []
            }, opt);
            if (com.LODOP == undefined) com.LODOP = getLodop();
            com.LODOP.SET_PRINT_PAGESIZE(opt.intOrient, 0, 0, "");
            //正文
            com.LODOP.ADD_PRINT_HTM(0, 0, "100%", "100%", opt.PrintContent);
            //二维码
            if (Array.isArray(opt.BARCODE)) {
                for (var i = 0, length = opt.BARCODE.length; i < length; i++) {
                    var barcode = opt.BARCODE[i];
                    if (barcode.CodeValue) com.LODOP.ADD_PRINT_BARCODE(barcode.Top, barcode.Left,
                        barcode.Width, barcode.Height, barcode.CodeType, barcode.CodeValue);
                    if (barcode.isHideText) {//isHideText true隐藏文字 false不隐藏文字
                        com.LODOP.SET_PRINT_STYLEA(0, "ShowBarText", 0);
                        if (barcode.CustomTextValue) {//条形码文字自定义
                            com.LODOP.ADD_PRINT_TEXT(barcode.Top + barcode.Height, barcode.Left,
                                barcode.Width, 1, barcode.CustomTextValue);
                            com.LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
                            com.LODOP.SET_PRINT_STYLEA(0, "FontSize", barcode.CustomTextSize);
                        }
                    }
                }
            } else {
                if (opt.BARCODE.CodeValue) com.LODOP.ADD_PRINT_BARCODE(opt.BARCODE.Top, opt.BARCODE.Left,
                    opt.BARCODE.Width, opt.BARCODE.Height, opt.BARCODE.CodeType, opt.BARCODE.CodeValue);
                if (opt.BARCODE.isHideText) {//isHideText true隐藏文字 false不隐藏文字
                    com.LODOP.SET_PRINT_STYLEA(0, "ShowBarText", 0);
                    if (opt.BARCODE.CustomTextValue) {//条形码文字自定义
                        com.LODOP.ADD_PRINT_TEXT(opt.BARCODE.Top + opt.BARCODE.Height, opt.BARCODE.Left,
                            opt.BARCODE.Width, 1, opt.BARCODE.CustomTextValue);
                        com.LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
                        com.LODOP.SET_PRINT_STYLEA(0, "FontSize", opt.BARCODE.CustomTextSize);
                    }
                }
            }
            if (opt.TEXTS.length > 0) {
                for (var j = 0, len = opt.TEXTS.length; j < len; j++) {
                    var text = opt.TEXTS[j];
                    com.LODOP.ADD_PRINT_TEXT(text.Top, text.Left, text.Width, text.Height, text.strText);
                    com.LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
                    com.LODOP.SET_PRINT_STYLEA(0, "FontSize", text.textSize || 14);
                }
            }
            if (opt.isprint) com.LODOP.PRINT(); else com.LODOP.PREVIEW();
        },

        // url: 'http://172.28.0.202:19112', //IDK
        // url: 'http://122.225.254.234:19112', //IDK
       // url: 'http://erp.jiwanginfo.com:21992', //IDK
        //是否是本地服务器打开
        isLocal: function (url) {
            return !url || /^localhost/.test(url) || /^127.0.0.1/.test(url);
        },
        //跳转
        topReplace: function (url) {
            top.location.replace(url + '&t=' + new Date().getTime());
        },

        //接口调用
        submit: function (api, data, fun, ajaxObj) {

          //  var url = 'http://172.28.0.202:19112';
            var url = 'http://erp.jiwanginfo.com:21992';//IDK
          //  if (com.isLocal(location.host)) {
         //       url = com.url;
         //   }
            data = $.extend({
                timevv: (new Date).getTime() + Math.floor(Math.random() * 100), //防重复的随机时间戳
            }, data);
            var obj = $.extend({
                urls: url + '/PCodeClient/api.ashx?cmd=' + api,
                // urls: url + '/m/api/api.ashx?cmd=' + api,
                data: data,
                Success: function (result) {
                    try {
                        if (result.status !== 200) {
                            if (window.layer)
                                layer.msg('\u94fe\u63a5\u670d\u52a1\u5668\u51fa\u73b0\u95ee\u9898\uff01', {shift: 0}); //链接服务器出现问题！
                            else
                                alert('\u94fe\u63a5\u670d\u52a1\u5668\u51fa\u73b0\u95ee\u9898\uff01'); //链接服务器出现问题！
                            console.warn(new Date().toLocaleString() + '：' + JSON.stringify(result));
                        } else {
                            fun && fun(result.msg);
                        }
                    } catch (e) {                       
                        console.warn(new Date().toLocaleString() + '：' + JSON.stringify(e));
                        if (window.layer)
                            layer.msg('\u89e3\u6790\u6570\u636e\u51fa\u73b0\u95ee\u9898\uff01', {shift: 0}); //解析数据出现问题！
                        else
                            alert('\u89e3\u6790\u6570\u636e\u51fa\u73b0\u95ee\u9898\uff01'); //解析数据出现问题！
                    }
                },
                Error: function (e) {
                    console.warn(new Date().toLocaleString() + '：' + JSON.stringify(e));
                    console.log(api);
                    if (window.layer)
                        layer.msg('\u89e3\u6790\u6570\u636e\u51fa\u73b0\u95ee\u9898\uff01', {shift: 0}); //解析数据出现问题！
                    else
                        alert('\u89e3\u6790\u6570\u636e\u51fa\u73b0\u95ee\u9898\uff01'); //解析数据出现问题！

                }
            }, ajaxObj)
            com.submitAjAX(obj);
        },
        //存取本地数据
        localStor: function (key, val) {
            try {
                if (val !== undefined) { //存
                    if (window.localStorage) window.localStorage.setItem(key, val);
                } else { //取

                    var retStr = '';
                    if (window.localStorage) {
                        retStr = window.localStorage.getItem(key);
                        if (!retStr && retStr === "undefined") retStr = '';
                    }
                    return retStr;
                }
            } catch (e) {
                console.error(e);
            }
        },

        //获取当前时间 格式：yyyy-MM-dd HH:MM:SS
        getCurrentTime: function () {
            function zeroFill(i) {//补零
                return i >= 0 && i <= 9 ? "0" + i : i;
            }

            var date = new Date();//当前时间
            var month = zeroFill(date.getMonth() + 1);//月
            var day = zeroFill(date.getDate());//日
            var hour = zeroFill(date.getHours());//时
            var minute = zeroFill(date.getMinutes());//分
            var second = zeroFill(date.getSeconds());//秒

            //当前时间
            var curTime = date.getFullYear() + "-" + month + "-" + day
                + " " + hour + ":" + minute + ":" + second;
            return curTime;
        },
        //调用Y9
        submitAjAX: function (opt) {
            opt = $.extend({
                //请求地址
                urls: '/PCodeClient/api.ashx',
                //传递参数集合
                data: {},
                //请求提交模式
                type: "POST",
                //请求超时事件(秒)
                timeout: 20000,
                //URL请求的返回数据格式
                //要求为String类型的参数，预期服务器返回的数据类型。如果不指定，JQuery将自动根据http包mime信息返回responseXML或responseText，并作为回调函数参数传递。可用的类型如下：
                //xml：返回XML文档，可用JQuery处理。
                //html：返回纯文本HTML信息；包含的script标签会在插入DOM时执行。
                //script：返回纯文本JavaScript代码。不会自动缓存结果。除非设置了cache参数。注意在远程请求时（不在同一个域下），所有post请求都将转为get请求。
                //json：返回JSON数据。
                //jsonp：JSONP格式。使用SONP形式调用函数时，例如myurl?callback=?，JQuery将自动替换后一个“?”为正确的函数名，以执行回调函数。
                //text：返回纯文本字符串。
                dataType: 'json',
                //回调函数名称/参数名称
                jsonp: 'jsonpcallback',
                //是否强制执行JSONP模式请求
                runJsonP: false,
                //是否启动日志
                log: false,
                //是否异步请求
                async: true,
                //发送信息 内容编码
                contentType: "application/x-www-form-urlencoded",
                //contentType: "application/x-www-form-urlencoded; charset=utf-8",
                //执行成功
                Success: function (a) {
                },
                //执行错误
                Error: function (a) {
                },
                //执行前
                Before: function () {
                },
                //执行后
                After: function () {
                }
            }, opt);
            opt.Before();
            //直接请求ajax提交
            var submitModel = false;
            var lolUrl = window.location.href;
            //匹配请求地址
            if (lolUrl.indexOf("http") == 0) {
                //拆分请求地址当前网址
                var urlArr = lolUrl.split("/");
                if (opt.urls.length > 0 && urlArr.length >= 3 && opt.urls.indexOf("/" + urlArr[2]) != -1) {
                    submitModel = true;
                }
            }
            //同服务器下访问
            if (opt.urls.indexOf("/") == 0) {
                submitModel = true;
            }
            //强制执行JSONP模式请求
            if (opt.runJsonP) submitModel = false;
            if (submitModel) {
                $.ajax({
                    url: opt.urls,
                    data: opt.data,
                    type: opt.type,
                    timeout: opt.timeout,
                    dataType: opt.dataType,
                    async: opt.async,
                    contentType: opt.contentType,
                    success: function (ret1) {
                        opt.After();
                        //是否显示日志
                        if (opt.log) {
                            if (typeof (ret1) == "object") console.log(ret1);
                            else console.log(JSON.stringify(ret1));
                        }
                        opt.Success(ret1);
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        opt.After();
                        var errorStr = "textStatus:" + JSON.stringify(textStatus) +
                            " \r\n XMLHttpRequest:" + JSON.stringify(XMLHttpRequest) +
                            "\r\n errorThrown：" + JSON.stringify(errorThrown);
                        if (opt.log)
                            console.log(errorStr);
                        opt.Error(errorStr);
                    }
                });
            } else {
                $.ajax({
                    type: opt.type,
                    url: opt.urls,
                    timeout: opt.timeout,
                    dataType: "jsonp",
                    data: opt.data,
                    async: opt.async,
                    contentType: opt.contentType,
                    //指定参数名称
                    jsonp: "jsonpcallback",
                    crossDomain: true,
                    cache: false,
                    //指定回调函数名称
                    jsonpCallback: opt.jsonp + (new Date).getTime() + Math.floor(Math.random() * 100),
                    success: function (ret1) {
                        opt.After();
                        //是否显示日志
                        if (opt.log) {
                            if (typeof (ret1) == "object") console.log(ret1);
                            else console.log(JSON.stringify(ret1));
                        }
                        opt.Success(ret1);
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        opt.After();
                        var errorStr = "textStatus:" + JSON.stringify(textStatus) +
                            " \r\n XMLHttpRequest:" + JSON.stringify(XMLHttpRequest) +
                            "\r\n errorThrown：" + JSON.stringify(errorThrown);
                        if (opt.log)
                            console.log(errorStr);
                        opt.Error(errorStr);
                    }
                });
            }
        },

        usb: {
            //初始化
            init: function (fun) {
                this.USBHIDRemove();
                if ($('#USBHIDDom').length==0)
                    $("body").append('<input id="USBHIDDom" style="position:absolute;left:0;top:-500px;" />');
                $(document).on("click", function () {
                    //焦点,清空
                    com.usb.USBHIDFocus();
                });

                //焦点,清空
                com.usb.USBHIDFocus();
                $('#USBHIDDom').keydown(function (e) {
                    //回车
                    e.stopPropagation(); //阻止冒泡事件
                    //e.preventDefault();//阻止默认事件
                    if (e.keyCode == 13 && !e.ctrlKey && !e.altKey) {
                        var val = $('#USBHIDDom').val();
                        try {

                            window.layer && layer.msg(val, {
                                id: new Date().getTime(),
                                offset: 't',
                                time: 1000 * 1,
                                anim: 0
                            });
                            try {
                              //  console.log("fun:"+typeof (fun));
                                //在使用页面中用这个函数
                                if (fun == undefined) scandata(val); else fun(val);
                            } catch (e) {
                                alert('扫描初始化方法【scandata】不存在');
                            }
                        } catch (e) {
                        }
                        //焦点,清空
                        com.usb.USBHIDFocus();
                    }
                });
            },
            //设置焦点，并清空
            USBHIDFocus: function () {
                //清空
                $("#USBHIDDom").val('');
                //焦点
                $("#USBHIDDom").focus();
            },
            //去掉扫描
            USBHIDRemove: function () {
                $("body #USBHIDDom").remove();
            }
        },
        layer: {
            //右下角弹窗
            alertRB: function (content, _offset) {
                if (_offset == undefined) _offset = "rb";
                //边缘弹出
                return layer.open({
                    type: 1,
                    offset: _offset,
                    content: '<div style="padding: 20px;">' + content + '</div>',
                    btn: '关闭',
                    btnAlign: 'c',
                    shade: 0,
                    yes: function () {
                        //layer.closeAll();
                    }
                });
            },
            open2: function (title, url, area, fun, opt) {
                if (area == undefined) area = ['80%', '80%'];
                layer.open({
                    shade: 0.3,
                    shadeClose: true,
                    type: 2,
                    area: area, //['493px', '454px'],
                    closeBtn: false,
                    title: title,
                    content: url,
                    end: function () {
                        fun && fun();
                    }
                });
            },
            open1: function (title, content, area, fun, opt) {
                if (area == undefined) area = ['80%', '80%'];
                if (opt == undefined) opt = {};
                opt = $.extend({
                    shade: 0.3,
                    shadeClose: true,
                    type: 1,
                    area: area, //['493px', '454px'],
                    title: title,
                    content: '' + content,
                    end: function () {
                        fun && fun();
                    }
                }, opt);
                return layer.open(opt);
            },
            //成功的提示信息
            cg: function (content_, t, fun) {
                layer.msg('<div style="font-size:48px;padding:10px;line-height:48px;">' + content_ + '</div><hr>' + t + '秒后自动隐藏提示窗口。', {
                    icon: 1,
                    time: t * 1000,
                    shade: 0.3,
                    shadeClose: true,
                    end: function () {
                        fun && fun();
                    }
                });
            },
            //失败的提示信息
            sb: function (content_, t, fun) {
                layer.msg('<div style="font-size:48px;padding:10px;line-height:48px;">' + content_ + '</div><hr>' + t + '秒后自动隐藏提示窗口。', {
                    icon: 2,
                    time: t * 1000,
                    shade: 0.3,
                    shadeClose: true,
                    end: function () {
                        fun && fun();
                    }
                });
            }
        },

        //打开文档
        openPDF: function (url) {
            layer.open({
                anim: -1,
                shade: 0.3,
                shadeClose: true,
                type: 1,
                area: ['80%', '90%'],
                closeBtn: false,
                title: '',
                content: '<iframe src="' + url + '" width="100%" height="99%" scrolling="no" frameborder="0"></iframe>',
            });
        }
    };

    (function () {

        //选中去掉扫描  输入加data-usb="weak"
        $(document).on('focus', ':input[data-usb="weak"]', function (e) {
            e = e || window.event;
            e.stopPropagation(); //阻止冒泡事件
            //e.preventDefault();//阻止默认事件
            com.usb.USBHIDRemove();
        }).on('blur', ':input[data-usb="weak"]', function (e) {
            com.usb.init(); //初始化扫描
        });

        //当前时间
        window.setInterval(function () {
            $(".curTime").html(com.getCurrentTime());
        }, 1000);

    })();

    window.com = com;
}(window);