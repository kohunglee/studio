<?php
// error_reporting(0);

class filels{
    public $path;         // 路径
    public $opendirr;     // 打开路径
    public $readdirr;     // 读取路径
    public $filee;        // 文件数组
    public $zsPath;       // 用于拼接目录
    public $fileStar;     // 文件属性
    public $strlen;       // 字符总长度
    public $sub;          // 截取的文件后缀名
    public $fileOutChar;  // 原编码
    public $pathChar;     // 路径字符编码
    public $pathGbk;      // 路径 gbk 编码

    public function odir($path){
        $this->path = urldecode($path);
        
        // 如果没有路径参数，则 die
        if(!$path){die("未输入路径参数");}

        // 判断路径是否正确并返回提示
        if(!is_dir($this->path)){die("error 不是一个正确的路径！".$this->path);}
        $this->opendirr = opendir($this->path);
        if(!$this->opendirr){die('error 打开文件夹失败！');}

        // 定义数组 filesArray，以储存读取的文件列表信息
        $filesArray=array();

        // 读取文件信息，并存入数组 filesArray
        while($this->filee = readdir($this->opendirr)){

            // 确保 文件名 和 文件路径 输出是使用的正确编码
            $this->zsPath = $this->path.'/'.$this->filee;

            // 判断文件类型（文件夹或文件）
            $this->fileStar = (is_file($this->zsPath)) ? 'file' : 'folder';

            if($this->filee == '.' || $this->filee == '..' || $this->filee == '.DS_Store' || $this->filee == '__MACOSX' ){
                continue;
            }

            $newFileInfo = array(
                'fileName' => $this->filee,
                'fileType' => $this->fileStar,
                'filePath' => urlencode($this->zsPath)
            );

            array_push($filesArray, $newFileInfo);
        }
        closedir($this->opendirr);

        // 按照文件夹和文件两种类型，进行分类排序，以保证文件夹在文件上方
        foreach ($filesArray as $key => $row) {
            $fileType[$key] = $row['fileType'];
        }
        array_multisort($fileType, SORT_DESC, $filesArray);

        

        return $filesArray;
    }
}

/**  读取文件类  **/

class edit {
    public $file;
    public $filename;  // 文件名字
    public $filetype;  // 文件类型
    public $filesize;  // 文件大小
    public $fileopen;  // 打开文件
    public $fileread;  // 读取文件

    //写入变量
    public $filepath;
    public $filecontent;   //保存文件用到的文件内容
    public $fileput;       //文件写入

    public function edits($files){

        $this->file = urldecode($files);
        
        if(!file_exists($this->file)){
            die("文件不存在！");
        }
        $this->fileopen = fopen($this->file, 'r');
        if(!$this->fileopen){
            die("文件读取失败");
        }
        $this->filesize = filesize($this->file);
        $this->fileread = fread($this->fileopen,$this->filesize);
        $this->fileread = $this->fileread;
        //开始获取文件的后缀名
        $filestr = strlen($this->file);
        $filepoint = strrpos($this->file, '.');
        $filesub = substr($this->file, $filepoint+1);
        $this->filetype = $filesub;
        $this->filename = basename($this->file);
        //以数组形式返回：文件类型 文件名称 文件内容 文件路径
        return array(
            'filetype'=>$this->filetype,
            'filename'=>$this->filename,
            'filecontent'=>$this->fileread,
            'filepath'=>$this->file
        );
        //关闭文件
        fclose($this->file);
    }
    
    /* 修改文件函数 */
    public function bc($filepath,$filecontent){
        $this->filepath = urldecode($filepath);

        //获取传进来的文件内容
        $this->filecontent = $filecontent;
        
        //写入文件
        if(file_put_contents($this->filepath, $this->filecontent, LOCK_EX)){
            return true;
        }else{
            return false;
        }
    }

    /* 创建文件 */
    public function addFile($url){
        if(!file_exists($url)){
            $addFile = fopen($url, "w");
            return true;
        }else{
            return false;
        }
    }

    /* 创建文件夹 */
    public function addFolder($url){
        if(!is_dir($url)){
            @mkdir($url);
            return true;
        }else{
            return false;
        }
    }

    /* 删除文件 */
    public function removeF($url){
        $file = $url;
        if(file_exists($file)){
            if(unlink($file)){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }
    
    /* 重命名 */
    public function rename($url){
        $file = $url;
        if(file_exists($file)){
            if(rename($file,'newtest.txt')){
                echo $file.' 重命名成功！';
            }else{
                echo $file.' 重命名失败！';
            }
        }else{
            echo $file.' 不存在！';
        }
    }

    /* 删除文件夹 */
    public function rmoveFolder($url){
        // 遍历目录，递归删除
        $path = $url;

        // 文件夹不存在，返回 FALSE
        if(!is_dir($url)){
            return false;
        }

        function deldir($path){
            //如果是目录则继续
            if(is_dir($path)){
                //扫描一个文件夹内的所有文件夹和文件并返回数组
                $p = scandir($path);
                //如果 $p 中有两个以上的元素则说明当前 $path 不为空
                if(count($p)>2){
                    foreach($p as $val){
                        //排除目录中的.和..
                        if($val !="." && $val !=".."){
                            //如果是目录则递归子目录，继续操作
                            if(is_dir($path.$val)){
                                //子目录中操作删除文件夹和文件
                                deldir($path.$val.'/');
                            }else{
                                //如果是文件直接删除
                                unlink($path.$val);
                            }
                        }
                    }
                }
            }
            //删除目录
            return rmdir($path);
        }
        //调用函数，传入路径
        deldir($path);
        return true;
    }
    
}
?>