<?php
/**
 * 操作文件的 API 文件
 */

// 判断是否是管理员登录状态
require_once '../../../init.php';
!(ROLE == ('admin' || 'founder')) && exit('非管理员权限！');

require_once 'class/fileSystem.class.php';

error_reporting(0);

$getInfo   = isset($_GET["act"]) ? addslashes($_GET["act"]) : '';

$url       = isset($_POST["url"]) ? addslashes($_POST["url"]) : '';
$code      = isset($_POST["code"]) ? ($_POST["code"]) : '';

// $url 还需要进一步解码
$url = urldecode($url);

switch($getInfo){
    case 'openProject':  // 打开项目
        $project_dir = new filels();
        $project_dir_list = $project_dir->odir("../".substr($url, 19));
        echo json_encode($project_dir_list);
        break;
    case 'openFolder':  // 打开文件夹
        $project_dir = new filels();
        $project_dir_list = $project_dir->odir($url);
        echo json_encode($project_dir_list);
        break;
    case 'openCode':  // 打开代码
        $getCode = new edit();
        $codes = $getCode->edits($url);
        echo $codes['filecontent']; 
        break;
    case 'saveCode':  // 保存代码
        $saveCode = new edit();
        $codeContent = $code;
        if($saveCode->bc($url,$codeContent)){
            echo "save_code_success";
        }
        break;
    case 'addFile':  // 添加文件
        $addFile = new edit();
        if($addFile->addFile($url)){
            echo "add_file_success";
        }else{
            echo "the_file_had_exists";
        }
        break;
    default:  // 直接访问，则报错
        echo "error!";
        break;
}
?>
