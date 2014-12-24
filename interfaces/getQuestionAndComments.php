<?php
/*
@param $_POST['id'] 查询方式为1  指定的ID
评论加载个数
@param $_POST['start'] 查询起始点 必须
@param $_POST['count'] 查询个数 必须
 */

require_once '../require.php';
$start = $_POST['start'];
$count = $_POST['count'];
$question_id = $_POST['id'];

//问题
$question_sql = "SELECT (SELECT user FROM users WHERE a.user_id=id) AS user,id,user_id,title,details,date FROM questions a WHERE id=$question_id";
$question_json = get_json_from_sql($question_sql);

//评论$start $count来限制个数
$comments_sql = "SELECT (SELECT user FROM users WHERE a.user_id=id) AS user,user_id,
	details,date FROM comments a WHERE question_id=$question_id  ORDER BY date DESC LIMIT $start,$count";
$comments_json = get_json_from_sql($comments_sql);

//评论的总数
$count_sql = "SELECT id from comments WHERE question_id = $question_id";
$comments_count = mydb_getResultNum($count_sql);

echo '{"question":' . $question_json . ',"comments":' . $comments_json . ',"comments_count":' . $comments_count . "}";
mysql_close();

