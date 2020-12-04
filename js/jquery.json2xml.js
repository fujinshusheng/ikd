/**
 * JSON to XML jQuery plugin. Provides quick way to convert JSON object to XML 
 * string. To some extent, allows control over XML output.
 * Just as jQuery itself, this plugin is released under both MIT & GPL licences.
 * 
 * Demo:
 * @param rootTagName  父节点名称自定义 默认值：dataList
 * @param firstName    第一层子节点名称定义 默认值：data
 * @param returnXML    指定数据返回类型，需要范围XML对象这里赋值true 默认值：false
   var DataxmlStr=$.json2xml(JSON数组,{rootTagName:'自定义父节点',firstName:'自定义第一层节点名称',returnXML:false});
       console.log("DataxmlStr:"+DataxmlStr);
 * 
 * @version 1.02
 * @author Micha Korecki, www.michalkorecki.com
 * 
 * @version 2.00
 * @author YuanJie SHI, www.jiwanginfo.com
 * @context 在原有功能基础上加入第一层子节点名称定义，原版本第一层子节点<0>非XML标准格式存在解析问题
 * 
 * @version 2.01
 * @author YuanJie SHI, www.jiwanginfo.com
 * @context 加入xml格式<![CDATA[ 数值 ]]> 对数据做防错处理避免项目使用中存在解析出错
 * 
 * @version 2.02
 * @author YuanJie SHI, www.jiwanginfo.com
 * @context 增加输出是XML类型业务功能
 * 
 */
