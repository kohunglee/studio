/**
 * 工作室插件 js 运行库
 */

    // 定义 ACE 代码编辑器对象
    const emAceEditor = ace.edit("code"),
          editor      = emAceEditor,

    // 定义图片文件后缀名的正则样式
            img_patt = new RegExp(/^.+\.(gif|jpg|jpeg|bmp|png|ico|svg)/);

    // 定义文件在编辑器中的打开模式
    let st_file_type;

    /**
     * 调试
     * 
     * @param {string} data 输出的内容
     */
    function d(data){
        console.log(data)
    }

    /**
     * 显示消息
     * 
     * @param {string} msg 消息内容
     */
    function msg(msg){
        $("#em_stdio_msg").html(msg);
    }

    /**
     * 控制显示文件操作区 。
     * 控制哪些操作项显示，哪些操作项隐藏。
     * 
     * @param {string} type 文件类别。
     * type 参数有 空 、"file" 、 "folder" 、 "html"
     */
    function st_displayFileControl(type){
        $(".c-link").hide()
        switch (type) {
            case "file":
                $(".c-file").show()
                break;
            case "folder":
                $(".c-folder").show()
                break;
            case "html":
                $(".c-html").show()
                break;
            default:
                $(".c-index").show()
                break;
        }
    }

    /**
     * 无刷新更新 url 参数 openFile 。
     * 可在网页刷新时或通过含该参数的 url，方便地打开某个文件
     * 
     * @param {string} openFileUrl 消息内容
     */
    function st_refleshUrlParam(openFileUrl){
        // history.pushState('','', "plugin.php?plugin=studio&xxopenFile=..%2FPastePlugin%2FPastePlugin_setting.php..%2FPastePlugin%2FPastePlugin_setting.php&openFile=" + openFileUrl);
    }

    /**
     * 编辑器整体覆盖式地插入代码
     * 
     * @param {string} code 插入的内容
     * @param {string} type 以什么格式插入
     */
    function inAce(code,type){
        emAceEditor.getSession().setMode("ace/mode/" + type);
        emAceEditor.setValue(code);
        emAceEditor.gotoLine(0);
    }

    /**
     * 获取编辑器里的代码
     */
    function getAce(){
        return emAceEditor.getValue();
    }

    /**
     * 执行保存函数
     */
	function st_saveCode(url,code){
		$.post("../content/plugins/studio/studio_control.php?act=saveCode",
		{
            url : url,
            code: code
		},
		function(data){
            d("控制回调：\n"+data);
			if(data == "save_code_success"){
				msg("保存成功");
			}else{
				msg("保存失败");
			}
		},
        ).fail(function () {
            msg("保存失败，可能是网络问题......");
			alert("保存失败，无法访问保存程序，可能是网络问题......");
		});
	}

    /**
     * 渲染目录列表的 <li> 标签
     * 
     * @param {string} array 转换后的文件列表 json 数据
     */
    function st_randerLi(list_json){
        let htmlC = '';

        for(let i = 0; i < list_json.length; i++){
            let typeIcon = '',

                name = list_json[i].fileName,
                type = list_json[i].fileType,
                path = list_json[i].filePath,

                nameL = name.split('.').pop();  // 获取文件后缀名

            if(type == "folder")  typeIcon = `<span class="file_icon icofont-simple-right"></span>`;
            
            if(type == "file"){
                typeIcon = `icofont-penalty-`;

                switch(nameL){
                    case 'php' : 
                    case 'html': 
                        typeIcon = `icofont-page`;
                        break;
                    case 'txt': 
                    case 'md' : 
                        typeIcon = `icofont-pencil-alt-5`;
                        break;
                    case 'js': 
                        typeIcon = `icofont-comment`;
                        break;
                    default: 
                        typeIcon = `icofont-penalty-card`;
                        break;
                }

                if(img_patt.test(name)) {
                    typeIcon = `icofont-image"`;
                }

                typeIcon = `<span class="file_icon ${typeIcon}"></span>`;
            }

                htmlC = htmlC + `<li class="file_list_li" onclick="st_activeFile($(this))">`
                
                          + `${typeIcon}<a class="file_link" id="fileLink" title="${name}" file_type="${type}" link="${path}" onclick="st_openFile($(this))" href="javascript:void(0);">${name}</a>`
                          
                          + "</li>" ;
            }

        return htmlC;
    }

    /**
     * 打开项目动作
     * 
     * @param {string} url 要打开的文件链接
     */
	function st_openProject(url){
		msg("打开项目中");
        
		$.post("../content/plugins/studio/studio_control.php?act=openProject",
		{
            url: url
		},
		function(data){
            d("打开项目，传入的 php 回来的 data：\n"+data);

            let list_json = JSON.parse(data),
                htmlC     = '<a href="javascript:void(0);" onclick="st_toggleFileProj()" class="file_backProject">返回项目列表 <i class="icofont-logout"></i></a><ul class="scroll_ul">';

            htmlC += st_randerLi(list_json);
            htmlC += '</ul>';
            // 添加操作区 
            htmlC += `<div class="st_file_control" id="stControl"><hr>
            <a href="javascript:void(0);" class="c-link c-file c-folder" id="st_removeFile">删除</a>
            <a href="javascript:void(0);" class="c-link  c-folder c-index" id="st_addFile">新建文件</a>
            <a href="javascript:void(0);" class="c-link c-folder c-index" id="st_addFolder">新建文件夹</a>
            <a href="javascript:void(0);" class="c-link c-file c-folder" id="st_renameFile">重命名</a>
            <a href="javascript:void(0);" class="c-link c-file c-folder" id="st_copyFile">复制</a>
            <a href="javascript:void(0);" class="c-link c-file c-folder" id="st_cutFile">剪切</a>
            <a href="javascript:void(0);" class="c-link c-folder c-index" id="st_pasteFile">粘贴</a>
            <a href="javascript:void(0);" class="c-link st_c_html" id="st_renameFile">在新窗口打开</a>
            </div>`;

            $("#file_list_body").html(htmlC);
            st_toggleFileProj();
            st_displayFileControl(); // 默认显示 class 为 "c-index" 的项
		});

        msg("");
        
	}

    /**
     * 打开文件(夹)动作
     */
	function st_openFile($this){
        // 阻止冒泡事件
        event.stopPropagation();

        // 删掉所有 file_active_border class 的元素的该 class
        $(".file_active_border").removeClass("file_active_border")
        
        // 获取文件（夹）链接
        let url = $this.attr("link");

        if($this.attr('file_type') == 'folder' ){
            
        // -- 如果是文件夹
        
            if($this.next("ul").length > 0) {
                $this.parent().toggleClass("file_list_li_folderOpen");
                $this.next("ul").remove();
                $this.prev("span").toggleClass("icofont-simple-down");
                return;
            }

            msg("打开项目中");
            
            $.post("../content/plugins/studio/studio_control.php?act=openFolder",
            {
                url: url
            },
            function(data) {
                d("打开项目，控制回调：\n"+data);

                let list_json = JSON.parse(data),
                    htmlC     = '<ul>';

                htmlC += st_randerLi(list_json);
                htmlC += '</ul>';
                
                d(htmlC)
                $this.after(htmlC);

                $this.prev("span").toggleClass("icofont-simple-down");
                $this.parent().toggleClass("file_list_li_folderOpen");
            });

            msg("");
            
        // -- 如果是文件夹 (end)
        
        }else{
            
        // -- 如果是文件
        
            let fileName = $this.html(),
        
                type = $this.html().split('.').pop();

            if(img_patt.test(fileName)){
                msg("这是个图片");
                return;
            }

            switch(type){
                case 'txt': 
                case 'md' : 
                    type = "markdown";
                    break;
                case 'js': 
                    type = "javascript";
                    break;
                case 'css' : 
                case 'html': 
                case 'php' : 
                    break;
                default: 
                    type = "markdown";  // 默认使用 markdown 语言模式
                    break;
            }

            msg(type)

            $.post("../content/plugins/studio/studio_control.php?act=openCode",
                {
                    url: url
                },
                function(data){
                    d("打开文件，控制回调：\n"+data);
                    inAce(data,type);
                    st_refleshUrlParam(url);
                    $("#saveCode").attr("code_url",url);
                });
                
        // -- 如果是文件 (end)
        
	    }
    }

    /**
     * 切换 项目列表 与 文件列表 的显示
     */
	function st_toggleFileProj(){
        $("#file_list_body").toggle();
        $("#project_list_body").toggle();
    }

    /**
     * 激活文件（夹）动作
     */
    function st_activeFile($this){
        // 阻止冒泡事件
        event.stopPropagation();

        // 如果 this 元素是已经打开的目录，则退出
        if($this.children("ul").length > 0) return

        if(event.shiftKey !== true){
            // -- 如果 shift 键没按下 --

        }else{
            // -- 如果 shift 键按下了 --

            // 兼容部分浏览器，尝试不显示文本选中那些文件条目
            $("html").toggleClass("trans_select");
            window.getSelection().removeAllRanges();
            $("html").toggleClass("trans_select");
        }

        $this.toggleClass("file_active_border");

        /**
         * 临时测试一下单个文件（夹）的效果
         */
        // 获取文件类型和文件地址
        let fileType = $this.children("#fileLink").attr("file_type")
        let fileUrl = $this.children("#fileLink").attr("link")

        // 记录激活文件信息
        $("#stControl").attr("link",fileUrl);

        // 显示操作区
        st_displayFileControl(fileType);
        
    }

