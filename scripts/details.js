$(function() {
    //Git JackWong025 ~2
    //全局变量
    //接收Get参数  显示文章内容
    g_question_id = $.baoGetUrlParam('id');
    comments_json = '';
    hasQuestionShow = false;
    isLoading = false;
    //初始化按钮
    $('.comment_btn_ok').button();
    $('.comment_btn_cancel').button();

    $('.comment_btn').click(function(event) {
        /* Act on the event */
        $('.comment_input_con').slideDown();
        $('.comment_btn').hide('400');
    });
    $('.comment_btn_cancel').click(function(event) {
        /* Act on the event */
        $('.comment_input_con').slideUp();
        $('.comment_btn').show('400');
    });


    //初始化load对话框
    $('#dia_load').dialog({
        autoOpen: false,
        modal: true,
        closeOnEscape: false,
        resizable: false,
        draggable: false,
        width: 180,
        height: 50
    }).dialog('widget').find('.ui-widget-header').hide();



    //提交评论
    $('.comment_btn_ok').click(function(event) {
        $.showLoadDialog('提交中...');
        $.ajax({
                url: 'interfaces/addComment.php',
                type: 'POST',
                data: {
                    question_id: g_question_id,
                    user_id: $.cookie().id,
                    details: $(".comment_content").val(),
                },
            })
            .done(function(response) {
                if (response != "false") {
                    $.showOKDialog('回复成功', function() {
                        $('.comment_input_con').slideUp();
                        $('.comment_btn').show('400');
                        window.history.go(0);
                    });

                } else {
                    $.showErrorDialog('网络错误');
                }
            })
            .fail(function() {
                $.showErrorDialog('网络错误');
            });

    });


    //首次加载 
    showMoreComment();

    $('#item_more_new').click(function(event) {
        $('#spinner_gray_new').css('display', 'inline-block');
        $('#item_more_new span').text("嘿咻~嘿咻 ↖(^ω^)↗");
        showMoreComment();
    });


    function showMoreComment() {
        //console.log(id);
        if (!isLoading) {
            //防止异步加载出错
            isLoading = true;
            $.ajax({
                    url: 'interfaces/getQuestionAndComments.php',
                    type: 'POST',
                    data: {
                        id: g_question_id,
                        start: comments_json.length,
                        count: $.BAO_COMMENT_LOAD_COUNT,
                    },
                })
                .done(function(response, status, xhr) {
                    if (response != "[]") {
                        json = eval("(" + response + ")");
                        //console.log(json);

                        if (json.length < $.BAO_COMMENT_LOAD_COUNT) {
                            //当内容已经被取完时
                            $('#item_more_new span').text("没有更多内容~(≧▽≦)~啦");
                        } else {
                            $('#item_more_new span').text("点我加载更多(*^__^*)");
                        }


                        //防止重复加载
                        if (!hasQuestionShow) {
                            //加载问题内容
                            //处理距离现在日期
                            time = $.getTimeByDateTime(json.question[0].date);

                            $('title').html(json.question[0].title);
                            $('.details_title_content').html(json.question[0].title);
                            $('.question_user').html(json.question[0].user);
                            $('.question_date').html(time);
                            $('.details_avatar_a').attr('href', 'home.php?user_id=' + json.question[0].user_id);
                            $('.details_avatar_a,.question_user').attr('toolkit_id', json.question[0].user_id);
                            //显示头像
                            $.showAvatar($('.details_avatar'), json.question[0].user_id, 128);
                            $('.question_user').attr('href', 'home.php?user_id=' + json.question[0].user_id);
                            $('.details_question_main').html(json.question[0].details);
                            $('.details_comments_count').html(json.comments_count);
                            hasQuestionShow = true;

                            //显示文章作者小组
                            $.showGroupsInfo(json.question[0].user_id, $('#details_con').find('.details_groups'));
                            //显示文章所属Tag
                            showTagsInfo(json.question[0].id);

                        }

                        //加载评论内容
                        currentLength = comments_json.length;
                        if (comments_json.length == 0) {
                            comments_json = json.comments;
                        } else {
                            comments_json = comments_json.concat(json.comments);
                        }
                        $.each(json.comments, function(index, val) {
                            //处理距离现在日期
                            date = new Date(val.date);
                            now = new Date();
                            time = '';
                            if ((now - date) / 60000 < 60) {
                                time = Math.floor((now - date) / 60000) + '分钟';
                            } else if ((now - date) / (60000 * 60) < 24) {
                                time = Math.floor((now - date) / (60000 * 60)) + '小时';
                            } else {
                                time = Math.floor((now - date) / (60000 * 60 * 24)) + '天';
                            }

                            item = index == 0 && currentLength == 0 ? $('.comment_con').first() : $('.comment_con').first().clone();

                            item.find(".group_item").remove();
                            //console.log("currentLength--->"+currentLength);
                            //console.log(val);
                            item.attr('comment_id', val.id);
                            item.find('.comment_main').html(val.details);
                            item.find('.item_user').html(val.user);
                            item.find('.comment_avatar_and_user').attr("toolkit_id",val.user_id);
                            item.find('.comment_avatar_a').attr('href', 'home.php?user_id=' + val.user_id);
                            //显示头像
                            $.showAvatar(item.find('.comment_avatar'),val.user_id,128);
                            item.find('.item_user').attr('href', 'home.php?user_id=' + val.user_id);
                            item.find('.item_date').html(time);
                            item.find('.comment_index').html(currentLength + index + 1);
                            //显示评论作者小组
                            $.showGroupsInfo(val.user_id, item.find('.details_groups'));

                            item.appendTo('.comments_con');
                            item.addClass('animated flipInX');

                        });

                        if (json.comments.length == 0) {
                            if (comments_json.length == 0) {
                                //当未有评论时
                                $('.comment_con').remove();
                            }
                            //当内容已经被取完时
                            $('#spinner_gray_new').hide();
                            $('#item_more_new span').text("没有更多内容~(≧▽≦)~啦");
                        }
                    }

                    //每次showMore之后更新绑定
                    $.updateShowToolKit();

                })
                .always(function() {
                    $('#spinner_gray_new').hide();
                    isLoading = false;
                })
        }
    }



    function showTagsInfo(question_id) {
        $.ajax({
                url: 'interfaces/getTagsByQuestionId.php',
                type: 'POST',
                data: {
                    id: question_id
                },
            })
            .done(function(response) {
                json = eval("(" + response + ")");
                //console.log(json);
                $.each(json, function(index, val) {
                    item = $('<a class="tag_item"></a>');
                    item.attr('href', "index.php?header_id=0&tag_id=" + val.id);
                    item.attr('tag_id', val.id);
                    item.html(val.name);
                    item.insertBefore('.details_title_content');
                });
            });
    }

})
