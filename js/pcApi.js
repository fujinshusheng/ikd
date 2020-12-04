var pcApi = {
    /*------------下拉菜单操作 begin--------------------*/
    //下拉菜单
    xl: function (dom, fun) {
        //
        var _top = $(dom).offset().top;
        var _left = $(dom).offset().left;
        //显示列表
        $(".ikd_cbLt_list").show();
        //显示遮罩层
        $("#zzjhjksjkdasd1").show();
        //透明度
        $("#zzjhjksjkdasd1").css({
            "opacity": "0.1"
        });
        //点击后隐藏
        $("#zzjhjksjkdasd1").click(function () {
            //隐藏下拉
            pcApi.xl1();
        });
        //更改坐标
        $(".ikd_cbLt_list").css({
            "top": (_top + 40) + "px", "left": _left + "px"
        });
        //执行函数
        fun();
    },
    //隐藏下拉
    xl1: function () {
        //隐藏遮罩层
        $("#zzjhjksjkdasd1").hide();
        //隐藏列表
        $(".ikd_cbLt_list").hide();
    },
    /*------------下拉菜单操作 end--------------------*/
    /*------------数据通讯AJAX begin--------------------*/
    submit: function (opt) {
        //初始化合并参数
        opt = $.extend({
            cmd: '',
            //post传输的参数
            parm: { pppa: 1 },
            //回调函数
            fun: function (retText, retJson, retStatus, retData) { }
        }, opt);
        $.post('/m/api/api.ashx?cmd=' + opt.cmd, opt.parm, function (ret) {
            try {
                //转换JSON
                var retJson = eval('(' + ret + ')');
                //获取返回数据状态
                var _status = pcApi.json.get(retJson, 'status', '500');
                if (_status == '200') {
                    //返回数据
                    opt.fun(ret, retJson, _status, pcApi.json.get(retJson, 'msg', []));
                } else {
                    opt.fun(ret, retJson, _status, []);
                }
            } catch (error123) { alert('请联系IT部门！' + opt.cmd+',' + error123); }
        }, 'text');//dataType 可以是 text，json，xml，搜索script 等
    },
    /*------------数据通讯AJAX end--------------------*/
    /********************************json操作 begin*******************************/
    json: {
        //参数解说
        /*
        _obj:需要操作的json对象
        _key1：需要取得节点名,
        _value1：如果节点不存在时，需要返回的默认值
        */
        get: function (_obj, _key1, _value1) {
            if (_value1 == undefined) _value1 = "";
            if (!this.is(_obj, _key1)) { return _value1; }
            return _obj["" + _key1];
        },
        //是否存在节点
        is: function (_obj, _key1) {
            return ("" + _key1 in _obj);
        }
    },
    /********************************json操作 end*******************************/
    //提示框
    alert: function (opt1) {
        var _content = '';
        if (typeof (opt1) == 'string') {
            _content = opt1;
        }
        //初始化合并参数
        var opt = $.extend({
            //是否显示按钮
            isbtn: true,
            //1：成功  2：失败
            type: 1,
            content: _content,
            title: '系统提示',
            time: 3600000,
            fun: function (index, layero) { }
        }, typeof (opt1) == 'string' ? {} : opt1);
        //
        var _parms = {
            //需要显示的左边类型
            icon: opt.type,
            //标题
            title: opt.title,
            //内容
            content: opt.content,
            //自动关闭的时间
            time: opt.time,
            //关闭后执行
            end: function (index, layero) {
                opt.fun(index, layero);
            }
        };
        //是否显示按钮
        if (!opt.isbtn) _parms.btn = [];
        //layer插件
        layer.open(_parms);
    },
    //读取登录用户的保留信息
    getCurrentUser: function () {
        var opt = {
            userName: '',
            userPassWord: '',
            quyuId: '',
            quyuName: ''
        };
        try {
            var cuser = window.external.ReadNamePwd();

            //获取默认值
            if (cuser.split('|||||').length > 1) {
                var userinfo = cuser.split('|||||');
                //赋值登录名称
                opt.userName = (userinfo.length >= 0 ? userinfo[0] : '');
                //赋值登录密码
                opt.userPassWord = (userinfo.length >= 1 ? userinfo[1] : '');
                //赋值登录区域ID
                opt.quyuId = (userinfo.length >= 2 ? userinfo[2] : '0');
                //赋值登录区域名称
                opt.quyuName = (userinfo.length >= 3 ? userinfo[3] : '');
            }
        } catch (e) {

        }
        //
        return opt;
    },
    end: function () { }
};





$(function () {
    $("body").click(function () {
        if (clicknum != -1) {
            setWinformInput();
        }
        clicknum = 0;
    });

    $(":text").click(function () {
        if (!$(this).hasClass("ewm")) {
            clicknum = -1;
        }
    });
    setWinformInput();
});

//点击数量
var clicknum = 0;
//设置输入焦点定时器
var setWinformInputObj;
//设置winfrom中输入框的焦点
function setWinformInput() {
    setWinformInputObj = window.setTimeout(function () {
        window.external.setWinformInput();
        //删除定时器
        window.clearTimeout(setWinformInputObj);
    }, 500);
}

//公共数据
var publicData = {
    //获取炉子当前状态信息
    FurnaceStatus: function (_fun) {
        //
        pcApi.submit({
            cmd: 'getluzpic',
            //post传输的参数,区域编号
            parm: { BLCompanyID: pcApi.getCurrentUser().quyuId },
            //回调函数
            fun: function (retText, retJson, retStatus, retData) {
                _fun(retText, retJson, retStatus, retData);
            }
        });
    },
    //获取材料成份
    M_GetCLCF: function (parm, _fun) {
        pcApi.submit({
            cmd: 'M_GetCLCF',
            //post传输的参数
            parm: parm,
            //回调函数
            fun: function (retText, retJson, retStatus, retData) {
                _fun(retText, retJson, retStatus, retData);
            }
        });
    }
};