<?php 
/*

	@param $_POST['start'] 查询起始点 必须
	@param $_POST['count'] 查询个数 必须

	//下三个参数都为空时返回所有问题, 三个之中至多只能有一个不为空
	@param $_POST['tag_id'] 
	@param $_POST['group_id'] 
	@param $_POST['user_id'] 
*/

	require'config.php';
	$start = $_POST['start'];
	$count = $_POST['count'];
	$sql = "";


	if($_POST['tag_id'] != null){
		//以TAG作为筛选基准
		$tag_id = $_POST['tag_id'];
		$sql = "SELECT (SELECT user FROM users WHERE q.user_id=id) AS user,user_id,q.id,q.title,q.details,q.date FROM questions q join (SELECT q.id from questions q join rel_question_tag r on r.question_id = q.id where r.tag_id = $tag_id) b on q.id = b.id ORDER BY q.date DESC LIMIT $start,$count";

	}elseif ($_POST['group_id'] != null) {
		//以GROUP作为筛选基准
		$group_id = $_POST['group_id'];
		$sql = "SELECT (SELECT user FROM users WHERE q.user_id=id) as user,user_id,q.id,q.title,q.details,q.date from questions q join (SELECT u.id from users u join rel_user_group r on r.user_id = u.id where r.group_id = $group_id) b on q.user_id=b.id order by q.date DESC LIMIT $start,$count";
	}elseif ($_POST['user_id'] != null) {
		$user_id = $_POST['user_id'];
		$sql = "SELECT title,id,date from questions where user_id = $user_id order by date DESC";
	}
	else{
		$sql = "SELECT (SELECT user FROM users WHERE q.user_id=id) AS user,user_id,id,title,details,date FROM questions q ORDER BY date DESC LIMIT $start,$count";
	}



	$query = mysql_query($sql) or die ('SQL错误'.mysql_error());
	echo get_json_from_query($query);
	mysql_close();



 ?>