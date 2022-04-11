<?php
    // 检查 cookie 信息，以确定是使用 *日间主题* 还是 *夜间主题*
    if(isset($_COOKIE["em_studio_theme"]) && $_COOKIE["em_studio_theme"] === 'dark'){
        echo '<html class="em_studio_dark">';
    }

    // 定义版本号，以方便资源引入的缓存更新
    $st_ver = 100;
    $st_ver = rand(2,100);
?>
<link rel="stylesheet" type="text/css" href="../content/plugins/studio/css/style.css?=<?= $st_ver ?>">
<?php
!defined('EMLOG_ROOT') && exit('access deined!');

!(ROLE == ('admin' || 'founder')) && exit('非管理员权限！');

require_once 'class/fileSystem.class.php';

function plugin_setting_view()
{
    // 定义插件根目录，并通过 filels 类读取所有插件的信息
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
            
            <button type="button" id="saveCode" class="btn btn-primary save_code">保存 Ctrl+S</button>

		</div>
        <div class="form-group col-sm-3 scroll_ul" id="project_list_body">
            <!--循环输出文件列表-->
            <ul>
            <?php 
            if (!empty($file_list)):
				foreach ($file_list as $value):
                    if($value['fileType'] == "file"){continue;}
                    
             //<!-- html 正文-->
			?>
                <li>项目名：<a class="project_link" link="<?= $value['filePath'] ?>" onclick="st_openProject($(this).attr('link'))" href="javascript:void(0);"><?= $value['fileName'] ?></a></li>
            <?php
            //<!--（结束）html 正文-->
				endforeach;
			else:
			?>
			<?php endif ?>
            <!--（结束）循环输出文件列表-->
            </ul>
		</div>
        <div class="form-group col-sm-3 file_list_body" id="file_list_body"></div>
    </div>
    <a hidden onclick="window.location.href = 'plugin.php';" style="position:fixed" href="#">返回插件页</a>
</div>
<!-- 导入 ace 编辑器的 js 库 -->
<script src="../content/plugins/studio/ace/ace.js?=<?= $st_ver ?>" type="text/javascript" charset="utf-8"></script> 
<script src="../content/plugins/studio/ace/ext-language_tools.js?=<?= $st_ver ?>" type="text/javascript" charset="utf-8"></script>
<!-- 导入工作室的 js -->
<script src="../content/plugins/studio/js/studio.js?=<?= $st_ver ?>" type="text/javascript" charset="utf-8"></script>
<?php
}