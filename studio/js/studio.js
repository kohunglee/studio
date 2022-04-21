/**
 * 工作室插件 js 运行库
 */
"use strict"

    /**
     * 定义图片文件后缀名的正则样式
     */
    const IMG_PATT = new RegExp(/^.+\.(gif|jpg|jpeg|bmp|png|ico|svg)/);

    /**
     * 定义 ACE 代码编辑器对象
     */
    let emAceEditor = ace.edit("code");
    let editor      = emAceEditor;

    /**
     * 定义文件在编辑器中的打开模式
     */
    let st_file_type = '';

    // 定义值
    // addFileSourceUrl ：用来储存供 “添加文件” 功能使用的源 URL
    // openProjectUrl   ：储存当前插件地址
    let addFileSourceUrl = '', 
        openProjectUrl = '';    

    // 定义打开中，以避免编辑器在打开时发出 “已修改” 的 msg
    let st_opening = true;

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
        return $("#em_stdio_msg").html(msg);
    }

    /**
     * (作废) 刷新文件列表显示（为了更新文件列表数据，同时也保留原有的状态）
     */
    function st_refleshFileList(){

        // 第一步，重新打开一次文件列表
        st_openProject("..%2Fcontent%2Fplugins%2FPastePlugin")
        
        // 第二步 ...
    }

    /**
     * 刷新文件根目录 （或者说是重新打开一次项目）
     */
    function st_file_reflash(topMsg = false) {
        st_openProject($("#file_ul").attr("link"));
        if(topMsg) msg("刷新成功")
    }

    /**
     * 控制显示文件操作区。
     * 控制哪些操作项显示，哪些操作项隐藏。
     * 
     * @param {string} type 文件类别。
     * type 参数有 空 、"file" 、 "folder" 、 "html"
     */
    function st_displayFileControl(){
        // 获取激活（选中）项的数目
        let activeLen = $(".file_active_border").length;
        let type = "";

        if (activeLen > 1) {
            type = "severalFile";
        } else {
            let $item = $(".file_active_border")
            type = $item.children("#fileLink").attr("file_type");
            addFileSourceUrl = $item.children("#fileLink").attr("link");
            d("源地址啊：" + decodeURIComponent(addFileSourceUrl));
        }

        // 控制显示
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
            case "severalFile":
                $(".c-sf").show()
                break;
            default:
                $(".c-index").show()
                break;
        }
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
        st_opening = true;
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
			if(data === "save_code_success"){
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

            if(type === "folder")  typeIcon = `<span class="file_icon icofont-simple-right"></span>`;
            
            if(type === "file"){
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

                if(IMG_PATT.test(name)) {
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
        d("url is :" + url);

		$.post("../content/plugins/studio/studio_control.php?act=openProject",
		{
            url: url
		},
		function(data){
            d("打开项目，传入的 php 回来的 data：\n"+data);

            let list_json = JSON.parse(data),
                htmlC     = `<a href="javascript:void(0);" onclick="st_showProj()" class="file_backProject">返回项目列表 <i class="icofont-logout"></i></a>
                             <a href="javascript:void(0);" onclick="st_file_reflash(true)" class="file_reflash">刷新</a>
                             <ul class="scroll_ul" link="${url}" id="file_ul">`;
            
            htmlC += st_randerLi(list_json);
            htmlC += '</ul>';
            
            // 添加操作区 
            htmlC += `<div class="st_file_control" id="stControl"><hr>
                <a href="javascript:void(0);" class="c-link c-file c-folder c-sf" id="st_copyFile">复制</a>
                <a href="javascript:void(0);" class="c-link c-file c-folder c-sf" id="st_cutFile">剪切</a>
                <a href="javascript:void(0);" class="c-link c-folder c-index" id="st_pasteFile">粘贴</a>
                <a href="javascript:void(0);" class="c-link c-file c-folder c-sf" onclick="st_removeF()">删除</a>
                <a href="javascript:void(0);" class="c-link c-file c-folder" onclick="st_open_model('rename')">重命名</a>
                <a href="javascript:void(0);" class="c-link  c-folder c-index" onclick="st_open_model('addFile')">新建文件</a>
                <a href="javascript:void(0);" class="c-link c-folder c-index" onclick="st_open_model('addFolder')">新建文件夹</a>
                <a href="javascript:void(0);" class="c-link st_c_html" id="st_renameFile">在新窗口打开</a>
            </div>`;

            $("#file_list_body").html(htmlC);
            $("#file_list_body").show();
            $("#project_list_body").hide();
            st_displayFileControl(); // 默认显示 class 为 "c-index" 的项

            // 更新地址
            openProjectUrl = url.replace("content%2Fplugins%2F","");  // 删去多余字符
            addFileSourceUrl = openProjectUrl;
            d("源地址为：" + decodeURIComponent(addFileSourceUrl))
		});

        msg("");
        
	}

    /**
     * 打开文件(夹)动作
     * 
     * @param {jqurey_obj} 要打开的文件夹对象
     * @param {bool} preventProp 是否阻止冒泡事件
     * @param {bool} reflash 如果为 true ，则在刷新指定文件夹时，如果该文件夹处在关闭状态，则不做操作
     * 
     * reflash 参数是解决当选中一个关闭的文件夹，新建文件时，会重复输出子文件树的问题。
     */
	function st_openFile($this, preventProp = false, reflash = false){
        // 阻止冒泡事件
        if(!preventProp) event.stopPropagation();

        // 删掉所有 file_active_border class 的元素的该 class
        $(".file_active_border").removeClass("file_active_border")
        
        // 获取文件（夹）链接
        let url = $this.attr("link");

        if($this.attr('file_type') === 'folder' ){
            
        // -- 如果是文件夹
            
            if($this.next("ul").length > 0) {
                $this.parent().toggleClass("file_list_li_folderOpen");
                $this.next("ul").remove();
                $this.prev("span").toggleClass("icofont-simple-down");
                return;
            } else {
                if(reflash) return;
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

            if(IMG_PATT.test(fileName)){
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

                    // 将 st_opening 定义为 false ,在 inAce() 后会再次改回 false ,以表示不处于打开中的状态
                    st_opening = false;

                    inAce(data,type);
                    $("#saveCode").attr("code_url",url);
                });
                
        // -- 如果是文件 (end)
        
	    }
    }

    /**
     * 切换 项目列表 与 文件列表 的显示
     */
	function st_showProj(){
        $("#file_list_body").hide();
        $("#project_list_body").show();
    }

    /**
     * 激活文件（夹）动作
     */
    function st_activeFile($this){
        // 阻止冒泡事件
        event.stopPropagation();

        // 判断父与子级元素是否存在有激活状态的，如果是，return
        if ($this.children("ul").find(".file_list_li_folderOpen,.file_active_border").length > 0) return
        if ($this.parent().parent().is(".file_active_border")) return

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
        // // 获取文件类型和文件地址
        // let fileType = $this.children("#fileLink").attr("file_type")
        // let fileUrl = $this.children("#fileLink").attr("link")

        // // 记录激活文件信息
        // $("#stControl").attr("link",fileUrl);

        // 显示操作区
        st_displayFileControl();

        if($(".file_active_border").length === 0){
            addFileSourceUrl = openProjectUrl;
        }
        // 更新 addFileSourceUrl
        // if(addFileSourceUrl === $this.children("#fileLink").attr("link")){
        //     addFileSourceUrl = openProjectUrl;
        // }else{
        //     addFileSourceUrl = $this.children("#fileLink").attr("link");
        // }
        d("源地址是：" + decodeURIComponent(addFileSourceUrl))
        
    }

    /**
     * 打开模态窗
     */
    function st_open_model(type) {
        $("#st_mod_input").val("");
        switch (type) {
            case 'addFile':
                $("#st_mod_title").text("请输入文件名");
                $("#st_mod_input").attr("placeholder","如 index.php");
                $("#st_mod_ok").attr("onclick","st_addf('addFile')");
                break;
            case 'addFolder':
                $("#st_mod_title").text("请输入文件夹名");
                $("#st_mod_input").attr("placeholder","如 include");
                $("#st_mod_ok").attr("onclick","st_addf('addFolder')");
                break;
            case 'rename':
                $("#st_mod_title").text("请输入新文件名");
                $("#st_mod_input").attr("placeholder","无效");
                break;
            case 'b':
        
                break;
            default:
                break;
        }

        $('#st-modal').modal('show');
    }

    /**
     * 新建文件 (夹) 模态框的确定按钮按下
     */
    function st_addf(type) {
        let $ele        = $("[link='"+ addFileSourceUrl +"']");
        let newFName    = $("#st_mod_input").val();

        if(newFName === "") {
            alert("请输入内容");
            return;
        }
        $.post("../content/plugins/studio/studio_control.php?act=" + type,
        {
            url: addFileSourceUrl + "/" + newFName
        },
        function(data){
            if(data === "add_file_success"){
                $("#st-modal").modal('hide');  // 关闭模态窗

                if($ele.length > 0){
                    // 如果非插件根目录，模拟重复按 *两遍* 展开关闭文件夹以实现刷新，
                    st_openFile($ele, true, true);
                    st_openFile($ele, true);
                } else {
                    // 否则刷新插件根目录
                    st_file_reflash();
                }
            }
            if(data === "the_file_had_exists"){
                alert("文件已经存在");
            }
        });
    }

    /**
     * “删除” 功能链接按下
     */
    function st_removeF() {
        if(confirm("确定删除？") == false) return false;
        
        let $ele        = $("[link='"+ addFileSourceUrl +"']");
        let $ele_father = $ele.parent("li").parent("ul").prev(".file_link")
        let type        = $ele.attr("file_type");
        
        let para        = (type === 'file') ? 'removeF' : 'removeFolder';
        let _url        = (type === 'file') ? '' : '/';
        
        $.post("../content/plugins/studio/studio_control.php?act=" + para,
        {
            url: addFileSourceUrl + _url
        },
        function(data){
            
                alert(data);
                
                if($ele_father.length > 0){
                    // 如果非插件根目录，模拟重复按 *两遍* 展开关闭文件夹以实现刷新，
                    st_openFile($ele_father, true);
                    st_openFile($ele_father, true);
                } else {
                    // 否则刷新插件根目录
                    st_file_reflash();
                }
            
        });
    }


/* --------------------------------------------------------------------------------------------
 * --------------------------------------------------------------------------------------------
 * --------------------------------------------------------------------------------------------
 * --------------------------------------------------------------------------------------------
 */



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
		if (e.keyCode === 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)){
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
        if(!st_opening) return

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


/*
$.post("../content/plugins/studio/studio_control.php?act=",
        {
            url: addFileSourceUrl 
        },
        function(data){
            
                alert(data);
            
        });
*/

