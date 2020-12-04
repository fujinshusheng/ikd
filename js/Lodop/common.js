
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
            //打印机名称（不填则使用默认打印机）
            printName:'',
            //操作系统内打印机属性中的纸张名称
            strPageName:'',
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
        //设定纸张大小
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
        if (opt.printName) com.LODOP.SET_PRINTER_INDEXA(opt.printName);//打印机名称
        if (opt.isprint) com.LODOP.PRINT(); else com.LODOP.PREVIEW();
    },

};