(function($) {
	/**
	 * Converts JSON object to XML string.
	 * 
	 * @param json object to convert
	 * @param options additional parameters 
	 * @return XML string 
	 */
	$.json2xml = function(json, options) {
		settings = {};
		settings = $.extend(true, settings, defaultSettings, options || { });
		
		//2020年7月13日 YuanJie SHI 防错处理传入json传入空或者null直接返回null
		if(json===null || json.length===0) {return null;}
		
		//2020年7月13日 YuanJie SHI 对返回值进行改造可以指定返回string类型XML，也可以返回xml对象
		if(settings.returnXML){
			return parseXmlString(convertToXml(json, settings.rootTagName, '', 0,settings.firstName));
		}else{
			return convertToXml(json, settings.rootTagName, '', 0,settings.firstName);	
		}		
			
	};
	
	var defaultSettings = {
		formatOutput: true,
		formatTextNodes: false,
		indentString: '  ',
		rootTagName: 'dataList',
		firstName:'data', //2020年7月13日 YuanJie SHI 新增参数 第一层子节点名称定义修正1.02版本存在的节点定义隐藏BUG无法被系统XML格式解析
		returnXML:false,
		ignore: [],
		replace: [],
		nodes: [],
		///TODO: exceptions system
		exceptions: []
	};
	
	/**
	 * This is actual settings object used throught plugin, default settings
	 * are stored separately to prevent overriding when using multiple times.
	 */
	var settings = {};
	
	/**
	 * Core function parsing JSON to XML. It iterates over object properties and
	 * creates XML attributes appended to main tag, if property is primitive 
	 * value (eg. string, number).
	 * Otherwise, if it's array or object, new node is created and appened to
	 * parent tag. 
	 * You can alter this behaviour by providing values in settings.ignore, 
	 * settings.replace and settings.nodes arrays. 
	 * 
	 * @param json object to parse
	 * @param tagName name of tag created for parsed object
	 * @param firstName name of tag created for first parsed object
	 * @param parentPath path to properly identify elements in ignore, replace 
	 * 	      and nodes arrays
	 * @param depth current element's depth 
	 * @return XML string
	 */
	var convertToXml = function(json, tagName, parentPath, depth,firstName) {
		var suffix = (settings.formatOutput) ? '\r\n' : '';
		var indent = (settings.formatOutput) ? getIndent(depth) : '';
		var xmlTag = indent + '<' + tagName;
		var children = '';
		
		for (var key in json) {
			if (json.hasOwnProperty(key)) {
				var propertyPath = parentPath + key;
				var propertyName = getPropertyName(parentPath, key);				
				// element not in ignore array, process
				if ($.inArray(propertyPath, settings.ignore) == -1) {
					// array, create new child element
					if ($.isArray(json[key])) {
						children += createNodeFromArray(json[key], propertyName, 
								propertyPath + '.', depth + 1, suffix);
					}
					// object, new child element aswell
					else if (typeof(json[key]) === 'object') {
						//children += convertToXml(json[key], propertyName, 
						//		propertyPath + '.', depth + 1);
						//改造第一层子节点 2020.07.13 YuanJie SHI
						children += convertToXml(json[key], firstName, 
								propertyPath + '.', depth + 1);
			
					}
					// primitive value property as attribute
					else {
						// unless it's explicitly defined it should be node
						if ( propertyName.indexOf('@')==-1) {
							children += createTextNode(propertyName, json[key], 
									depth, suffix);
						}
						else {
							propertyName = propertyName.replace('@','');
							xmlTag += ' ' + propertyName + '="' +  json[key] + '"';
						}
					}
				}
			}
		}

		// close tag properly
		if (children !== '') {
			xmlTag += '>' + suffix + children + indent + '</' + tagName + '>' + suffix;
		}
		else {
			xmlTag += '/>' + suffix;
		}		

		return xmlTag;		
	};
	
	
	/**
	 * Creates indent string for provided depth value. See settings for details.
	 * 
	 * @param depth
	 * @return indent string 
	 */
	var getIndent = function(depth) {
		var output = '';
		for (var i = 0; i < depth; i++) {
			output += settings.indentString;
		}
		return output;	
	};
	
	
	/**
	 * Checks settings.replace array for provided name, if it exists returns
	 * replacement name. Else, original name is returned.
	 * 
	 * @param parentPath path to this element's parent
	 * @param name name of element to look up
	 * @return element's final name
	 */
	var getPropertyName = function(parentPath, name) {
		var index = settings.replace.length;
		var searchName = parentPath + name;
		while (index--) {
			// settings.replace array consists of {original : replacement} 
			// objects 
			if (settings.replace[index].hasOwnProperty(searchName)) {
				return settings.replace[index][searchName];
			}
		}
		return name;
	};
	
	/**
	 * Creates XML node from javascript array object.
	 * 
	 * @param source 
	 * @param name XML element name
	 * @param path parent element path string
	 * @param depth
	 * @param suffix node suffix (whether to format output or not)
	 * @return XML tag string for provided array
	 */
	var createNodeFromArray = function(source, name, path, depth, suffix) {
		var xmlNode = '';
		if (source.length > 0) {
			for (var index in source) {
				// array's element isn't object - it's primitive value, which
				// means array might need to be converted to text nodes
	            if (typeof(source[index]) !== 'object') {
	            	// empty strings will be converted to empty nodes
	                if (source[index] === "") {
	                	xmlNode += getIndent(depth) + '<' + name + '/>' + suffix;                    
	                }
	                else {
	            		var textPrefix = (settings.formatTextNodes) 
                    ? suffix + getIndent(depth + 1) : '';
        				var textSuffix = (settings.formatTextNodes)
        					? suffix + getIndent(depth) : '';	        				
	                	xmlNode += getIndent(depth) + '<' + name + '>' 
	                			+ textPrefix + source[index] + textSuffix 
	                			+ '</' + name + '>' + suffix;                                              
	                }
	            }
	            // else regular conversion applies
	            else {
	            	xmlNode += convertToXml(source[index], name, path, depth);
	            }					
			}
		}
		// array is empty, also creating empty XML node		
		else {
			xmlNode += getIndent(depth) + '<' + name + '/>' + suffix;
		}
		return xmlNode;
	};	
	
	/**
	 * Creates node containing text only.
	 * 
	 * @param name node's name
	 * @param text node text string
	 * @param parentDepth this node's parent element depth
	 * @param suffix node suffix (whether to format output or not)
	 * @return XML tag string
	 */
	var createTextNode = function(name, text, parentDepth, suffix) {
		// console.log("createTextNode:"+name+','+ text+','+parentDepth+','+suffix);
		// unformatted text node: <node>value</node>
		// formatting includes value indentation and new lines
		var textPrefix = (settings.formatTextNodes) 
			? suffix + getIndent(parentDepth + 2) : ''; 
		var textSuffix = (settings.formatTextNodes)
			? suffix + getIndent(parentDepth + 1) : '';
			//改造数据内容防错优化<![CDATA[ 数值 ]]> 2020.07.13 YuanJie SHI
		var xmlNode = getIndent(parentDepth + 1) + '<' + name + '>'
					+'<![CDATA['+ textPrefix + text + textSuffix +']]>'
					+ '</' + name + '>' + suffix;					
		return xmlNode;
	};

	/**
	 * string类型转换成XML类型数据.
	 * @author YuanJie SHI, www.jiwanginfo.com
	 * @time 2020年7月13日
	 * 
	 * @param xmlDocStr node's name
	 * @return XML 
	 */
	var parseXmlString = function(xmlDocStr) {
		var isIEParser = window.ActiveXObject || "ActiveXObject" in window;
		if (xmlDocStr === undefined) {
			return null;
		}
		var xmlDoc;
		if (window.DOMParser) {
			var parser=new window.DOMParser();			
			var parsererrorNS = null;
			// IE9+ now is here
			if(!isIEParser) {
				try {
					parsererrorNS = parser.parseFromString("INVALID", "text/xml").getElementsByTagName("parsererror")[0].namespaceURI;
				}
				catch(err) {					
					parsererrorNS = null;
				}
			}
			try {
				xmlDoc = parser.parseFromString( xmlDocStr, "text/xml" );
				if( parsererrorNS!= null && xmlDoc.getElementsByTagNameNS(parsererrorNS, "parsererror").length > 0) {
					//throw new Error('Error parsing XML: '+xmlDocStr);
					xmlDoc = null;
				}
			}
			catch(err) {
				xmlDoc = null;
			}
		}
		else {
			// IE :(
			if(xmlDocStr.indexOf("<?")==0) {
				xmlDocStr = xmlDocStr.substr( xmlDocStr.indexOf("?>") + 2 );
			}
			xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async="false";
			xmlDoc.loadXML(xmlDocStr);
		}
		return xmlDoc;
	};
})(jQuery);