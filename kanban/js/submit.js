
// 获取地址栏参数
function getUrlname(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}

// 去除对象中的 Null
function objnull(obj) {
    for (var i in obj){
        if (obj[i] == null || obj[i] == "null"){
            obj[i] = "";
        }
    }
    return obj
}

var ajaxStatus = true;
var ajaxnum = 0;
var layerload;
function submit(Cmd,data,callback,option){
    option = $.extend(true, {
        ajaxStatus: true, /* true 强制提交  */
        jz: true, /* true 初始化显示加载中 */
       // Ip: "http://172.28.0.202:19112", /* 是否更新请求地址 有则更新路径 ip不变 */
        Ip: "http://erp.jiwanginfo.com:21992", /* 是否更新请求地址 有则更新路径 ip不变 */
        Url: "", /* 是否更新请求地址 有则更新路径 ip不变 */
        cmd: "cmd",
        log: false,
        returnall: false,
        noerror: false,
        timeout: 70000, // 超时时间
        runJsonP: false,
        jsonp: 'jsonpcallback',
        errcallback: function () {}
    }, option);
    if (option.jz == true){
        ajaxnum++;
        layerload = layer.load(1,{shade: 0.1}); //0代表加载的风格，支持0-2
    }
    //强制提交
    if(option.ajaxStatus == true) {
        ajaxStatus = true;
    }
    //防止重复提交
    if (ajaxStatus == false) {
        layer.msg("请求过于频繁，请稍后重试...")
        return;
    }
    ajaxStatus = false; //禁止提交

    var thisip = "";
    if(option.Ip != ""){
        thisip = option.Ip;
    }
    //请求默认路径
    var linshiUrl = "/pcodeclient/api.ashx";
    if(option.Url != ""){
        linshiUrl = option.Url;
    }
    //接口组合
    var urls = thisip + linshiUrl + '?'+option.cmd+'=' + Cmd;

    data = $.extend({
        sb: new Date().getTime()
    },data);

    // 提交数据 去除 null  null转为 空
    var optiondata = objnull(data);

    //直接请求ajax提交
    var submitModel = false;
    var lolUrl = window.location.href;
    //匹配请求地址
    if (lolUrl.indexOf("http") == 0) {
        //拆分请求地址当前网址
        var urlArr = lolUrl.split("/");
        if (option.Url.length > 0 && urlArr.length >= 3 && option.Url.indexOf("/" + urlArr[2]) != -1) {
            submitModel = true;
        }
    }

    //同服务器下访问
    if (option.Url.indexOf("/") == 0) {
        submitModel = true;
    }
    //强制执行JSONP模式请求
    if (option.runJsonP) submitModel = false;

    // 提交参数
    var submitoption = {
        url: urls,
        data: optiondata,
        type: "POST",
        timeout : option.timeout, //超时时间设置，单位毫秒
        dataType:'json',
        success:function (ret1) {
            if (option.jz){
                ajaxnum = ajaxnum - 1;
            }

            if(ajaxnum <=0){
                setTimeout(function(){
                    layer.close(layerload);
                },500);
            }
            ajaxStatus = true;
            if (option.log == true){
                console.log('======================================');
                console.log("url:"+urls +"\r\n 参数"+JSON.stringify(data)+"\r\n 返回"+JSON.stringify(ret1));
                console.log('======================================');
            }
            // if(option.Url != "" || option.Ip != ""){
            //     callback(ret1);
            //     return false;
            // }
            try{
                if(option.returnall == true){
                    callback(ret1);
                    return false;
                }

            }catch(e){
                console.log(e);
            }

            if (ret1!=null && typeof(ret1) == "object"){
                var ret;
                if(ret1.data == undefined){
                    ret = ret1.msg;
                }else{
                    ret = ret1.data;
                }
                try {
                    if (ret1.status == "200"){
                        //数据转换
                        callback(ret,ret1);
                    }else {
                        layer.msg(ret1.error);
                        if(option.noerror == true){

                            return false;
                        }else{
                            if(ret.error.indexOf("重复执行") > -1){
                                return false;
                            }
                            layer.alert("接口名："+Cmd+"\r\n 参数"+JSON.stringify(data)+"\r\n 返回值："+JSON.stringify(ret1));
                        }
                    }
                }catch (e){
                    console.log(e);
                    return false;
                }
            }else{
                if (ret1 == undefined || ret1 == ""){
                    layer.msg("101:无法连接到网络")
                    return false;
                }
                if (JSON.stringify(ret1).indexOf("!DOCTYPE") != -1){
                    layer.msg("102:无法连接到网络");
                    return false;
                }
            }
        },
        error:function(XMLHttpRequest, textStatus, errorThrown){
            if (option.jz){
                ajaxnum = ajaxnum - 1;
            }
            if(ajaxnum <=0){
                setTimeout(function(){
                    layer.close(layerload);
                },500);
            }
            ajaxStatus = true;
            option.errcallback(XMLHttpRequest, textStatus, errorThrown)
            // console.log(JSON.stringify(XMLHttpRequest))
            // console.log(JSON.stringify(textStatus))
            // console.log(JSON.stringify(errorThrown))
        }
    };
    if (!submitModel) {
        submitoption = $.extend(true,submitoption,{
            //指定参数名称
            jsonp: "jsonpcallback",
            dataType: "jsonp",
            jsonpCallback: option.jsonp + (new Date).getTime() + Math.floor(Math.random() * 100),
        });
    }
    $.ajax(submitoption);
}

