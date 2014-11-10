$(function() {
	//********************************************分割***************************************************
	//Get 传入参数  header_id   tag_id   group_id
	// 1. 全为空  显示所有Tag
	// 2. header_id == 0 或 null  tag_id == a   显示特定Tag
	// 3. header_id == 1 group_id == null 显示所有自己加入的Group
	// 4. header_id == 1 group_id == a  显示特定的Group


	//获取Get参数
	g_header_id = $.baoGetUrlParam('header_id');
	g_group_id = $.baoGetUrlParam('group_id');
	g_tag_id = $.baoGetUrlParam('tag_id');

	//全局变量items_json  存放当前页面的所有问题数据
	g_items_json = '';
	//摘要长度
	DETAILS_LENGTH = 80;
	//每次加载个数
	DETAILS_LOAD_COUNT = 3;
	//防止异步加载出错
	isLoading = false;
	//当前页面显示的Tag或者Group 的ID
	tagOrGroup_id = '';


	ajaxUrl = "";
	ajaxDataId = "";
	if (g_header_id == 0 || g_header_id == null) {
		$('#home_btn img').css('display', 'inline');
		//TODO :get Tags and add them to tab   and of course add tag_id attr
		ajaxUrl ='php/getTags.php';
		ajaxDataId = g_tag_id;

	} else if (g_header_id == 1) {
		$('#group_btn img').css('display', 'inline');
		//查看自己所有小组动态 还是  查看URL参数中的特定动态
		ajaxUrl = (g_group_id == null) ? 'php/getGroupsByUserId.php' : 'php/getGroup.php';
		ajaxDataId = (g_group_id == null) ? $.cookie().id : g_group_id;
	}

	//get Groups Or Tags and add them to tab
	$.ajax({
		url: ajaxUrl,
		type: 'POST',
		data: {
			id: ajaxDataId,
		},
	})
		.done(function(response) {
			//console.log(response);
			json = eval(response);
			//console.log(json);
			//遍历Groups  插入Tabs
			$.each(json, function(index, val) {
				item = $('<li tab_index = "' + index + '" tagOrGroup_id ="' + val.id + '""><a href="#tab_content">' + val.name + '</a></li>');
				item.appendTo($('.tabs_container ul'));
			});
			//tabs初始化
			$('.tabs_container').tabs({
				active: 0,
				show: true,
				heightStyle: 'content',
				beforeActivate: loadQuestion,
				create: loadQuestion,
			});
		});



	loadQuestion = function(event, ui) {
		g_tagOrGroup_id = (ui.newTab == undefined) ? ui.tab.attr('tagOrGroup_id') : ui.newTab.attr('tagOrGroup_id');
		console.log(g_tagOrGroup_id);
		//每次切换Tab清空数据
		g_items_json = "";
		//移除之前加载的内容
		$('.item_container').not(':first').remove();
		//首次加载
		showMoreQuestions(g_header_id, g_tagOrGroup_id);
	}

	$(window).scroll(function(event) {
		if ($(window).scrollTop() + $(window).height() == $(document).height()) {
			showMoreQuestions(g_header_id, g_tagOrGroup_id);
		}
	});



	function showMoreQuestions(header_id, tagOrGroup_id) {

		ajaxDataObj = {};

		if (header_id == 0 || header_id == null) {
			ajaxDataObj = {
				tag_id: tagOrGroup_id,
				start: g_items_json.length,
				count: DETAILS_LOAD_COUNT,
			}
		} else if (header_id == 1) {
			ajaxDataObj = {
				group_id: tagOrGroup_id,
				start: g_items_json.length,
				count: DETAILS_LOAD_COUNT,
			}
		}


		if (!isLoading) {
			isLoading = true;
			//加载页面问题内容
			$.ajax({
				url: 'php/getQuestions.php',
				type: 'POST',
				data: ajaxDataObj,
			})
				.done(function(response, status, xhr) {
					if (response != "[]") {
						json = eval("(" + response + ")");
						currentLength = g_items_json.length;
						if (g_items_json.length == 0) {
							g_items_json = json;
						} else {
							g_items_json = g_items_json.concat(json);
						}
						//console.log(json);
						//console.log(g_items_json);

						html = '';
						$.each(json, function(index, val) {
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
							html = $("<html>" + val.details + "</html>");
							details = html.text().length > DETAILS_LENGTH ? html.text().slice(0, DETAILS_LENGTH) + '... ' : html.text();

							item = index == 0 && currentLength == 0 ? $('.item_container').first() : $('.item_container').first().clone();
							//设置Index时加上前面已经有的
							//console.log("currentLength--->"+currentLength);
							//console.log("index--->"+index);
							item.attr('question_id', val.id);
							item.find('.item_title').html(val.title);
							item.find('.item_title').attr('href', 'details.html?id=' + val.id);
							item.find('.item_user').html(val.user);
							item.find('.item_date').html(time);
							item.find('.item_hot_comment').html(details);
							item.find('.item_comment_counts').html(Math.floor(Math.random() * (100)));
							item.find('.item_main').mouseenter(function(event) {
								//console.log($(this).find('.item_hot_comment').text().length);
								if ($(this).find('.item_hot_comment').text().length > DETAILS_LENGTH) {
									$(this).find('.item_hot_comment_scale').css('display', 'inline');
								}

							});
							item.find('.item_main').mouseleave(function(event) {
								$(this).find('.item_hot_comment_scale').css('display', 'none');
							});
							item.find('.item_hot_comment_scale').click(function(event) {
								//获取所点击条目的下标  从全局数据g_items_json中取得所要显示内容
								itemIndex = $(this).parents('.item_container').attr('question_id');
								// 遍历json查找ID对应
								longDetails = '';
								$.each(g_items_json, function(index, val) {
									console.log(index);
									console.log(itemIndex);
									console.log(val);
									if (val.id == itemIndex) {
										longDetails = val.details;
										//跳出循环
										return false;
									}
								});

								html = $("<html>" + longDetails + "</html>");
								shortDetails = html.text().length > DETAILS_LENGTH ? html.text().slice(0, DETAILS_LENGTH) + '... ' : html.text();
								details = $(this).text() == "显示全部" ? longDetails : shortDetails;

								$(this).parents('.item_container').find('.item_hot_comment').html(details);
								if ($(this).text() == "显示全部") {
									$(this).text("收起");
								} else {
									$(this).text("显示全部");
								}
							});


							item.appendTo('.items_container');
						});
					} else {
						//当内容已经被取完时
						$('#spinner_gray_new').hide();
						$('#item_more_new').text("没有更多内容~(≧▽≦)~啦");
					}
				}).always(function() {
					isLoading = false;
				});

		};
	} //showMoreQuestions函数结束
})