// 页面脚本运行入口
$(document).ready(function(){

    /* -----------  ace 编辑器配置  ----------------- */
    //设置默认风格和语言
    let st_theme    = ($(".em_studio_dark").length > 0) ? 'tomorrow_night' : 'clouds',
        st_language = "markdown";

    emAceEditor.setTheme("ace/theme/" + st_theme);
    emAceEditor.session.setMode("ace/mode/" + st_language);

    //字体大小
    emAceEditor.setFontSize(12);

    //设置只读（ true 时只读，用于展示代码）
    emAceEditor.setReadOnly(false);

    //自动换行,设置为off关闭
    emAceEditor.setOption("wrap", "off")

    //制表符默认为 4 个空格
    emAceEditor.getSession().setTabSize(4);

    //启用提示菜单
    ace.require("ace/ext/language_tools");
    emAceEditor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets           : true,
        scrollPastEnd            : 1,
        useSoftTabs              : true,
        enableLiveAutocompletion : true
    });
    
    /* ----------- ace 编辑器配置结束  ----------------- */

    $("#file_list_body").toggle();

    /* ----------- JS 事件监听开始  ----------------- */

    // 按快捷键保存
    document.addEventListener('keydown', function(e){  // 快捷键
		if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)){
            e.preventDefault();

            let url  = $("#saveCode").attr("code_url"),
                code = getAce();

            d(url)

            st_saveCode(url,code);
		}
	});

    // 点击保存按钮
    $("#saveCode").click(function(){
        let url  = $("#saveCode").attr("code_url"),
            code = getAce();

        d(url)

        st_saveCode(url,code);
    });

    // 点击转换工作室显示主题
    $("#changeTheme").click(function(){

        if($(".em_studio_dark").length > 0){
            // 切换至日间时附加的脚本
            emAceEditor.setTheme("ace/theme/" + "clouds");
            Cookies.set('em_studio_theme',"light");
        }else{
            // 切换至夜间时附加的脚本
            emAceEditor.setTheme("ace/theme/" + "tomorrow_night");
            Cookies.set('em_studio_theme',"dark");
        }

        $("html").toggleClass("em_studio_dark")
	});

    // 编辑器 onchange 事件（文件内容更改）
    emAceEditor.session.on('change', function(delta) {
        msg("已修改");

        // 添加页面的离开提示
        window.onbeforeunload = function (e) {
            e                    = e || window.event;
            if (e) e.returnValue = '离开页面提示';
            return '离开页面提示';
        }
    });

    /* ----------- JS 事件监听结束  ----------------- */
})

