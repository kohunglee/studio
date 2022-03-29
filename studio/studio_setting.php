<?php
    // 检查 cookie 信息，以确定是使用日间主题还是夜间主题
    if($_COOKIE["em_studio_theme"] === 'dark'){
        echo '<html class="em_studio_dark">';
    }
?>
<style>
    @media all and (min-width: 768px){
        .navbar {
            display: none!important;
        }
        .container-fluid {
            padding-top: 20px!important;
        }
    }
    footer {
        display:none!important;
    }
    .studio_body {
        /* padding:0px!important; */
    }
    #file_list_body {
        margin-left: -25px;
    }
    #file_list_body ul,.file_backProject {
        margin-left: 25px;
    }
    #saveCode {
        float:right;
    }
    .em_stdio_msg {
        color:deepskyblue;
        margin-left:10px;
    }
    .scroll_ul {
        overflow-x: hidden;
        height: calc(100vh - 220px);
    }
    .ace_print-margin {
        display: none;
    }
    

    /* 夜间模式 */
    .em_studio_dark body {
        color:white;
    }
    .em_studio_dark a,.em_stdio_msg {
        color:#96deff!important;
    }
    .em_studio_dark a:hover{
        color:#c1ebff!important;
    }
    .em_studio_dark .bg-white {
        background-color: #494949!important;
    }
    .em_studio_dark .bg-white a {
        color: #9899ff!important;
    }

    /* 编辑器 */
    .em_studio_dark #code {
        background-color: #1D1F21!important;
    }
    .em_studio_dark .ace_gutter {
        background-color: #25282c!important;
    }
    .em_studio_dark .ace_gutter-active-line {
        background-color: #282A2E!important;
    }

    .em_studio_dark #accordionSidebar {
        background-image: linear-gradient(180deg, #243c80 10%, #0f0e0e 100%)!important;
    }
    .em_studio_dark #content-wrapper,body {
        background-color: #9b9b9b!important;
    }
    .em_studio_dark #studio_header {
        margin: -1px;
        padding: 18px;
        background: #717171!important;
        border-bottom: 1px solid #6d6d6d!important;
    }
    .em_studio_dark .card {
        border: 1px solid #6d6d6d!important;
    }
    .em_studio_dark #studio_body {
        background: #494949!important;
        margin-right: -1px!important;
        margin-left: -1px!important;
        padding-right: 8px!important;
        padding-left: 8px!important;
    }
}
</style>

<?php
!defined('EMLOG_ROOT') && exit('access deined!');
!(ROLE == ('admin' || 'founder')) && exit('非管理员权限！');

require_once 'class/fileSystem.class.php';