/* 日期操作 */
var zDate = {
    /* 日期、时间格式化 返回两位数 */
    twotimefun: function(d){
        if (d < 10){
            return "0"+d;
        }else {
            return d;
        }
    },
    /*
    * 传 time 返回指定时间
    * type="data" 或 type 为空 返回当前日期
    * type="time" 返回当前时间
    * type="datatime" 返回当前日期加时间
    */
    getNowdata: function (type,dtime,gs) {
        if(gs == undefined){
            gs = "-"
        }
        var myDate = new Date();
        var ftime = dtime;
        if (ftime != undefined && ftime != "") {
            if(typeof(ftime) == "string" && ftime.indexOf("T") != -1 )
            {
                ftime = ftime.replace(/T/," ");
                ftime = ftime.split(".")[0];
            }
            if(typeof(ftime) == "string" && ftime.indexOf("-") != -1){
                ftime = ftime.replace(/-/g,"/");
            }
            myDate = new Date(ftime);
        }
        var year = myDate.getFullYear();
        var month = zDate.twotimefun(myDate.getMonth() + 1);
        var date = zDate.twotimefun(myDate.getDate());
        var Hours = zDate.twotimefun(myDate.getHours())
        var Minutes = zDate.twotimefun(myDate.getMinutes())
        var Seconds = zDate.twotimefun(myDate.getSeconds())
        if (type == undefined || type == "data"){
            return year + gs + month + gs + date;
        }
        if (type == "datatime"){
            return year+gs+month+gs+date+" "+Hours+":"+Minutes+":"+Seconds;
        }
        if (type == "time"){
            return Hours+":"+Minutes+":"+Seconds;
        }
    },
    /* 获取星期 */
    getNowWeek: function () {
        var week = new Date().getDay();
        var list = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]
        return list[week - 1];
    },
    /* 秒转成 时分秒 */
    formatSeconds: function(value) {
        var theTime = parseInt(value);// 秒
        var theTime1 = 0;// 分
        var theTime2 = 0;// 小时
        if(theTime > 60) {
            theTime1 = parseInt(theTime/60);
            theTime = parseInt(theTime%60);
            if(theTime1 > 60) {
                theTime2 = parseInt(theTime1/60);
                theTime1 = parseInt(theTime1%60);
            }
        }
        var result;
        if (theTime > 0){
            result = zDate.twotimefun(parseInt(theTime));
        }else {
            result = "00"
        }
        if(theTime1 > 0) {
            result = zDate.twotimefun(parseInt(theTime1))+":"+result;
        }else {
            result = "00:"+result;
        }
        if(theTime2 > 0) {
            result = zDate.twotimefun(parseInt(theTime2))+":"+result;
        }else {
            result = "00:"+result;
        }
        return result;
    },
    getlastday: function (date,length) {
        function geshi(data) {
            var a = data;
            if (a<10){
                a = "0"+a;
            }
            return a;
        }
        var data1 = new Date(date);
        data1.setDate(data1.getDate()+length);
        return data1.getFullYear()+"-"+geshi(data1.getMonth()+1)+"-"+geshi(data1.getDate());
    },
    getdatalength: function (data1,data2) {
        var l = Math.abs(new Date(zDate.getNowdata("data",data1)) - new Date(zDate.getNowdata("data",data2)))/86400000;
        return l;
    },
    writetime: function(ctime){
        var cdata = zDate.getNowdata("data",ctime);
        var ctime = zDate.getNowdata("time",ctime);
        var ndata = zDate.getNowdata("data");
        var l = zDate.getdatalength(cdata,ndata);
        if (l == 0){
            return ctime;
        }
        if (l == 1){
            return "昨天";
        }
        if (l == 2){
            return "前天";
        }
        return cdata;
    },
    // 到期时间
    expireTime: function(expires){
        if(expires > 0){
            var second = expires;
            if (expires > 100000000){
                expires = expires/1000;
                second = expires;
            }
        }
        else{
            var second = "0 分";
            return second;
        }
        var day = hour = min = "";
        if(second>86400){
            day = Math.floor(second/86400)+"天 ";
            second = second%86400;
        }
        if(second>3600){
            hour = Math.floor(second/3600)+"时 ";
            second = second%3600;
        }
        if(second>60){
            min = Math.floor(second/60)+"分 ";
            second = second%60;
        }
        second = second.toFixed(0)+"秒";
        return day+hour+min+second;
    },
    gettimelength: function (data1, data2) {
        var t1 = new Date(zDate.getNowdata("datatime",data1,"/"));
        var t2 = new Date(zDate.getNowdata("datatime",data2,"/"));
        return (t2 - t1)/1000;
    }
}
