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
        }
    }
}
?>