function plugin_setting_view()
{
    $path = "../content/plugins";
    $dir = new filels();
    $file_list = $dir->odir($path);

?>
<div class="card ">
    <div class="card-header py-3" id="studio_header">
		<h6 class="m-0 font-weight-bold">emlog 插件应用开发工作室&nbsp;&nbsp;<span id="em_stdio_msg" class="em_stdio_msg"></span></h6>
    </div>
    <div class="card-body row studio_body" id="studio_body" >
        <div class="form-group col-sm-9">
            <pre id="code" class="ace_emAceEditor" style="min-height:calc(100vh - 180px)"></pre>
            <a href="javascript:void(0);" id="changeTheme">切换主题</a>
            
            <button type="button" id="saveCode" class="btn btn-primary">保存 Ctrl+S</button>

		</div>
        <div class="form-group col-sm-3 scroll_ul" id="project_list_body">
            <!--循环输出文件列表-->
            <ul>
            <?php 
            if (!empty($file_list)):
				foreach ($file_list as $value):
                    if($value['fileType'] == "file"){continue;}
			?>
            <!-- html 正文-->
                <li>项目名：<a class="project_link" link="<?= $value['filePath'] ?>" onclick="st_openProject($(this).attr('link'))" href="javascript:void(0);"><?= $value['fileName'] ?></a></li>
			<!--（结束）html 正文-->
            <?php
				endforeach;
			else:
			?>
			<?php endif ?>
            <!--（结束）循环输出文件列表-->
            </ul>
		</div>
        <div class="form-group col-sm-3" id="file_list_body"></div>
    </div>
    <a hidden onclick="window.location.href = 'plugin.php';" style="position:fixed" href="#">返回插件页</a>
</div>
<!--导入 ace 编辑器的 js 库-->
<script src="../content/plugins/studio/ace/ace.js" type="text/javascript" charset="utf-8"></script> 
<script src="../content/plugins/studio/ace/ext-language_tools.js" type="text/javascript" charset="utf-8"></script>
<script>
    // 定义 ACE 代码编辑器对象
    let emAceEditor = ace.edit("code"),
        editor = emAceEditor,

    // 定义图片文件后缀名的正则样式
        img_patt = new RegExp(/^.+\.(gif|jpg|jpeg|bmp|png|ico|svg)/),

    // 定义文件在编辑器中的打开模式
        st_file_type;

    /**
     * 调试
     */
    function d(data){
        console.log(data)
    }

    /**
     * 显示消息
     */
    function msg(msg){
        $("#em_stdio_msg").html(msg);
    }

    /**
     * 编辑器整体覆盖式的插入代码
     * 
     * @ code:插入的内容
     * @ type:以什么格式插入
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
     */
    function st_randerLi(list_json){
        let htmlC = '';

        for(let i = 0; i < list_json.length; i++){
            let typeIcon = '',

                name = list_json[i].fileName,
                type = list_json[i].fileType,
                path = list_json[i].filePath,

                nameL = name.split('.').pop();  // 获取文件后缀名

                if(type == "folder")  typeIcon = `<span class="icofont-simple-right">&nbsp;</span>`;
                
                if(type == "file"){
                    typeIcon = `<span class="icofont-penalty-card">&nbsp;</span>`;

                    switch(nameL){
                        case 'php':
                        case 'html':
                            typeIcon = `<span class="icofont-page">&nbsp;</span>`;
                            break;
                        case 'txt':
                        case 'md':
                            typeIcon = `<span class="icofont-pencil-alt-5">&nbsp;</span>`;
                            break;
                        case 'js':
                            typeIcon = `<span class="icofont-comment">&nbsp;</span>`;
                            break;
                        default:
                            typeIcon = `<span class="icofont-penalty-card">&nbsp;</span>`;
                            break;
                    }

                    if(img_patt.test(name)) {
                        typeIcon = `<span class="icofont-image">&nbsp;</span>`;
                    }

                }

                htmlC     = htmlC + "<li>" ;
                htmlC     = htmlC + `${typeIcon}<a class="file_link" file_type="${type}" link="${path}" onclick="st_openFile($(this))" href="javascript:void(0);">${name}</a>`
                htmlC     = htmlC + "</li>" ;
            }

        return htmlC;
    }

    /**
     * 打开项目动作
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
                htmlC     = '<a href="javascript:void(0);" onclick="st_toggleFileProj()" class="file_backProject">--- 返回项目列表 ---</a><ul class="scroll_ul">';

            htmlC += st_randerLi(list_json);
            htmlC += '</ul>';

            $("#file_list_body").html(htmlC);
            st_toggleFileProj();
		});

        msg("");
        
	}

    /**
     * 打开文件(夹)动作
     */
	function st_openFile($this){

        // 获取文件（夹）链接
        let url = $this.attr("link");

        if($this.attr('file_type') == 'folder' ){
            
        // -- 如果是文件夹
        
            if($this.next("ul").length > 0) {
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
                    break;
                default:
                    type = "php";  // 默认使用 php 语言模式
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


// 页面脚本运行入口
$(document).ready(function(){

    /* -----------  ace 编辑器配置  ----------------- */
    
    //设置默认风格和语言
    let st_theme = "<?= ($_COOKIE['em_studio_theme'] === 'dark') ? 'tomorrow_night':'clouds' ?>",
        st_language = "javascript";

    emAceEditor.setTheme("ace/theme/" + st_theme);
    emAceEditor.session.setMode("ace/mode/" + st_language);

    //字体大小
    emAceEditor.setFontSize(12);

    //设置只读（true时只读，用于展示代码）
    emAceEditor.setReadOnly(false);

    //自动换行,设置为off关闭
    emAceEditor.setOption("wrap", "free")

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
    
    /* ----------- （结束）ace 编辑器配置  ----------------- */

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
            Cookies.set('em_studio_theme',"dark");
            emAceEditor.setTheme("ace/theme/" + "tomorrow_night");
        }

        $("html").toggleClass("em_studio_dark")
	});
    
})
</script>

<?php
}