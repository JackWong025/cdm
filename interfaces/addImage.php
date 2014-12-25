<?php
/*
添加图像接口

1*************************************************************
上传修改用户头像
@param $_POST['type'] == 'avatar'
裁剪信息：
@param $_FILES['settings_avatar_file']
@param $_POST['x']
@param $_POST['y']
@param $_POST['w']
@param $_POST['h']
用户ID:
@param $_POST['id']

2*************************************************************
上传小组头像
@param $_POST['type'] == 'group'

@param $_FILES['settings_group_avatar_file']
小组ID:
@param $_POST['id']



 */
require_once '../require.php';

if ($_POST['type'] == 'avatar') {
	addavatar('settings_avatar_file',USERAVATAR_PATH,$_POST['id']);
}elseif($_POST['type'] == 'group'){
	addavatar('settings_avatar_file',GROUPAVATAR_PATH,$_POST['id']);
}

/**
 * @param string $file_key
 * @param string $dest_path 类似  resources/avatars/user/   函数会添加后缀
 * @param string $id
 */
function addavatar($file_key,$dest_path,$id) {
	//限制文件在2M以下
	if ($_FILES[$file_key]["error"] > 0) {
		echofalse_andexit();
	} else {
		// echo "Upload: " . $_FILES[$file_key]["name"];
		// echo "Type: " . $_FILES[$file_key]["type"];
		// echo "Size: " . ($_FILES[$file_key]["size"] / 1024);
		// echo "Stored in: " . $_FILES[$file_key]["tmp_name"];
		// echo $_POST['x']." ".$_POST['y']." ".$_POST['x2']." ".$_POST['x2']." ".$_POST['w']." ".$_POST['h']." ";
		if (($_FILES[$file_key]["size"] / 1024) > 100) {
			echofalse_andexit();
		}

		//将图片裁剪并存储
		$r1 = imagecropper($dest_path . $id . "_origin.jpg", $_FILES[$file_key]["tmp_name"], intval($_POST['x']), intval($_POST['y']), intval($_POST['w']), intval($_POST['h']));
		if (!$r1) {
			echofalse_andexit();
		}

		//将图片分别以 256  128  64  32 的尺寸保存
		$r2 = image_scale($dest_path . $id, $dest_path . $id . "_origin.jpg", 32, 32);
		if ($r2) {
			$r2 = image_scale($dest_path . $id, $dest_path . $id . "_origin.jpg", 64, 64);
		} else {
			echofalse_andexit();
		}

		if ($r2) {
			$r2 = image_scale($dest_path . $id, $dest_path . $id . "_origin.jpg", 128, 128);
		} else {
			echofalse_andexit();
		}

		if ($r2) {
			$r2 = image_scale($dest_path . $id, $dest_path . $id . "_origin.jpg", 256, 256);
		} else {
			echofalse_andexit();
		}
		if ($r2) {
			echo "true";
		} else {
			echo "false";
		}
	}
}