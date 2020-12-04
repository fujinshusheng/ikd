(function ($) {
    var jwPrintMethods = {
        fanchangTM: function (opts) {
            // 60mmX60MM条码
            opts = $.extend({
                Ftype: '',
                //需要打印的内容 html代码
                // PrintContent:'<table cellspacing="1"><tr><td colspan="2" rowspan="4" style="width:190px;"></td><td>{aaa}</td></tr><tr><td>{bbb}</td></tr><tr><td>{ccc}</td></tr><tr><td>{ddd}</td></tr></table>',
                PrintContent: '<table border="0" width="141" height="80" cellspacing="3" style="font-family:黑体; font-size: 5pt; font-weight:bold"\n       cellpadding="3">\n    '
                    + '<tr style="height:8px;">\n        <td width="50%" colspan="2" align="center" style="font-family:黑体; font-size: 8pt; font-weight:bold" rowspan="2">\n            IKD铝汤检验 <br>\n            标识卡\n        </td>\n        <td width="50%" align="center">送检码</td>\n    </tr>\n    <tr style="height:15px;">\n        <td colspan="3"></td>\n    </tr>'
                    + '\n    '
                    + '<tr style="height:8px;">\n        <td width="25%">炉&nbsp;&nbsp;&nbsp;&nbsp;号:</td>\n        <td width="25%" style="border:1px solid #000000; ">{bbb}</td>\n        <td width="50%"></td>\n    </tr>\n    '
                    + '<tr style="height:8px;">\n        <td>汤包编号:</td>\n        <td style="border: 1px solid #000000">{ccc}</td>\n        <td align="center"></td>\n    </tr>\n    '
                    + '<tr style="height:8px;">\n        <td>编&nbsp;&nbsp;&nbsp;&nbsp;号:</td>\n        <td style="border: 1px solid #000000" colspan="2">{aaa}</td>\n    </tr>\n    '
                    + '<tr style="height:8px;">\n        <td>日&nbsp;&nbsp;&nbsp;&nbsp;期:</td>\n        <td style="border: 1px solid #000000" colspan="2">{ddd}</td>\n    </tr>\n</table>',

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
                //打印机名称（不填则使用默认打印机）
                printName: '',
                //操作系统内打印机属性中的纸张名称
                strPageName: '',
                intPageWidth: "400",
                intPageHeight: "300",
                TEXTS: [],
                ArrayMed: [],
                printcount: 1
            }, opts);
            //初始化打印控件
            var LODOP = getLodop();
            //设定纸张大小
            LODOP.SET_PRINT_PAGESIZE(opts.intOrient, opts.intPageWidth, opts.intPageHeight, "");

            for (j = 0; j < opts.ArrayMed.length; j++) {
                var ArrayMed = opts.ArrayMed[j]
                //组装多页打印内容
               if (opts.printcount > 0) {
                   for (var i = 1; i <= opts.printcount;i++) {
                       CreateOnePage(ArrayMed);
                    }
               }
            }
            ;

            //单页打印内容创建 开始
            function CreateOnePage(ArrayMedCH) {
                // alert(ArrayMedCH.id);
                var PrintContent = opts.PrintContent.replace('{aaa}', ArrayMedCH.FCodeindx)
                    .replace('{bbb}', ArrayMedCH.FCode)
                    .replace('{ccc}', ArrayMedCH.FTBNumber)
                    .replace('{ddd}', ArrayMedCH.FDate);
                var barcodeList = [{
                    Top: 14,
                    Left: 80,
                    Width: "70",
                    Height: "70",
                    /*
                           条码类型，字符型。目前支持的类型（条码规制）如下：
                                           128A，128B，128C，128Auto，EAN8，EAN13，EAN128A，EAN128B，EAN128C，Code39，39Extended，2_5interleaved，2_5industrial，
                                           2_5matrix，UPC_A，UPC_E0，UPC_E1，UPCsupp2，UPCsupp5，Code93，93Extended，MSI，PostNet，Codabar，QRCode，PDF417。
                                           其中QRCode和PDF417是二维码，其它为一维码。默认情况下“QRCode的版本”、“PDF417压缩模式”、“PDF417容错级别” “PDF417数据列数”
                                           “PDF417基条高(倍数)”等参数会根据宽度和高度自动调整，当然页面程序也可以直接设置它们的具体值。
                           */
                    CodeType: 'QRCode',
                    CodeValue: ArrayMedCH.serialSN
                }
                    /**,{
                        Top: 180,
                        Left: 20,
                        Width: 100,
                        Height: 30,
                        CodeType: '128A',
                        CodeValue: ArrayMedCH.barcode
                    		}**/
                ]

                //正文
                LODOP.NewPage();
                LODOP.ADD_PRINT_HTM(0, 0, "100%", "100%", PrintContent);

                //二维码
                if (Array.isArray(barcodeList)) {
                    for (var i = 0, length = barcodeList.length; i < length; i++) {
                        var barcode = barcodeList[i];
                        if (barcode.CodeValue) LODOP.ADD_PRINT_BARCODE(barcode.Top, barcode.Left,
                            barcode.Width, barcode.Height, barcode.CodeType, barcode.CodeValue);
                        if (barcode.isHideText) {//isHideText true隐藏文字 false不隐藏文字
                            LODOP.SET_PRINT_STYLEA(0, "ShowBarText", 0);
                            if (barcode.CustomTextValue) {//条形码文字自定义
                                LODOP.ADD_PRINT_TEXT(barcode.Top + barcode.Height, barcode.Left,
                                    barcode.Width, 1, barcode.CustomTextValue);
                                LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
                                LODOP.SET_PRINT_STYLEA(0, "FontSize", barcode.CustomTextSize);
                            }
                        }
                    }
                } else {
                    if (barcodeList.CodeValue) LODOP.ADD_PRINT_BARCODE(barcodeList.Top, barcodeList.Left,
                        barcodeList.Width, barcodeList.Height, barcodeList.CodeType, barcodeList.CodeValue);
                    if (barcodeList.isHideText) {//isHideText true隐藏文字 false不隐藏文字
                        LODOP.SET_PRINT_STYLEA(0, "ShowBarText", 0);
                        if (barcodeList.CustomTextValue) {//条形码文字自定义
                            LODOP.ADD_PRINT_TEXT(barcodeList.Top + barcodeList.Height, barcodeList.Left,
                                barcodeList.Width, 1, barcodeList.CustomTextValue);
                            LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
                            LODOP.SET_PRINT_STYLEA(0, "FontSize", barcodeList.CustomTextSize);
                        }
                    }
                }
                if (opts.TEXTS.length > 0) {
                    for (var j = 0, len = opts.TEXTS.length; j < len; j++) {
                        var text = opts.TEXTS[j];
                        LODOP.ADD_PRINT_TEXT(text.Top, text.Left, text.Width, text.Height, text.strText);
                        LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
                        LODOP.SET_PRINT_STYLEA(0, "FontSize", text.textSize || 14);
                    }
                }
            }//单页打印内容创建 结束

            if (opts.printName) LODOP.SET_PRINTER_INDEXA(opts.printName);//打印机名称
            if (opts.isprint) LODOP.PRINT(); else LODOP.PREVIEW();

        },

        fanchangTM_TB: function (opts) {
            // 60mmX60MM条码
            opts = $.extend({
                Ftype: '',
                //需要打印的内容 html代码
                // PrintContent:'<table cellspacing="1"><tr><td colspan="2" rowspan="4" style="width:190px;"></td><td>{aaa}</td></tr><tr><td>{bbb}</td></tr><tr><td>{ccc}</td></tr><tr><td>{ddd}</td></tr></table>',
                PrintContent: '<table border="0" width="143" height="80" cellspacing="3" style="font-family:黑体; font-size: 6pt; font-weight:bold" cellpadding="3">'
                    + '<tr style="height:8px;"><td width="72%" colspan="2" align="left" style="font-family:黑体; font-size: 7pt; font-weight:bold" rowspan="2"></td><td width="23%" align="center"></td></tr>'
                    + '<tr style="height:8px;"><td>&nbsp;</td></tr>'
                    + '<tr style="height:8px;"><td width="40%">&nbsp;</td><td width="32%"></td><td width="23%"></td></tr>'
                    + '<tr style="height:8px;"><td></td><td>&nbsp;</td><td align="center"></td></tr>'
                    + '<tr style="height:8px;"><td></td><td>&nbsp;</td></tr>'
                    + '<tr style="height:8px;"><td>汤包编号:</td><td style="border: 1px solid #000000" colspan="2">{aaa}</td></tr></table>',

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
                //打印机名称（不填则使用默认打印机）
                printName: '',
                //操作系统内打印机属性中的纸张名称
                strPageName: '',
                TEXTS: [],
                ArrayMed: []
            }, opts);
            //初始化打印控件
            var LODOP = getLodop();
            //设定纸张大小
            LODOP.SET_PRINT_PAGESIZE(opts.intOrient, 0, 0, "");

            for (j = 0; j < opts.ArrayMed.length; j++) {
                //组装多页打印内容
                CreateOnePage(opts.ArrayMed[j]);
            }
            ;

            //单页打印内容创建 开始
            function CreateOnePage(ArrayMedCH) {
                // alert(ArrayMedCH.id);
                var PrintContent = opts.PrintContent.replace('{aaa}', ArrayMedCH.barcode);
                var barcodeList = [{
                    Top: 10,
                    Left: 40,
                    Width: 65,
                    Height: 65,
                    /*
                           条码类型，字符型。目前支持的类型（条码规制）如下：
                                           128A，128B，128C，128Auto，EAN8，EAN13，EAN128A，EAN128B，EAN128C，Code39，39Extended，2_5interleaved，2_5industrial，
                                           2_5matrix，UPC_A，UPC_E0，UPC_E1，UPCsupp2，UPCsupp5，Code93，93Extended，MSI，PostNet，Codabar，QRCode，PDF417。
                                           其中QRCode和PDF417是二维码，其它为一维码。默认情况下“QRCode的版本”、“PDF417压缩模式”、“PDF417容错级别” “PDF417数据列数”
                                           “PDF417基条高(倍数)”等参数会根据宽度和高度自动调整，当然页面程序也可以直接设置它们的具体值。
                           */
                    CodeType: 'QRCode',
                    CodeValue: ArrayMedCH.serialSN
                }
                    /**,{
                        Top: 180,
                        Left: 20,
                        Width: 100,
                        Height: 30,
                        CodeType: '128A',
                        CodeValue: ArrayMedCH.barcode
                    		}**/
                ]

                //正文
                LODOP.NewPage();
                LODOP.ADD_PRINT_HTM(0, 0, "100%", "100%", PrintContent);

                //二维码
                if (Array.isArray(barcodeList)) {
                    for (var i = 0, length = barcodeList.length; i < length; i++) {
                        var barcode = barcodeList[i];
                        if (barcode.CodeValue) LODOP.ADD_PRINT_BARCODE(barcode.Top, barcode.Left,
                            barcode.Width, barcode.Height, barcode.CodeType, barcode.CodeValue);
                        if (barcode.isHideText) {//isHideText true隐藏文字 false不隐藏文字
                            LODOP.SET_PRINT_STYLEA(0, "ShowBarText", 0);
                            if (barcode.CustomTextValue) {//条形码文字自定义
                                LODOP.ADD_PRINT_TEXT(barcode.Top + barcode.Height, barcode.Left,
                                    barcode.Width, 1, barcode.CustomTextValue);
                                LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
                                LODOP.SET_PRINT_STYLEA(0, "FontSize", barcode.CustomTextSize);
                            }
                        }
                    }
                } else {
                    if (barcodeList.CodeValue) LODOP.ADD_PRINT_BARCODE(barcodeList.Top, barcodeList.Left,
                        barcodeList.Width, barcodeList.Height, barcodeList.CodeType, barcodeList.CodeValue);
                    if (barcodeList.isHideText) {//isHideText true隐藏文字 false不隐藏文字
                        LODOP.SET_PRINT_STYLEA(0, "ShowBarText", 0);
                        if (barcodeList.CustomTextValue) {//条形码文字自定义
                            LODOP.ADD_PRINT_TEXT(barcodeList.Top + barcodeList.Height, barcodeList.Left,
                                barcodeList.Width, 1, barcodeList.CustomTextValue);
                            LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
                            LODOP.SET_PRINT_STYLEA(0, "FontSize", barcodeList.CustomTextSize);
                        }
                    }
                }
                if (opts.TEXTS.length > 0) {
                    for (var j = 0, len = opts.TEXTS.length; j < len; j++) {
                        var text = opts.TEXTS[j];
                        LODOP.ADD_PRINT_TEXT(text.Top, text.Left, text.Width, text.Height, text.strText);
                        LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
                        LODOP.SET_PRINT_STYLEA(0, "FontSize", text.textSize || 14);
                    }
                }
            }//单页打印内容创建 结束

            if (opts.printName) LODOP.SET_PRINTER_INDEXA(opts.printName);//打印机名称
            if (opts.isprint) LODOP.PRINT(); else LODOP.PREVIEW();

        },
     fanchangTM_TB2: function (opts) {
            // 60mmX60MM条码
            opts = $.extend({
                Ftype: '',
                //需要打印的内容 html代码
                // PrintContent:'<table cellspacing="1"><tr><td colspan="2" rowspan="4" style="width:190px;"></td><td>{aaa}</td></tr><tr><td>{bbb}</td></tr><tr><td>{ccc}</td></tr><tr><td>{ddd}</td></tr></table>',
                PrintContent: '<table border="0" width="141" height="80" cellspacing="3" style="font-family:黑体; font-size: 4pt; font-weight:bold"\n       cellpadding="3">\n    '
                    + '<tr style="height:7px;">\n        <td width="50%" colspan="2" align="center" style="font-family:黑体; font-size: 6pt; font-weight:bold" rowspan="2">\n            IKD铝汤检验 <br>\n            标识卡\n        </td>\n        <td width="50%" align="center">送检码</td>\n    </tr>\n    <tr style="height:15px;">\n        <td colspan="3"></td>\n    </tr>'
                    + '\n    '
                    + '<tr style="height:8px;">\n        <td width="25%">炉&nbsp;&nbsp;&nbsp;&nbsp;号:</td>\n        <td width="25%" style="border:1px solid #000000; ">{bbb}</td>\n        <td width="50%"></td>\n    </tr>\n    '
                    + '<tr style="height:8px;">\n        <td>汤包编号:</td>\n        <td style="border: 1px solid #000000">{ccc}</td>\n        <td align="center"></td>\n    </tr>\n    '
                    + '<tr style="height:8px;">\n        <td>编&nbsp;&nbsp;&nbsp;&nbsp;号:</td>\n        <td style="border: 1px solid #000000" colspan="2">{aaa}</td>\n    </tr>\n    '
                    + '<tr style="height:8px;">\n        <td>日&nbsp;&nbsp;&nbsp;&nbsp;期:</td>\n        <td style="border: 1px solid #000000" colspan="2">{ddd}</td>\n    </tr>\n</table>',

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
                //打印机名称（不填则使用默认打印机）
                printName: '',
                //操作系统内打印机属性中的纸张名称
                strPageName: '',
                intPageWidth: "400",
                intPageHeight: "300",
                TEXTS: [],
                ArrayMed: [],
                printcount: 1
            }, opts);
            //初始化打印控件
            var LODOP = getLodop();
            //设定纸张大小
            LODOP.SET_PRINT_PAGESIZE(opts.intOrient, opts.intPageWidth, opts.intPageHeight, "");

            for (j = 0; j < opts.ArrayMed.length; j++) {
                var ArrayMed = opts.ArrayMed[j]
                //组装多页打印内容
               if (opts.printcount > 0) {
                   for (var i = 1; i <= opts.printcount;i++) {
                       CreateOnePage(ArrayMed);
                    }
               }
            }
            ;

            //单页打印内容创建 开始
            function CreateOnePage(ArrayMedCH) {
                // alert(ArrayMedCH.id);
                var PrintContent = opts.PrintContent.replace('{aaa}', ArrayMedCH.FCodeindx)
                    .replace('{bbb}', ArrayMedCH.FCode)
                    .replace('{ccc}', ArrayMedCH.FTBNumber)
                    .replace('{ddd}', ArrayMedCH.FDate);
                var barcodeList = [{
                    Top: 14,
                    Left: 80,
                    Width: "70",
                    Height: "70",
                    /*
                           条码类型，字符型。目前支持的类型（条码规制）如下：
                                           128A，128B，128C，128Auto，EAN8，EAN13，EAN128A，EAN128B，EAN128C，Code39，39Extended，2_5interleaved，2_5industrial，
                                           2_5matrix，UPC_A，UPC_E0，UPC_E1，UPCsupp2，UPCsupp5，Code93，93Extended，MSI，PostNet，Codabar，QRCode，PDF417。
                                           其中QRCode和PDF417是二维码，其它为一维码。默认情况下“QRCode的版本”、“PDF417压缩模式”、“PDF417容错级别” “PDF417数据列数”
                                           “PDF417基条高(倍数)”等参数会根据宽度和高度自动调整，当然页面程序也可以直接设置它们的具体值。
                           */
                    CodeType: 'QRCode',
                    CodeValue: ArrayMedCH.serialSN
                }
                    /**,{
                        Top: 180,
                        Left: 20,
                        Width: 100,
                        Height: 30,
                        CodeType: '128A',
                        CodeValue: ArrayMedCH.barcode
                    		}**/
                ]

                //正文
                LODOP.NewPage();
                LODOP.ADD_PRINT_HTM(0, 0, "100%", "100%", PrintContent);

                //二维码
                if (Array.isArray(barcodeList)) {
                    for (var i = 0, length = barcodeList.length; i < length; i++) {
                        var barcode = barcodeList[i];
                        if (barcode.CodeValue) LODOP.ADD_PRINT_BARCODE(barcode.Top, barcode.Left,
                            barcode.Width, barcode.Height, barcode.CodeType, barcode.CodeValue);
                        if (barcode.isHideText) {//isHideText true隐藏文字 false不隐藏文字
                            LODOP.SET_PRINT_STYLEA(0, "ShowBarText", 0);
                            if (barcode.CustomTextValue) {//条形码文字自定义
                                LODOP.ADD_PRINT_TEXT(barcode.Top + barcode.Height, barcode.Left,
                                    barcode.Width, 1, barcode.CustomTextValue);
                                LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
                                LODOP.SET_PRINT_STYLEA(0, "FontSize", barcode.CustomTextSize);
                            }
                        }
                    }
                } else {
                    if (barcodeList.CodeValue) LODOP.ADD_PRINT_BARCODE(barcodeList.Top, barcodeList.Left,
                        barcodeList.Width, barcodeList.Height, barcodeList.CodeType, barcodeList.CodeValue);
                    if (barcodeList.isHideText) {//isHideText true隐藏文字 false不隐藏文字
                        LODOP.SET_PRINT_STYLEA(0, "ShowBarText", 0);
                        if (barcodeList.CustomTextValue) {//条形码文字自定义
                            LODOP.ADD_PRINT_TEXT(barcodeList.Top + barcodeList.Height, barcodeList.Left,
                                barcodeList.Width, 1, barcodeList.CustomTextValue);
                            LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
                            LODOP.SET_PRINT_STYLEA(0, "FontSize", barcodeList.CustomTextSize);
                        }
                    }
                }
                if (opts.TEXTS.length > 0) {
                    for (var j = 0, len = opts.TEXTS.length; j < len; j++) {
                        var text = opts.TEXTS[j];
                        LODOP.ADD_PRINT_TEXT(text.Top, text.Left, text.Width, text.Height, text.strText);
                        LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
                        LODOP.SET_PRINT_STYLEA(0, "FontSize", text.textSize || 14);
                    }
                }
            }//单页打印内容创建 结束

            if (opts.printName) LODOP.SET_PRINTER_INDEXA(opts.printName);//打印机名称
            if (opts.isprint) LODOP.PRINT(); else LODOP.PREVIEW();

        },

        chukuDJ: function (opts) {
            alert("出库单打印");
        },
        rukuDJ: function (opts) {
            alert("入库单打印");
        }
    };

    $.jwPrintList = function (options) {
        var opts;

        function init() {
            var defaluts = {
                Ftype: '',//当前要调用的打印格式
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
                //打印机名称（不填则使用默认打印机）
                printName: '',
                ArrayMed: [],//当前需要打印的内容数组,
                printcount: 1
            };
            opts = $.extend({}, defaluts, options); //使用jQuery.extend 覆盖插件默认参数
        }

        init();
        //打印数据验证
        if (opts.ArrayMed.length > 0) {
            if (jwPrintMethods[opts.Ftype]) {
                return jwPrintMethods[opts.Ftype].apply(this, arguments);
            } else {
                alert("未找到打印方法");
            }
            //alert("接收到打印数据！");
        } else {
            alert("未接收到打印数据！");
        }
    };
})(jQuery);