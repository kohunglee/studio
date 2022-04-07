/**
 * 工作室 js 运行库
 */

    // 定义 ACE 代码编辑器对象
    let emAceEditor = ace.edit("code"),
        editor = emAceEditor,

    // 定义图片文件后缀名的正则样式
        img_patt = new RegExp(/^.+\.(gif|jpg|jpeg|bmp|png|ico|svg)/),

    // 定义文件在编辑器中的打开模式
        st_file_type;

    /**
     * 调试
     * 
     * @param string data 输出的内容
     */
    function d(data){
        console.log(data)
    }

    /**
     * 显示消息
     * 
     * @param string msg 消息内容
     */
    function msg(msg){
        $("#em_stdio_msg").html(msg);
    }

    /**
     * 编辑器整体覆盖式的插入代码
     * 
     * @param string code 插入的内容
     * @param string type 以什么格式插入
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
            url:url,
            code:code
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
     * @param string array 转换后的文件列表 json 数据
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
                    case 'php':
                    case 'html':
                        typeIcon = `icofont-page`;
                        break;
                    case 'txt':
                    case 'md':
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

                htmlC     = htmlC + `<li class="file_list_li" onclick="st_activeFile($(this))">`
                
                          + `${typeIcon}<a class="file_link" title="${name}" file_type="${type}" link="${path}" onclick="st_openFile($(this))" href="javascript:void(0);">${name}</a>`
                          
                          + "</li>" ;
            }

        return htmlC;
    }

    /**
     * 打开项目动作
     * 
     * @param string url 要打开的文件链接
     */
	function st_openProject(url){
		msg("打开项目中");
        
		$.post("../content/plugins/studio/studio_control.php?act=openProject",
		{
            url:url
		},
		function(data){
            d("打开项目，传入的 php 回来的 data：\n"+data);

            let list_json = JSON.parse(data),
                htmlC     = '<a href="javascript:void(0);" onclick="st_toggleFileProj()" class="file_backProject">返回项目列表 <i class="icofont-logout"></i></a><ul class="scroll_ul">';

            htmlC += st_randerLi(list_json);
            htmlC += '</ul>';

            htmlC += `<div class="st_file_control">123</div>`;

            $("#file_list_body").html(htmlC);
            st_toggleFileProj();
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
                url:url
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
            
        // -- end
        
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
                case 'md':
                    type = "markdown";
                    break;
                case 'js':
                    type = "javascript";
                    break;
                case 'css':
                case 'html':
                case 'php':
                    break;
                default:
                    type = "markdown";  // 默认使用 markdown 语言模式
                    break;
            }

            msg(type)

            $.post("../content/plugins/studio/studio_control.php?act=openCode",
                {
                    url:url
                },
                function(data){
                    d("打开文件，控制回调：\n"+data);
                    inAce(data,type);
                    $("#saveCode").attr("code_url",url);
                });
                
        // -- end
        
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

        if(event.shiftKey !== 1){
            // 如果 shift 键没按下
            $("html").toggleClass("trans_select");
            window.getSelection().removeAllRanges();
            $("html").toggleClass("trans_select");
        }else{
            // 如果
        }

        $this.toggleClass("file_active_border");
        
    }

// 页面脚本运行入口
$(document).ready(function(){

    /* -----------  ace 编辑器配置  ----------------- */
    //设置默认风格和语言
    let st_theme = ($(".em_studio_dark").length > 0) ? 'tomorrow_night' : 'clouds',
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
        enableSnippets: true,
        scrollPastEnd:1,
        useSoftTabs:true,
        enableLiveAutocompletion: true
    });
    
    /* ----------- ace 编辑器配置结束  ----------------- */

    $("#file_list_body").toggle();

    // 点击保存按钮
    $("#saveCode").click(function(){
        let url     = $("#saveCode").attr("code_url"),
		    code	= getAce();

        d(url)

		st_saveCode(url,code);
	});

    // 按快捷键保存
    document.addEventListener('keydown', function(e){  // 快捷键
		if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)){
            e.preventDefault();

            let url     = $("#saveCode").attr("code_url"),
                code	= getAce();

            d(url)

            st_saveCode(url,code);
		}
	});

    // 点击转换主题
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
            e = e || window.event;
            if (e) e.returnValue = '离开页面提示';
            return '离开页面提示';
        }
    });
    
})