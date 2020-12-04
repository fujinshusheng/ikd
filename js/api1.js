var api1 = {
    config: {
        //ajax请求的接口路径
        ajaxPath: '/pc/api/api.ashx'
    },
    //------------------------------下拉选择 begin------------------------
    /*
    使用场景必须跟该项目HTML+CSS+DIV吻合，否则无法使用
    */
    //显示下拉选择
    showDropDown: function (opt) {
        /*
        DataArr:JSON数据集合
        dom:需要显示的列表元素
        txtDom:需要赋值的内容文本元素
        idDom：需要赋值的内容对应的编号信息（有时候编号值跟内容值是一样的）
        dicType:每次焦点在input（_txtDom）中失去时会提交到数据库中到字典处理，dicType=空或undefined时，不执行记录
        */
        var DataArr = opt.DataArr, dom = opt.dom,
        _txtDom = opt.txtDom, _idDom = opt.idDom;
        api1.DropDown_dicType = opt.dicType == undefined ? "" : opt.dicType;
        //赋值给全局
        api1.DropDown_DataArr = DataArr;
        api1.DropDown_txtDom = _txtDom;
        api1.DropDown_idDom = _idDom;
        api1.DropDown_dom = dom;
        //创建索引，操作键盘方向键时用到
        api1.DropDown_Index = -1;
        //当前显示着的条数，操作键盘方向键时用到
        api1.DropDown_Showli = $(dom).find('li').length;

        //绑定数据
        this.bindDropDownData();

        //是否有遮罩层存在
        if ($("#blackOverId").length == 0)
            $("body").append('<div id="blackOverId" class="blackOver" onclick="api1.hideDropDown();"></div>');
        //显示层级
        $('.ikd_cB td').css({ 'z-index': '1' });
        $(dom).parent().css({ 'z-index': '1001' });
        //如果隐藏则直接显示
        if ($(dom).is(":hidden")) { $(dom).show(); }
        //if ($('.blackOver').is(":hidden")) { $('.blackOver').show(); }
        // 如果被选元素可见,则隐藏这些元素,如果被选元素隐藏,则显示这些元素
        //$(dom).toggle();
        //$('.blackOver').toggle();
        //没有任何up属性，说明已经没有绑定过
        if ($(_txtDom).attr("keyup1") == undefined) {
            //已经绑定成功
            $(_txtDom).attr("keyup1", "1");
            //键盘弹起时执行
            $(_txtDom).bind('keyup', function (event1) {
                api1.bindDropDownSJ(event1);
            });
            //失去焦点时执行
            $(_txtDom).bind('blur', function () {
                debugger;
                api1.bindDropDownBlur();
            });
        }
    },
    //失去焦点时执行
    bindDropDownBlur: function () {
        //赋值给全局
        var _txtDom = api1.DropDown_txtDom;
        var _idDom = api1.DropDown_idDom;
        var dom = api1.DropDown_dom;
        var DataArr = api1.DropDown_DataArr;
        //无类型则不记录
        if (api1.DropDown_dicType == "") return;
        //防止重复提交
        if (api1.bindDropDownBlurTimeObj == undefined) api1.bindDropDownBlurTimeObj = 0;
        //未执行
        if (api1.bindDropDownBlurTimeObj == 0) {
            //已执行
            api1.bindDropDownBlurTimeObj = 1;
            //延迟1秒执行
            window.setTimeout(function () {
                //获取内容的值
                var tempTxtV = $(_txtDom).val();
                //获取编号的值
                var tempidV = $(_idDom).val();
                if (tempidV == '') {
                    tempidV = tempTxtV;
                    $(_idDom).val(tempTxtV);
                }
                //数据转换成字符串
                var DataArrStr = JSON.stringify(DataArr);
                //是否允许加入组
                var passgo = (DataArrStr.indexOf("\"" + tempTxtV + "\"") == -1 ? true : false);
                if (passgo) {
                    //加入到数组中
                    DataArr.push({ name: '' + tempTxtV, id: '' + tempTxtV, t: '' });
                }
                //如果是自定义保存下拉事件
                if (api1.DropDown_dicType == "self") {
                    if (api1.autoBind != undefined) {
                        api1.autoBind();
                    }
                }
                else {
                    //提交到数据库
                    $.post(api1.config.ajaxPath + '?cmd=1', {
                        Fname: tempTxtV,
                        Fvalue: tempTxtV,
                        Ftype: '' + api1.DropDown_dicType
                    }, function (dat) {
                        //未执行
                        api1.bindDropDownBlurTimeObj = 0;
                    });
                }
            }, 100);
        }
    },
    //绑定输入框事件
    bindDropDownSJ: function (event1) {
        //赋值给全局
        var _txtDom = api1.DropDown_txtDom;
        var _idDom = api1.DropDown_idDom;
        var dom = api1.DropDown_dom;
        var DataArr = api1.DropDown_DataArr;
        var event = event1.keyCode
        //输入方向键盘元素 上下左右
        if (event == 37 || event == 38 || event == 39 || event == 40) { return; }

        //第一次启动时
        if (api1.setTimeoutObj1 == undefined) api1.setTimeoutObj1 = 0;
        //允许启动搜索
        if (api1.setTimeoutObj1 == 0) {
            //不允许启动搜索，会导致并发
            api1.setTimeoutObj1 = 1;
            window.setTimeout(function () {
                //检索数据
                api1.sousuoDropDown($(_txtDom).val());
                //允许启动搜索
                api1.setTimeoutObj1 = 0;
            }, 300);
        }
    },
    //绑定数据到列表中
    bindDropDownData: function (_key) {
        //赋值给全局
        var _txtDom = api1.DropDown_txtDom;
        var _idDom = api1.DropDown_idDom;
        var dom = api1.DropDown_dom;
        var DataArr = api1.DropDown_DataArr;
        //清空
        $(dom).html('');
        //没有关键词时，直接显示全部 
        if (_key == undefined) {
            //数据绑定        
            for (var x in DataArr) {
                $(dom).append('<li onclick="api1.liClickDropDown(this);" value="' + DataArr[x].id + '">' + DataArr[x].name + '</li>');
            }
        } else {
            //搜索数据
            for (var x in DataArr) {
                //获取内容
                var _v = DataArr[x].name;
                //转换成大写来执行
                _v = _v.toUpperCase();
                //检索到的数据是否存在，存在则显示，不存在则隐藏
                if (_v.indexOf('' + _key) != -1) {
                    $(dom).append('<li onclick="api1.liClickDropDown(this);" value="' + DataArr[x].id + '">' + DataArr[x].name + '</li>');
                }
            }
        }
        //目前显示的总记录数
        api1.DropDown_Showli = $(dom).find('li').length;
        //判断是否没有搜索到任何一条数据
        if (api1.DropDown_Showli == 0) {
            //添加对应的提示
            if ($(dom).find('.sousuo_nodata').length == 0)
                $(dom).append('<span class="sousuo_nodata">抱歉没有您要的数据！<input type="button" value="保存当前输入内容" onclick="api1.inputGoFunDropDown();" /></span>');
        } else {
            //删除提示
            $('.sousuo_nodata').remove();
        }
    },
    //每一行的选中事件
    liClickDropDown: function (thisDom) {
        //是否之前已经处理过了
        if (api1.DropDown_dom == null) return;
        //获取当前行的值
        api1.getDropDownValue(thisDom);
        //隐藏下拉选择
        api1.hideDropDown();
        if (api1.ddlEvent) {
            api1.ddlEventBind();
        }
    },
    //获取当前行的值
    getDropDownValue: function (thisDom) {
        //赋值给全局
        var _txtDom = api1.DropDown_txtDom;
        var _idDom = api1.DropDown_idDom;
        var dom = api1.DropDown_dom;
        var DataArr = api1.DropDown_DataArr;
        //赋值内容
        $(_txtDom).val($(thisDom).html());
        //赋值编号，有些信息是编号跟内容一样的
        $(_idDom).val($(thisDom).attr("value"));
    },
    //隐藏下拉选择
    hideDropDown: function () {
        //是否之前已经处理过了
        if (api1.DropDown_dom == null) return;
        $('#blackOverId').hide();
        $('.ikd_cbLt').hide();
        //删除全局对象
        api1.DropDown_dom = null;
    },
    //搜索相关词项，显示
    sousuoDropDown: function (_key) {
        var DataArr = api1.DropDown_DataArr;
        var _txtDom = api1.DropDown_txtDom;
        var _idDom = api1.DropDown_idDom;
        var dom = api1.DropDown_dom;
        //没有关键词时，所有都显示
        if (_key == '') { this.bindDropDownData(); return; }
        //转换成大写来执行
        _key = _key.toUpperCase();
        //索引重置
        api1.DropDown_Index = -1;
        //清除所有数据
        $(dom).html('');
        //显示数据
        api1.bindDropDownData(_key);
    },
    //键盘方向控制
    keyGoDropDown: function (eventValue) {
        //是否之前已经处理过了
        if (api1.DropDown_dom == null) return;
        var _txtDom = api1.DropDown_txtDom;
        var _idDom = api1.DropDown_idDom;
        var dom = api1.DropDown_dom;
        //上
        if (eventValue == 38) {
            //当第一次创建索引时，用户按了上动作，则直接选中最后一条
            if (api1.DropDown_Index == -1) api1.DropDown_Index = domLength - 1;
            //递减
            api1.DropDown_Index = api1.DropDown_Index - 1;
        }
        //下
        if (eventValue == 40) {
            //累加
            api1.DropDown_Index = api1.DropDown_Index + 1;
        }
        //alert(api1.DropDown_Index + "," + api1.DropDown_Showli);
        //第一条
        if (api1.DropDown_Index < 0) api1.DropDown_Index = 0;
        //是否超出最大值
        if (api1.DropDown_Index >= api1.DropDown_Showli) api1.DropDown_Index = api1.DropDown_Showli - 1;
        //其他行都删除样式
        $(dom).find("li").removeClass('Cur');
        //选中行
        var curObj = $(dom).find("li").eq(api1.DropDown_Index);
        //选中行添加样式
        curObj.addClass('Cur');
        //获取当前值
        api1.getDropDownValue(curObj);
        //获取索引
        var rowindex = parseInt(api1.DropDown_Index / 10);
        //滚动条定位到指定位置
        $(dom).scrollTop(400 * rowindex);
        //$(dom).scrollTop(curObj.offset().top);
    },
    //------------------------------下拉选择 end------------------------
    /*------------数据表格翻页 begin--------------------*/
    /*	
    el:分页容器 
    count:总记录数 
    pageStep:每页显示多少个 
    pageNum:第几页 
    fnGo:分页跳转
    api.jsPage(el, count, pageStep, pageNum, fnGo)

    使用方式：
    api.jsPage('#divPage', 800, 10, pageIndex, 'goPage');
    //点击翻页页码时所需要触发的事件
    var goPage=function(pageinds){
    alert('第'+pageinds+'页');
    }
    */
    jsPage: function (el, count, pageStep, pageNum, fnGo, num) {
        $(el).html("");
        if (count <= 0) count = 1;
        if (count <= pageStep) return false;
        this.getLink = function (fnGo, index, pageNum, text) {
            var s = '<a href="#p' + index + '" onclick="' + fnGo + '(' + index + ');" ';
            if (index == pageNum) {
                s += 'class="Cur" ';
            }
            text = text || index;
            s += '>' + text + '</a> ';
            return s;
        }

        //总页数
        var pageNumAll = Math.ceil(count / pageStep); //alert(pageNumAll);
        if (pageNumAll == 1) {
            divPage.innerHTML = '';
            return;
        }
        if (num != null) {
            var itemNum = num; //当前页左右两边显示个数
        } else {
            var itemNum = 2;
        }
        pageNum = Math.max(pageNum, 1);
        pageNum = Math.min(pageNum, pageNumAll);
        var s = '';
        var begin = 1;
        if (pageNum - itemNum > 1) {
            s += this.getLink(fnGo, 1, pageNum) + '<em>...</em>';
            begin = pageNum - itemNum;
        }
        var end = Math.min(pageNumAll, begin + itemNum * 2);
        if (end == pageNumAll - 1) {
            end = pageNumAll;
        }
        for (var i = begin; i <= end; i++) {
            s += this.getLink(fnGo, i, pageNum);
        }
        if (end < pageNumAll) {
            s += '<em>...</em> ' + this.getLink(fnGo, pageNumAll, pageNum);
        }
        if (pageNum < pageNumAll) {
            // s += this.getLink(fnGo, pageNum + 1, pageNum, '<span class="xiayi">下一页</span>');
        } else {
            //s += '<span>下一页</span> ';
        }
        if (pageNum > 1) {
            s += '<span>共' + count + '条</span>';
            //s += this.getLink(fnGo, pageNum - 1, pageNum, '<span class="shangyi">上一页</span>');
        } else {
            s += '<span>共' + count + '条</span>';
            //s += '<span>上一页</span> ';
        }
        //s += '<span class="tiaozhuan">跳转到：</span><input type="text" name="yema" id="yema2" class="yema" value="' + pageNum + '" /><a class="go" onclick="' + fnGo + '($(\'#yema2\').val())" style="cursor:pointer">GO</a>';
        $(el).html("<div class=\"ikd_page\">" + s + "</div>");
    },
    /*------------数据表格翻页 end--------------------*/
    /*------------数据通讯AJAX begin--------------------*/
    ajax: function (opt) {
        //初始化合并参数
        opt = $.extend({
            //传输get参数     asdasd.aspx?cmd=login&del=1
            url: '',
            //post传输的参数
            parm: { cmd: '' },
            //回调函数
            //ret:原始数据
            //msg：正确的信息集合
            //rows：翻页时的数据集合
            //count:翻页时的总记录数
            fun: function (ret, msg, rows, count) { }
        }, opt);
        //异步提交
        $.post(opt.url, opt.parm, function (ret) {
            //获取返回数据状态
            var _status = api1.json.get(ret, 'status', '500');
            //正常数据请求
            if (_status == 200) {
                //获取翻页时的总记录数
                var TotalCount = 0;
                try { TotalCount = ret.msg.ds1[0].TotalCount } catch (e) { }
                //获取翻页时的数据集合
                var fydata = api1.json.get(ret.msg, 'ds');
                //执行回调函数
                opt.fun(ret, ret.msg, fydata, TotalCount);
            } else {
                alert(JSON.stringify(ret));
            }
        }, 'json');
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
    goUrl: function (u) {
        window.location.href = '' + u;
    },
    end: function () { },
    //绑定数据
    bindData: function (dat) {
        if (dat.status == 200) {
            if (dat.msg.ds.length > 0) {
                $("input").each(function () {
                    var $this = $(this);
                    var value = dat.msg.ds[0]["" + $this.attr("name") + ""];
                    if (value != undefined) {
                        //赋值
                        $this.val(value);
                        //如果是隐藏域赋值，把显示值也赋值下
                        if ($this.attr("type") == "hidden") {
                            var hfId = $this.attr("id");
                            if (hfId.length > 2 && hfId.substr(hfId.length - 2) == "ID") {
                                hfId = hfId.substr(0, hfId.length - 2);
                                var data = eval(hfId + "Data");
                                //判断是标准json字符串还是已经整理好的数据
                                if (data["status"] != undefined) {
                                    data = data.msg.ds;
                                }
                                //开始循环找数据
                                for (var i = 0; i < data.length; i++) {
                                    if (data[i]["id"] == value) {
                                        $("#" + hfId + "Txt").val(data[i]["name"]);
                                        break;
                                    }
                                }
                            }
                            else {
                                $(hfId + "ShowData").val(value);
                            }
                        }
                    }
                });
                $("select").each(function () {
                    var value = dat.msg.ds[0]["" + $(this).attr("name") + ""];
                    $(this).find("option").each(function () {
                        if ($(this).val() == value) {
                            $(this).attr("selected", "selected");
                        }
                    });
                });
            }
        }
    },
    timeFormat: function (t) {
        return t.split('.')[0].replace(/T/g, ' ');
    }
};


$(function () {
    $(document).keyup(function (event) {
        //回车 
        if (event.keyCode == 13) { api1.hideDropDown(); }
        //左 
        if (event.keyCode == 37) { }
        //上
        if (event.keyCode == 38) { api1.keyGoDropDown(38); }
        //右
        if (event.keyCode == 39) { }
        //下
        if (event.keyCode == 40) { api1.keyGoDropDown(40); }
    });

    $(".num").keyup(function (event) {
        var num = $(this).val();
        var b = isNaN(num);
        if (b) {
            $(this).val("");
        }
    });
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
    //屏蔽回车
    document.onkeyup = function () {
        if (window.event && window.event.keyCode == 13) {
            $(".ewm").each(function () {
                if ($(this).is(":focus")) {
                    $(this).change();
                }
            });
        }
    }
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



function ewmFormat(data) {
    var v = data.toLowerCase();
    v = eval("(" + v + ")");
    if (v.g != undefined) {
        if ($("[ewm='" + v.g + "']").length == 0) {
            alert($("[ewm='" + v.g + "']"));
            $("[ewm='" + v.g + "']").next().val(v.n);
        }
        else {
            $("[ewm='" + v.q + "']").next().val(v.n);
        }
        
    }
    else {
        $("[ewm='" + v.q + "']").next().val(v.n);
    }
    $.post("/m/api/api.ashx?cmd=getewmnqk", {
        q: v.q.toUpperCase(),
        n: v.n
    }, function (data) {
        if (data.status == 200) {
            if (v.g != undefined) {
                if ($("[ewm='" + v.g + "']").length==0) {
                    $("[ewm='" + v.g + "']").val(data.msg.ds[0].FEmplName);
                }
                else {
                    $("[ewm='" + v.q + "']").val(data.msg.ds[0].FEmplName);
                }
            }
            else {
                $("[ewm='" + v.q + "']").val(data.msg.ds[0].FEmplName);
            }
            if (api1.changefunc != undefined) {
                api1.changefunc();
            }
        }
    }, "json");
}

//屏蔽错误提示
window.onerror = function () { return true; } 