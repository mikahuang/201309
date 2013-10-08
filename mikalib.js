(function(window, undefined) {
    var
    document = window.document,
    old_$ = window.$,
    old_mika = window.mika,
    mika = window.mika = window.$ = function(selector, context) {
        return new mika.instance(selector, context);
    },

    //ECMA核心方法引用
    __toString = Object.prototype.toString,
    __hasOwnProperty = Object.prototype.hasOwnProperty,
    __push = Array.prototype.push,
    __slice = Array.prototype.slice,
    __concat = Array.prototype.concat,

    //DOM选择元素方法ID,TAGNAME.CLASSNAME
    __id = function(id){
        return document.getElementById(id);
    },
    __tagName = function(tagname, context) {
        return (context || document).getElementsByTagName(tagname);
    },
    __className = function(classname, context) {
	    if(context.getElementsByClassName){
		 return context.getElementsByClassName(classname); 
		} 
        var result = [],
        nodes = __tagName("*", context);
        for (var i = 0,
        len = nodes.length; i < len; i++) {
            if ((' ' + nodes[i].className + ' ').indexOf(' ' + classname + ' ') !== -1) {
			result.push(nodes[i]);
			}
        }
        return result;
    };



    //each方法,代替for/for in,遍历对象或数组
    mika.each = function(obj, fn, args) {
        var key,i,len;
        if (obj.length === undefined) {
            for (key in obj) {
                if (__hasOwnProperty.call(obj, key)) {
                    fn.apply(obj[key], args || [key, obj[key]]);
                }
            }
        }
        else {
            for (i = 0,len = obj.length; i < len; i++) {
                fn.apply(obj[i], args || [i, obj[i]]);
            }
        }
        return obj;
    };

    /*
    对象扩展方法，支持深拷贝
    调用方法：
    mika.extend(true,target,source1,source1,....) 深拷贝，绑定到target对象上
    mika.extend(target,source1,source1,....)   绑定到target对象上
    mika.extend(source1) 只传一个参数绑定到mika对象上
    返回值target
    */
    mika.extend = function() {
        var deep = false,
        target, source, starti = 0,
        len = arguments.length;
        if (typeof arguments[0] === "boolean") {
            deep = arguments[0];
            if (len === 2) {
                target = this;
                starti = 1;
            } else {
                target = arguments[1];
                starti = 2;
            }
        }
        else {
            if (len === 1) {
                target = this;
                starti = 0;
            } else {
                target = arguments[0];
                starti = 1;
            }
        }

        for (; starti < len; starti++) {
            source = arguments[starti];

            for (var key in source) {
                if (!source.hasOwnProperty(key)) continue;
                if (!deep) {
                    target[key] = source[key];
                }
                else {
                    if (typeof source[key] === "object") {
                        target[key] = (source[key].constructor === Array) ? [] : {};
                        this.extend(target[key], source[key], true);
                    }
                    else {
                        //此处直接覆盖拷贝，没有判断目的对象是否存在此属性
                        target[key] = source[key];
                    }
                }
            }

        }

        return target;
    };
    
    
	
	mika.extend({
	mikaVer:"0.1",
	string:{},
	browser:{},
	className:{},
	event:{},
	ajax:{}
	});

	
	
    //*******************************************************
    //判断浏览器类型及其版本号
    //*******************************************************
    var
    ua = navigator.userAgent.toLowerCase(),
	browserMatch = ua.match(/(opera|msie|firefox|chrome|safari)[\s\/\:]([\d\.]+)/) || [null, 'unknown', 0];
    mika.browser.type = browserMatch[1];
    mika.browser[browserMatch[1]] = true;
    mika.browser.version = browserMatch[2];
    if (mika.browser.safari) {
        mika.browser.version = /(version)[\/]([\d.]+)/.exec(ua);
    }
	
	
    

    //*******************************************************
    //数据类型检测判断
    //*******************************************************
	
	/*
	
	目前已完成的方法：
	
	mika.isFunction,mika.isArray,mika.isString,mika.isNumeric,
	mika.isBoolean,mika.isDate,mika.isArguments,mika.isRegExp,
	mika.isElement,mika.isDocument,mika.isNull,mika.isUndefined,
	mika.isObject,mika.isNumberNaN,mika.isNotEmptyString,
	mika.isEmptyObject,mika.isWindow.mika.getType
	
	
	
	*/

    //判断数据类型的方法，利用Object.prototype.toString
    mika.each(["Function", "Array", "String", "Numeric", "Boolean", "Date", "Arguments", "RegExp"],
    function(key, value) {
        var value2 = value;
        if ("Numeric" === value) {
            value2 = "Number";
        }
        mika["is" + value] = function(obj) {
            return __toString.call(obj) === "[object " + value2 + "]";
        };
    }
    );

    mika.extend({
    	
    	//检测对象是否为DOM元素
        isElement: function(obj) {
            return !! (obj && obj.nodeType === 1)
        },
        
        isDocument: function(obj) {
            return !! (obj && obj.nodeType === 9)
        },
        
        isNull: function(obj) {
            return obj === null
        },
        
        isUndefined: function(obj) {
            return obj === void(0)
        },
        
        isObject: function(obj) {
            if (mika.isNull(obj)) return !! 1;
            return obj === Object(obj);
        },
        
        //检测一个数字是否为NaN数字
        isNumberNaN: function(obj) {
            return isNumber(obj) && obj !== +obj;
        },
        
        isNotEmptyString: function(obj) {
            return mika.isString(obj) && obj.length!==0 ? true:false;
        },
        
        
        //检测一个对象是否为空对象，包括从prototype原型上继承过来的属性
        isEmptyObject: function(obj) {
            for (var name in obj) {
                return false;
            }
            return true;
        },
        
        //检测是否为window全局对象，属性含有window的对象即为window
        isWindow: function(obj) {
            return !! obj && obj == obj.window;
        },

        //返回变量数据类型，typeof无法检测出new出来的对象类型，如new String(),new Array(),以上返回object
        type: function(obj) {
            if (mika.isNull(obj)) return "Null";
            else if (mika.isUndefined(obj)) return "Undefined";
            else return __toString.call(obj).slice(8, -1);
        }
       
        //end
    });
    mika.extend({
        getType: mika.type
    });
    
    
    

    //*******************************************************
    //数组对象操作
    //*******************************************************
    mika.extend({
        forEach: mika.each,

        //类数组对象转化为真正的数组对象，也可以用[].silce(obj)
        makeArray: function(obj) {
            var result = [];
            if (mika.isArrayLike(obj)) {
                var len = obj.length;
                while (len--) {
                    result[len] = obj[len];
                }
                //mika.each(obj,function(key,value){result.push(value);});
            }
            return result;
        },

        //合并后一个数组到前一个数组中，支持类数组
        merge: function(one, two) {
            if (mika.isArrayLike(one) && mika.isArrayLike(two)) {
                var ol = one.length,
                tl = two.length;
                for (var i = 0; i < tl; i++) {
                    one[ol++] = two[i];
                }
            }
            one.length = ol;
            return one;
        },

        //检测对象是否是类数组对象
        isArrayLike: function(obj) {
            if (mika.isArray(obj)||obj.length && (obj.length - 1) in obj) {
                return true;
            }
            return false;
        },

        //检测一个值是否在给定的数组中，存在返回index位置，不存在返回-1
        inArray: function(elem, arr, fromi) {
            if (!arr.length) {
                return - 1;
            }
            var len = arr.length;
            fromi = fromi ? (fromi < 0 ? (Math.max(0, len + indexi)) : fromi) : 0;
            for (; fromi < len; fromi++) {
                if (fromi in arr && arr[fromi] === elem) {
                    return fromi;
                }
            }
            return - 1;
        },

        //JSON字符串解析成对象直接量(JSON对象)
        parseJSON: function(jsonstr) {
            if (window.JSON && window.JSON.parse) {
                return window.JSON.parse(jsonstr);
            }
            if ( !! jsonstr && mika.isString(jsonstr)) {
                return (new Function("return " + jsonstr))();
            }
            else {
                return {};
            }
        },

        //ECMA对象转化为JSON格式的字符串,序列化JSON数据
        stringifyJSON: function(obj) {
            if (window.JSON && window.JSON.stringify) {
                return window.JSON.stringify(obj);
            }
            var key, i, arr = [];
            if (obj === undefined) return "undefined";
            if (obj === null) return "null";
            switch (obj.constructor) {
            case String:
                return '"' + obj.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/"/g, '\\"').replace(/\t/g, '\\t') + '"';
            case Number:
            case Boolean:
                return obj;
            case Date:
                return 'new Date(' + obj.getTime() + ')';
            case Array:
                for (i = 0; i < obj.length; i++) {
                    arr.push(String(arguments.callee(obj[i])).replace(/\r\n|\n/g, "\r\n"));
                }
                return '[' + arr.join(',') + ']';
            case Function:
                return String(obj).replace(/\r\n|\n/g, "\r\n").replace(/(\{\s*)(\[native code\])(\s*\})/, '$1"$2"$3');
            case RegExp:
                return String(obj);
            }

            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    arr.push('"' + key + '":' + arguments.callee(obj[key]));
                }
            }
            return '{' + arr.join(',') + '}';

        }

    });

    //*******************************************************
    //函数操作
    //*******************************************************
    mika.extend({
        //设置this指向，保持在特定上下文中运行代码
        proxy: function(fn, context) {
            if (context && mika.isString(context) && mika.isFunction(fn[context])) {
                var tempfn = fn[context];
                context = fn;
                fn = tempfn;
            }
            else {
                if (!mika.isFunction(fn)) {
                    return undefined;
                }
            }

            var args = __slice.call(arguments, 2);
            return function() {
                fn.apply(context, args.concat(__slice.call(arguments)));
            };
        }

    });
    




    //*******************************************************
    //字符串操作
    //*******************************************************
    mika.extend(mika.string,{

        //去除两边空白或特定字符
        trim: function(str, flagstr) {
            if (!flagstr) {
                return str.replace(/^\s+|\s+$/g, "");
            }
            else {
                return str.replace(new RegExp("^" + flagstr + "|" + flagstr + "$", "g"), "");
            }
        },

        //去除左边空白或特定字符
        lTrim: function(str, flagstr) {
            if (!flagstr) {
                return str.replace(/^\s+/g, "");
            }
            else {
                return str.replace(new RegExp("^" + flagstr, "g"), "");
            }
        },

        //去除右边空白或特定字符
        rTrim: function(str, flagstr) {
            if (!flagstr) {
                return str.replace(/^\s+$/g, "");
            }
            else {
                return str.replace(new RegExp(flagstr + "$", "g"), "");
            }
        }

    });

    //避免变量($,mika)使用冲突
    mika.extend({
        noConflict: function(deep) {
            window.$ = old_$;
			if(deep) window.mika=old_mika;
            return mika;
        }

    });
    
    
    
    
    
    
    
    
    //mika原型对象上的属性方法，mika.prototype = mika.fn
    mika.fn = {
        length: 0,
        size: function() {
            return this.length;
        },
        push: Array.prototype.push,
        slice: Array.prototype.slice,
        sort: Array.prototype.sort,
        extend: mika.extend,
        each: function(fn, args) {
            return mika.each(this, fn, args);
        }
    };

    
    
    
    
    //*******************************************************
    //文档操作
    //*******************************************************
    
    mika.extend({
    	nodeName:function(elem,str){
        	return elem&&elem.nodeName.toUpperCase()===str.toUpperCase();
        },
    	fixToDomArr:function(args,context){
    		
    		context=context || document;
    		var result=[];
    		
    		mika.each(args,function(index,elem){

    			if(mika.isNumeric(elem)) elem+='';
    			
    			if(mika.isString(elem)){
    				
    				elem=elem.replace(/(<(\w+)[^>]*?)\/>/,function($0,$1,$2){
    					
    					return $2.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i) ? $0 : $1 +"></"+$2+"/>";
    				});
    				
    				var tags=elem.replace(/^\s+/,"").toLowerCase();
    				
    				var div=context.createElement("div");
    				
    				var warp=!tags.indexOf("<opt") &&[ 1, "<select multiple='multiple'>", "</select>" ] ||
				    !tags.indexOf("<leg") &&[ 1, "<fieldset>", "</fieldset>" ] ||
					tags.match(/^<(thead|tbody|tfoot|colg|cap)/) &&[ 1, "<table>", "</table>" ] ||
					!tags.indexOf("<tr") &&[ 2, "<table><tbody>", "</tbody></table>" ] ||
					(!tags.indexOf("<td") || !tags.indexOf("<th")) &&[ 3, "<table><tbody><tr>", "</tr></tbody></table>" ] ||
					!tags.indexOf("<col") &&[ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ] ||
					mika.browser.msie &&[ 1, "div<div>", "</div>" ] || 
					[ 0, "", "" ];
					
					div.innerHTML=warp[1]+elem+warp[2];
					
					while(warp[0]--){
						div=div.lastChild;
						}

					elem = mika.makeArray(div.childNodes);
					
					}
					
			if ( elem.length === 0 && (!mika.nodeName( elem, "form" ) && !mika.nodeName( elem, "select" )) )
				return;
				
			if (elem.nodeName)
				result.push( elem );
			else			
				result = mika.merge( result, elem );
	
    		});
    		
    		
    		return result;
    		
    		
    		
    	}
    	
    	
    	
    	
    	
    	
    	
    	
    });
    
    
    
    
    
    
    
    
    mika.fn.extend({
    	
    	insertDom:function(args,istable,dir,callback){
    		
    		var isclone=this.length>1,fixelems = mika.fixToDomArr(args);
    		
    		if(dir<0) fixelems=fixelems.reverse();

    		return this.each(function(index,midom){
    			
    	    if(istable){
			if(mika.nodeName(midom,"table")&&mika.nodeName(fixelems[0],"tr"))
			 midom = midom.getElementsByTagName("tbody")[0] || midom.appendChild(document.createElement("tbody"));
			}
    			
    		mika.each(fixelems,function(index,fixelem){
    			callback.apply(midom,[isclone ? fixelem.cloneNode(true):fixelem]);
    		}
    		);
    			
    			
    			
    			
    			
    			
    			

    		});
    		
    	
    		
    		
    	},

        //向匹配元素内部末尾追加内容
        append: function() {
           return this.insertDom(arguments,true,1,function(elem){
			 this.appendChild(elem);
		   });

        },
		appendTo: function() {
		    var args=arguments;
		    return this.each(function(){
			var fixthis=this;
			mika.each(args,function(){mika(this).append(fixthis);});
			});
		

        },

        //在匹配元素内部开头前置内容
        prepend: function() {
           return this.insertDom(arguments,true,-1,function(elem){
		     this.insertBefore(elem,this.firstChild);
			
		   });
        },
		
		 //在匹配元素之前插入内容
        before: function() {
		
		 return this.insertDom(arguments,false,1,function(elem){
		    this.parentNode.insertBefore(elem,this);
		   });
        	
        },
        
		//在匹配元素之后插入内容
        after: function() {
		
		 return this.insertDom(arguments,false,-1,function(elem){
		    this.parentNode.insertBefore(elem,this.nextSibling);
		   });
        	
        },
        
        //删除匹配元素的所有子节点
        empty: function() {
            var node;
            return this.each(function() {
                while (this.firstChild) {
                    this.removeChild(this.firstChild);
                }
            });
        },


        //删除匹配元素的所有内容
        remove: function() {
            return this.each(function() {
                this.parentNode && this.parentNode.removeChild(this);
            });
        },
        
        //获取或设置匹配元素的html内容
        html: function(value) {
            if (value===undefined) {
                return (this[0] && this[0].innerHTML) || null;
            }
            else {
               return  this.empty().append(value);
            }
        },

        //获取或设置匹配元素的text内容
        text: function() {
        	
        },
        
        //获取或设置匹配元素的value内容
        val: function(value) {
		
		 if (value===undefined) {
                return (this[0] && this[0].value) || null;
            }
            else {
               return  this.each(function(){this.value=value;});
            }
        	
        }

    });
    
    
    //*******************************************************
    //元素属性操作
    //*******************************************************
    mika.extend({
	
	//dom元素属性设置，获取
    attr:function(elem,key,value){
    	if(!(elem&&(elem.nodeType===1 || elem.nodeType===9)) || !mika.isNotEmptyString(key)){
    		return undefined;
    		}
    
        var fixedattr={
			"for": "htmlFor",
			"class": "className",
			"classname": "className",
			"innerhtml": "innerHTML",
			"style": "cssText",
			"readonly": "readOnly",
			"maxlength": "maxLength",
			"cellspacing": "cellSpacing",
			"cellpadding": "cellPadding",
			"rowspan": "rowSpan",
			"colspan": "colSpan"
        };
    
        var key2=key.toLowerCase();
        if(fixedattr[key2]){ 	
        	if(key2==="style") elem=elem.style;
        	if(value!==undefined) {
        		elem[fixedattr[key2]]=value;
        		return undefined;
        		}
        	else{
        	    return elem[fixedattr[key2]] || null;
        	    }
            }

        if(value!==undefined){
    	 	if(elem.setAttribute){
    	 		elem.setAttribute(key,value);
    	 	}
    	 	else{
    	 		elem[key]=value;
    	 	}
    	 	return undefined;
    	 } 
    	 else{
    	      return  elem[key] || elem.getAttribute(key) || null;
    	     }
    },
	//dom元素CSS设置，获取
    css:function(elem,key,value){
    	if(!(elem&&elem.nodeType===1) || !mika.isNotEmptyString(key)){
    		return undefined;
    		}	
    
    	key=key.replace(/-([a-z])/ig,function($0,$1){return $1.toUpperCase();});
    
    	if(key==="float"){
    		key=="cssFloat";	
    		if(elem.style.cssFloat===undefined) key="styleFloat";
    	}
    	if(value!==undefined) {
    		value=value.toString().replace("px","");
    		
        	if(/(width|height|padding|left|right|bottom|top|margin)/.test(key)){
        		if(/(width|height|padding)/.test(key)) 
        		value = Math.max(Number(value), 0) || 0;
        		elem.style[key]=value + 'px';
        	}
        	else if(/(alpha|opacity)/.test(key)){
        		value = Number(value) || 100;
            	elem.fixOpacity = value;
            	elem.style.opacity = value / 100;
        		elem.style.filter = "alpha(opacity:" + value + ")";
        	
        	}
        	else{
        		elem.style[key]=value;
        	}	
    		return undefined;
    	}
    	else{
    		if(/(alpha|opacity)/.test(key)){
            	if (elem.fixOpacity === undefined) elem.fixOpacity = parseInt(100 * parseFloat(elem.currentStyle ? elem.currentStyle.opacity: window.getComputedStyle(elem, false).opacity));
            	return elem.fixOpacity;
         	 } 
    		else {
            	return elem.currentStyle ? elem.currentStyle[key] : window.getComputedStyle(elem, false)[key];
         	 }
    	}
    
    	
    }	
    });
	
	
	//*******************************************************
    //元素样式操作
    //*******************************************************
	
	
	
	//DOM元素上的CLASSNAME处理
	mika.extend(mika.className,{
	    	add:function(elem,strclass){
    		if(mika.isElement(elem)&&mika.isNotEmptyString(strclass)){
    			if(!mika.className.has(elem,strclass)){
    				elem.className += (elem.className ?" ":"")  + strclass;
    				}
    		}
    		return elem;
    	},
    	remove:function(elem,strclass){
    		if(mika.isElement(elem)&&mika.isNotEmptyString(strclass)){
    			if(mika.className.has(elem,strclass)){
    				elem.className=elem.className.replace(strclass,"");
    				}
    		}
    		return elem;
    	},
    	has:function(elem,strclass){
    		if(!mika.isElement(elem)||!mika.isNotEmptyString(strclass)){return false;}
    		var reg = new RegExp(' '+strclass+' ');
    		return reg.test(' '+elem.className+' ') ? true : false;
    	}
	
	});
	
      
    
    
    mika.fn.extend({
    	attr:function(key,value){
    		if(value===undefined){
    			if(key.constructor != String){
    				for(var item in key){
    					if(key.hasOwnProperty(item)){
    					this.each(function(){
    						mika.attr(this,item,key[item]);
    					});
    					}
    				}
    				return this;
    			}
    			else{
    				return mika.attr(this[0],key);
    			}
    			
    		}
    		else{
    			if(mika.isNotEmptyString(key)){
    				this.each(function(){
    					mika.attr(this,key,value);
    				});
    			}
    	        
    	        return this;
    			
    			
    		}
    		
    		
    		
    		
    		
    	},
    	removeAttr:function(name){
           return this.each(function(){
           		mika.attr(this,name,"");
    			if(this.removeAttribute){
    				this.removeAttribute(name);
    			} 
           });
	
    	},
    	css:function(key,value){
    		if(value===undefined){
    			if(key.constructor != String){
    				for(var item in key){
    					if(key.hasOwnProperty(item)){
    					this.each(function(){
    						mika.css(this,item,key[item]);
    					});
    					}
    				}
    				return this;
    			}
    			else{
    				return mika.css(this[0],key);
    			}
    			
    		}
    		else{
    			if(mika.isNotEmptyString(key)){
    			 	this.each(function(){
    					mika.css(this,key,value);
    				});
    			}
    	        return this;
    		}
    		
    		
    	},
    	addClass:function(){
    		return this.each(function(classname){
    			mika.className.add(this,classname);
    		},arguments);
    		
    	},
    	removeClass:function(){
    		return this.each(function(classname){
    			mika.className.remove(this,classname);
    		},arguments);
    		
    	},
    	width:function(val){
    		return val===undefined ? window.parseInt(this.css("width"),10) :  this.css("width",val);
    	},
    	height:function(val){
    		return val===undefined ? window.parseInt(this.css("height"),10) :  this.css("height",val);
    	}
    	
    	
    	
    	
    });
    
    
    
    
    //*******************************************************
    //事件操作,参考DE大神的addEvent，John Resig的jquery lib
    //*******************************************************
	
	/*
	
	目前已实现的方法:
	bind,unbind,one,trigger
	mika("#div1").bind("click",function(){});
	mika("#div1").unbind("click",function(){});
	mika("#div1").one("click",function(){});
	mika("#div1").trigger("click");
	bind的快捷方式：
	blur,focus,load,resize,scroll,unload,click,dblclick,mousedown,mouseup,
	mousemove,mouseover,mouseout,change,reset,select,submit,keydown,keypress,keyup,error
	mika("#div1").click(function(){});
	mika("#div1").click();
	
	event对象修正:
	event.target,event.preventDefault,event.stopPropagation,event.pageX,event.pageY
	
	
	*/
	
	mika.extend(mika.event,{
	addEventListener:document.addEventListener ? function(elem,type,handle){elem.addEventListener(type,handle,false);}:function(elem,type,handle){elem.attachEvent('on'+type,handle);},
	removeEventListener:document.removeEventListener ? function(elem,type,handle){elem.removeEventListener(type,handle,false);}:function(elem,type,handle){elem.detachEvent('on'+type,handle);},
	guid:1,
	global:{},
	//修正event对象，主要是ie的window.event对象
	fix:function(event){
   
	if(!event.target)
	 event.target=event.srcElement || document;
	 
	if (event.target.nodeType == 3)
	 event.target = event.target.parentNode;
	 
	if(!event.preventDefault)
	 event.preventDefault=function(){event.returnValue=false;};
	 
	if(!event.stopPropagation)
	 event.stopPropagation=function(){event.cancelBubble=true;};
	 
	//为IE event对象添加pageX，pageY
	if ( event.pageX == null && event.clientX != null ) {
			var doc = document.documentElement, body = document.body;
			event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);
			event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
    }
	 
	

     return event;
	 },
	 //绑定事件核心方法
	 bind:function(elem,type,handler){
	 
	 if(!elem.events) elem.events={};
	 var handlers=elem.events[type];
	 if(!handlers) {
	 handlers=elem.events[type]={};
	 if(elem["on"+type]){
	 var oldfn=elem["on"+type];
	 handlers[0]=oldfn;
	 oldfn.guid=0;
	 }
	 }
	 if(!handler.guid){handler.guid=this.guid++}
	 
	 handlers[handler.guid]=handler;
	 
	 elem["on"+type]= function(event){
	 
	 event=mika.event.fix(event|| window.event);
	 var listfns=this.events[event.type];
	 
	 for(var index in listfns ){
	 if(listfns[index].call(this,event)===false){
	 event.preventDefalut();
	 event.stopPropagation();
	 return false;
	 }
	 }
	 
	 return true;
	 
	 };
	 
	 //提供trigger使用
	 if(!this.global[type]) this.global[type]=[];
	 this.global[type].push(elem);
	 
	 },
	 
	 //移除事件
	 unbind:function(elem,type,handler){
	 if(handler){
	 delete elem.events[type][handler.guid];
	 }
     else{
	 if(type){
	 delete elem.events[type];
	 }
	 else{
	 for(var te in elem.events){
	 this.unbind(elem,te);
	 }
	 }
	 
	 
	 }
	 
	 },
	 //触发特定事件
	 trigger:function(type,data,elem){
	 data=data||[];
	 if(!elem){
	 
	 var arrelem=this.global[type];
	 if(arrelem){
	 for(var index=0,len=arrelem.length;index<len;index++){
	 this.trigger(type,data,arrelem[index]);
	 }
	 
	 }
	 }
	 
	 else if(elem["on"+type]){
	 data.unshift( this.fix({ type: type, target: elem}) );
	 elem["on"+type].apply(elem,data);
	 }
	 
	 },
	 //只运行一次的事件
	 one:function(elem,type,handler){
	 
	 var fixedhandler=function(event){
	 mika.event.unbind(elem,type,arguments.callee);
	 handler.call(elem,event);
	 }
	 this.bind(elem,type,fixedhandler);
	 },
	 
	 //DOMContentLoaded时执行的function
	onDomReady:function(callback){
	 
	 
	mika.isready = false; 
    mika.readylist=mika.readylist||[];
    
    if(!mika.isready){
	mika.readylist.push(callback);
	}
    else{
	callback();
	}	



 	 
	 function doReady(){
	 if(mika.isready ) return;    
	 mika.isready = true;
	 for(var i=0,len=mika.readylist.length;i<len;i++){
	 mika.readylist[0]();
	 mika.readylist.shift();
	 }
	 }     
	 


	 
	 if(document.addEventListener){
	 document.addEventListener("DOMContentLoaded",function(){
	 document.removeEventListener("DOMContentLoaded",arguments.callee,false);
	 doReady();
	 },false);
	 
	 }
	 else if(document.attachEvent){
	 document.attachEvent("onreadystatechange",function(){
	 if(document.readyState==="complete"){
	 document.detachEvent("onreadystatechange",arguments.callee);
	 doReady();
	 }
	 });
	 
	 if(document.documentElement.doScroll && window==window.top){
	 (function(){
	 try{document.documentElement.doScroll("left");}
	 catch(e){
	 setTimeout(arguments.callee,0);
	 return;
	 }
	 doReady();
	 })();
	 }
	 }
	 mika.event.bind(window,"load",doReady);
	 
	 }

	});
	
	 //将事件处理函数绑定到mika的实例对象上
	 mika.fn.extend({
	 bind:function(type,handler){
	 return this.each(function(){mika.event.bind(this,type,handler)});
	 },
	 unbind:function(type,handler){
	 return this.each(function(){mika.event.unbind(this,type,handler)});
	 },
	 one:function(type,handler){
	  return this.each(function(){mika.event.one(this,type,handler)});
	 },
	 trigger:function(type,data){
	  return this.each(function(){mika.event.trigger(type,data,this)});
	 }
	 });
	 
	 
	 
	 
	 //fn.bind的快捷方式
	 mika.each("blur,focus,load,resize,scroll,unload,click,dblclick,mousedown,mouseup,mousemove,mouseover,mouseout,change,reset,select,submit,keydown,keypress,keyup,error".split(','),function(index,evtype){
	 mika.fn[evtype]=function(fn){
	 fn?this.bind(evtype,fn):this.trigger(evtype);
	 };
	 //mika.fn["un"+evtype]=function(fn){this.unbind(evtype,fn)};
	 });
	 

	 
	 
    //ajax处理
	/*
	目前已实现
	mika.ajax.ajax({});
	mika.ajax.loadJS(url,scriptCharset,callback);
	mika.ajax.get(url,data,callback,dataType)
	mika.ajax.post(url,data,callback,dataType)
	mika.ajax.getJSON(url,data,callback)
	mika.ajax.getScript(url,data,callback)
	mika.ajax.getSJONP(url,jsonp,callback)
	
	*/
	mika.extend(mika.ajax,{
	guid:1,
	loadJS:function(url,scriptCharset,callback){
	if(mika.isFunction(scriptCharset)){
	callback=scriptCharset;
	scriptCharset=null;
	}
	var script = document.createElement("script");
	script.src=url;
	script.type="text/javascript";
	script.async = "async";
	if(scriptCharset) script.charset = scriptCharset;
	script.onload=script.onreadystatechange=function(){
	if(!this.readyState || this.readyState=='loaded' || this.readyState=='complete'){
	callback&&callback();
	script.onload = script.onreadystatechange = null;
	script.parentNode.removeChild(script);
	}
	
	};
	var head=document.getElementsByTagName("head")[0];
	head.appendChild(script);
	return undefined;
	},
	loadCSS:function(url,cssCharset,callback){
	if(mika.isFunction(cssCharset)){
	callback=cssCharset;
	cssCharset=null;
	}
	var css = document.createElement("link");
	css.href=url;
	css.type = "text/css";  
    css.rel = "stylesheet"  
	if(cssCharset)css.charset = cssCharset;
	css.onload=css.onreadystatechange=function(){
	if(!this.readyState || this.readyState=='loaded' || this.readyState=='complete'){
	callback&&callback();
	css.onload = css.onreadystatechange = null;
	css.parentNode.removeChild(css);
	}
	
	};
	var head=document.getElementsByTagName("head")[0];
	head.appendChild(css);
	return undefined;
	},
	get:function(url,data,callback,dataType){
	
	if(mika.isFunction(data)){
    callback=data;
	data=null;
	}
    
	return this.ajax({
	method:"GET",
	url:url,
	data:data||null,
	success:callback||null,
	dataType:dataType||"HTML"
	});
	
	},
	post:function(url,data,callback,dataType){
	
	if(mika.isFunction(data)){
    callback=data;
	data=null;
	}

	return this.ajax({
	method:"POST",
	url:url,
	data:data||null,
	success:callback||null,
	dataType:dataType||"HTML"
	});
	
	},
	getJSON:function(url,data,callback){

    return this.get(url,data,callback,"JSON");

	},
	getScript:function(url,data,callback){

    return this.get(url,data,callback,"SCRIPT");

	},
	getJSONP:function(url,jsonp,callback){

    return this.ajax({
	method:"GET",
	url:url,
	jsonp:jsonp,
	success:callback,
	dataType:"JSONP"
	});
	},
	ajax:function(configer){
	
	configer=mika.extend({
	method:"GET",
	url:"/",
	data:null,
	async:true,
	username:null,
	password:null,
	cache:false,
	success:function(){},
	dataType:"HTML",
	scriptCharset:null,
	jsonp:"jsonpcallback"
	},configer);
	configer.method=configer.method.toUpperCase();
	configer.dataType=configer.dataType.toUpperCase();
	
	
	
	function json2url(data){
	if(data){
	var result=[];
	for (var key in data){
	result.push(key+"="+window.encodeURIComponent(data[key]));
	}
	data=result.join('&');
	}
	return data;
	}
	
	function createxmlhttprequest(){
	return window.XMLHttpRequest? new window.XMLHttpRequest() : new window.ActiveXObject("Microsoft.XMLHTTP");
	}
	

	if(configer.data){
	configer.data=json2url(configer.data);
	}

	if(/\?/.test(configer.url)){
	configer.data=mika.string.trim(configer.url.substr(configer.url.indexOf('?')+1),'&')+"&"+configer.data;
	configer.url=configer.url.substr(0,configer.url.indexOf('?'));	
	}
	
	
	if(configer.method==="GET"){
	if(configer.data)configer.url+="?"+configer.data;
	if(!configer.cache){
	if(configer.url.indexOf("?")>-1){
	configer.url+="&t="+(new Date()).getTime();
	}
	else{
	configer.url+="?t="+(new Date()).getTime();
	}
	}
	configer.data=null;
	}
	
	
	if(configer.method==="GET"&&configer.dataType==="SCRIPT"){
	//js跨域获取,内部使用SCRIPT标签
	return this.loadJS(configer.url,configer.scriptCharset,configer.success);
	}
	
	
	if(configer.method==="GET"&&configer.dataType==="JSONP"){
	
	var jsonpcallback="jsonp"+this.guid++;
	//JSONP方法
	window[jsonpcallback]=function(data){
	configer.success&&configer.success(data);
	window[jsonpcallback]=undefined;
	try{ delete window[jsonpcallback]; } catch(e){}
	}
	
	if(/\?/.test(configer.url)){
	configer.url+="&"+configer.jsonp+"="+jsonpcallback;
	}
	else{
	configer.url+="?"+configer.jsonp+"="+jsonpcallback;
	}
	
	return this.loadJS(configer.url,configer.scriptCharset);
	}
	
	
	
	
	
	
	
	var xhr=createxmlhttprequest();
	
	xhr.onreadystatechange=function(){
	
	
	
	if(xhr.readyState===0){

	}
	else if(xhr.readyState===1){

	}
	
	else if(xhr.readyState===2){
	

	}
	else if(xhr.readyState===3){
	

	}
	else if(xhr.readyState===4){
	if(xhr.status===200){
	if(configer.dataType=="HTML")  {
    configer.success&&configer.success(xhr.responseText);  
	
	}
    else if(configer.dataType=="XML")  {
    configer.success&&configer.success(xhr.responseXML); 
	
	} 
	else if(configer.dataType=="JSON") { 
	
    configer.success&&configer.success(mika.parseJSON(xhr.responseText));
	}
	//else if(configer.dataType=="SCRIPT"){
	//XMLHTTPREQUEST无法跨域
	//window.eval.call(window,(xhr.responseText));
	//configer.success&&configer.success();
	//}
    }  
	
	
	
	}
	
	
	
	};
	
	if(configer.username){
    xhr.open(configer.method,configer.url,configer.async,configer.username,configer.password);
	}
	else{
	xhr.open(configer.method,configer.url,configer.async);
	}
	
	
	if(configer.method==="POST"){
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");  
	}
	xhr.send(configer.data);
	
	
	return undefined;
	
	
	
	
	
	
	
	
	
	}
	
	
	
	
	
	
	
	
	
	
	
	});
	
	
	
	
    
    
    
    /*
    入口，目前实现选择器参数类型如下:
	function 
	dom
	[dom0,dom1,...]
	mika Object
	id
	tagname
	className
	
	*/
    mika.instance = function(selector, context) {
        context = context || window.document;
        var _this = this;
        if (typeof selector === "function") {
            mika.event.onDomReady(selector);
			return this;
        }
        else if (typeof selector === "string") {

            if (/^#\w+$/.test(selector)) {
                var tempdom = __id(selector.replace('#', ''));
                if(tempdom){
                this[0]=tempdom;
                this.length = 1;	
                }
                
            }
            else if (/^\.\w+$/.test(selector)) {
                var doms = __className(selector.replace('.', ''), context);
                mika.each(doms,
                function() {
                    _this.push(this);
                });
            }
            else {
                var doms = __tagName(selector, context);
                mika.each(doms,
                function() {
                    _this.push(this);
                });
            }
        }
		else if(selector.mikaver){
		     return selector;
		}
		else if (mika.isElement(selector) || mika.isDocument(selector)) {
            this[0] = selector;
            this.length = 1;
        }
	    else if(mika.isArrayLike(selector)){
		mika.each(selector,function(){
		if(mika.isElement(this) || mika.isDocument(this))
		  _this.push(this);
		});
		}
       


        return this;
    };
    
	
	//原型引用，维护原型链
    mika.instance.prototype = mika.prototype = mika.fn;
    mika.prototype.constructor = mika;
    mika.instance.prototype.constructor = mika.instance;


 

})(this);
