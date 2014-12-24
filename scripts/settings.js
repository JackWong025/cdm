$(function() {

    var g_user_id = $.cookie().id;

    //获取Get参数
    g_settings = $.baoGetUrlParam('settings');
    //如果是设置小组信息  则这个存放小组ID
    g_group_id = $.baoGetUrlParam('group_id');
    //$.l(g_settings);
    if (g_group_id != null) {
        console.log(g_group_id);
    } else if (g_settings == 'profile' || g_settings == null) {
        $('.settings_profile').show();
        initProfile();
    } else if (g_settings == 'avatar') {
        $('.settings_me_avatar').show();
        initAvatar();
    } else if (g_settings == 'creategroup') {
        $('.settings_creategroup').show();
        initCreategroup();
    }

    //初始化设置个人信息
    function initProfile() {
            //加载用户基本信息
            $.ajax({
                    url: $.PATH_INTERFACE + 'getUser',
                    type: 'POST',
                    data: {
                        id: g_user_id,
                    },
                })
                .done(function(response) {
                    json = eval(response);
                    //$.l(json);
                    $('#settings_user').val(json[0].user);
                    $('#settings_birthday').val(json[0].birthday);
                    $('#settings_details').val(json[0].details);

                })
                .fail(function() {
                    console.log("error");
                });
            //从数据库设置学校以及专业列表  看来这两个要先加载
            $('#settings_uni,#settings_major,#settings_gender').chosen({
                no_results_text: '(*^__^*)没有找到..'
            });


            //初始化生日选择框
            var date = new Date(1994, 7, 3);
            $('#settings_birthday').datepicker({
                changeMonth: true,
                changeYear: true,
                defaultDate: date,
                yearRange: "1900:c",
                hideIfNotPrevNext: true,
                maxDate: 0,
            });


            //初始化修改资料错误信息提示
            $(".settings_profile_form").validate({
                onkeyup: false,
                success: function(label) {
                    label.addClass('input_vaild').text("");
                },
                rules: {
                    settings_user: {
                        required: true,
                        rangelength: [2, 10],
                    },
                    settings_details: {
                        required: true,
                        rangelength: [2, 20],
                    },
                    settings_birthday: {
                        required: true,
                    },
                },
                messages: {

                },
                submitHandler: function(formEle) {
                    //$.showLoadDialog('跳转中...');
                    $.ajax({
                            url: $.PATH_INTERFACE + 'updateUser.php',
                            type: 'POST',
                            data: $('.settings_profile_form').serialize() + "&settings_id=" + g_user_id
                        })
                        .done(function(response, status) {
                            //alert('注册返回：'+response);
                            if (response == "true") {
                                $.showOKDialog("修改成功");
                                setTimeout(function() {
                                    window.location = "home.php";
                                }, 700);
                            } else {
                                $.showErrorDialog("操作失败");
                            }
                        })
                        .fail(function() {
                            console.log("error");
                            $.showErrorDialog("网络错误");
                        });
                },
            });


        }
        //初始化头像的设置
    function initAvatar() {
        $.showAvatar($('.settings_avatar_img'), g_user_id, "origin");
        
        var formData = new FormData();
        formData.append('type', 'avatar');
        formData.append('id', g_user_id);
        $.imageSelectAndUpload(formData,'settings_me_avatar_file','settings_me_avatar_new','settings_avatar_submit',$.PATH_INTERFACE + 'addImage.php','home.php');

    }

    function initCreategroup() {
        var formData = new FormData();
        formData.append('id', g_user_id);
        $.imageSelectAndUpload(formData,'settings_group_avatar_file','settings_group_avatar_new','settings_avatar_submit',$.PATH_INTERFACE + 'addImage.php','home.php');
    }

})
