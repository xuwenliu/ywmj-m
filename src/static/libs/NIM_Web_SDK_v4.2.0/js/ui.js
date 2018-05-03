
var appUI = {
    /**
     * 当前会话聊天面板UI
     */
    buildChatContentUI: function (id, cache) { //sessionId=team-145926936,nimCache
        var msgHtml = "",
            msgs = cache.msgs[id];
        if (msgs.length === 0) {
            msgHtml = '<div class="no-msg tc"><span class="radius5px">暂无消息</span></div>';
        } else {
            for (var i = msgs.length<20?0:msgs.length-18, l = msgs.length; i < l; ++i) { //手动设置了20
                var message = msgs[i],
                    user = cache.usersObj&&cache.usersObj[msgs.from];
                if (message.attach && message.attach.netcallType !== undefined && (message.attach.type !== 'netcallBill' && message.attach.type !== "netcallMiss")) {
                    // 隐藏掉netcall相关的系统消息
                    continue;
                }
                //消息时间显示
                if (i == 0) {
                    msgHtml += this.makeTimeTag(transTime(message.time));
                } else {
                    if (message.time - msgs[i - 1].time > 5 * 60 * 1000) {
                        msgHtml += this.makeTimeTag(transTime(message.time));
                    }
                }
                msgHtml += this.makeChatContent(message, user);
            }
        }
        return msgHtml;
    },

    /**
     * 更新当前会话聊天面板UI
     */
    updateChatContentUI: function (msg, cache) {  //nimCache.msgs,nimCache
        var lastItem = $("#chatContentList .item").last(),
            msgHtml = "",
            user = cache.usersObj&&cache.usersObj[msg.from];//
        var message = msg;
        if (message.attach && message.attach.netcallType !== undefined && (message.attach.type !== 'netcallBill' && message.attach.type !== "netcallMiss")) return ''; // 隐藏掉netcall相关的系统消息
        if (lastItem.length == 0) {
            msgHtml += this.makeTimeTag(transTime(msg.time));
        } else {
            if (msg.time - parseInt(lastItem.attr('data-time')) > 5 * 60 * 1000) {
                msgHtml += this.makeTimeTag(transTime(msg.time));
            }
        }
        msgHtml += this.makeChatContent(msg, user);
        return msgHtml;
    },

    /**
     * 通用消息内容UI
     */
     makeChatContent: function (message, user) {
        var msgHtml;
        //通知类消息

        if (message.attach && message.attach.type && (message.attach.netcallType === undefined || (message.attach.type !== "netcallBill" && message.attach.type !== "netcallMiss"))) {
            if (message.attach.netcallType !== undefined) return ''; // 隐藏掉netcall相关的系统通知消息
            var notificationText = transNotification(message);
            msgHtml = '<p class="u-notice tc item" data-time="' + message.time + '" data-id="' + message.idClient + '" data-idServer="' + message.idServer + '"><span class="radius5px">' + notificationText + '</span></p>';
        } else {
            //聊天消息
            var type = message.type,
                from = message.from,
                avatar = user&&user.avatar,
                showNick = message.scene === 'team' && from !== userUID,
                msgHtml;
            if (type === "tip") {
                msgHtml = ['<div data-time="' + message.time + '" data-id="' + message.idClient + '" id="' + message.idClient + '" data-idServer="' + message.idServer + '">',
                '<p class="u-notice tc item ' + (from == userUID && message.idServer ? "j-msgTip" : "") + '" data-time="' + message.time + '" data-id="' + message.idClient + '" data-idServer="' + message.idServer + '"><span class="radius5px">' + getMessage(message) + '</span></p>',
                    '</div>'].join('');
            } else {
                msgHtml = ['<div data-time="' + message.time + '" data-id="' + message.idClient + '" id="' + message.idClient + '" data-idServer="' + message.idServer + '" class="item item-' + (showNick?"you":buildSender(message)) + '">',//做了强行判断
                '<img class="img j-img" src="' + getAvatar(avatar) + '" data-account="' + from + '"/>',
                showNick ? '<p class="nick">' + getNick(from) + '</p>' : '',
                    '<div class="msg msg-text j-msg">',
                    '<div class="box">',
                    '<div class="cnt">',
                getMessage(message),
                    '</div>',
                    '</div>',
                    '</div>',
                message.status === "fail" ? '<span class="error j-resend" data-session="' + message.sessionId + '" data-id="' + message.idClient + '"><i class="icon icon-error"></i>发送失败,点击重发</span>' : '',
                    '<span class="readMsg"><i></i>已读</span>',
                    '</div>'].join('');
            }
        }
        return msgHtml;

    },

    /**
     * 云记录面板UI
     */
    buildCloudMsgUI: function (msg, cache) {//nimCache.msgs,nimCache
        var msgHtml = '',
            len = msg.length,
            meessage;
        for (var i = len - 1; i >= 0; --i) {
            message = msg[i];
            if (i == (len - 1)) {
                msgHtml += this.makeTimeTag(transTime(message.time));
            } else {
                if (message.time - msg[i + 1].time > 5 * 60 * 1000) {
                    msgHtml += this.makeTimeTag(transTime(message.time));
                }
            }
            msgHtml += this.makeChatContent(message, cache.usersObj&&cache.usersObj[message.from])
        }
        return msgHtml;
    },

    /**
     * 群成员列表
     */
    buildteamMemberUI: function (list) {
        list.nick = getNick(list.account);
        list.nick = list.nick === list.account ? "" : list.nick;
        return ['<li data-icon="' + list.avatar + '" data-account="' + list.account + '" data-nick="' + (list.nick || list.name || list.account) + '">',
            '<i class="icon icon-radio"></i>',
        '<img src="' + getAvatar(list.avatar) + '">',
        '<span class="name">' + (list.nick || list.name || list.account) + '</span>',
            '</li>'].join('');
    },

    /**
     * 黑名单
     */
    buildBlacklist: function (data, cache) {//nimCache.msgs,nimCache
        var html = "";
        if (data.length === 0) {
            return '';
        }
        for (var i = 0; i < data.length; i++) {
            var user = cache.getUserById(data[i].account);
            html += ['<li class="items f-cb">',
                '<img src="' + getAvatar(user.avatar) + '" class="head">',
                '<span class="nick">' + user.nick + '</span>',
                '<button class="btn radius4px btn-ok j-rm" data-id="' + user.account + '">解除</button>',
                '</li>'].join('');
        }
        return html;
    },

    /**
     * 系统消息
     */
    buildSysMsgs: function (data, cache) {
        var html = "",
            item,
            team,
            action,
            content;
        if (data.length === 0) {
            return '';
        }
        for (var i = 0; i < data.length; i++) {
            item = data[i];
            if (item.category == "team") {
                team = item.attach ? item.attach.team : cache.getTeamMapById(item.to);
                //拿不到群信息就过滤吧
                if (!team) {
                    continue;
                }
                if (item.type === "teamInvite") {
                    content = getNick(item.from) + "邀请你入群";
                    if (item.state === "init") {
                        action = '<a class="j-apply">同意</a><a class="j-reject">拒绝</a>';
                    } else if (item.state === "rejected") {
                        action = '已拒绝';
                    } else if (item.state === "passed") {
                        action = '已同意';
                    } else {
                        action = '已失效';
                    }
                } else if (item.type === "applyTeam") {
                    content = getNick(item.from) + "申请加入群";
                    if (item.state === "init") {
                        action = '<a class="j-apply">同意</a><a class="j-reject">拒绝</a>';
                    } else if (item.state === "rejected") {
                        action = '已拒绝';
                    } else if (item.state === "passed") {
                        action = '已同意';
                    } else {
                        action = '已失效';
                    }
                } else if (item.type === "rejectTeamApply" || item.type === "rejectTeamInvite") {
                    content = getNick(item.from) + "拒绝了你的入群邀请";
                    action = '已拒绝';;
                } else {
                    content = "未知";
                    action = "";
                }
                html += ['<div class="item">',
                    '<img src="images/advanced.png">',
                    '<div class="text">',
                    '<p><span>' + (team ? team.name : item.to) + '</span><b class="time">' + transTime2(item.time) + '</b></p>',
                    '<p><span class="first-msg">' + content + '</span><b class="action" data-type="' + item.type + '" data-idServer="' + item.idServer + '" data-id="' + team.teamId + '" data-from="' + item.from + '">' + action + '</b></p>',
                    '</div>',
                    '</div>'].join('');
            } else if (item.category == "friend") {
                //处理好友的系统通知
                //本demo为了方便演示默认加好友直接通过，好友的系统通知不处理
            }
        }
        return html;
    },
    // 自定义系统通知
    buildCustomSysMsgs: function (data, cache) {
        var html = "",
            content,
            from,
            scene,
            to,
            nick,
            avatar;
        if (data.length === 0) {
            return html;
        }
        data = data.sort(function (a, b) {
            return b.time - a.time;
        });
        for (var i = 0; i < data.length; i++) {
            scene = data[i].scene;
            content = JSON.parse(data[i].content).content;
            from = data[i].from;
            to = data[i].to;
            if (scene === "p2p") {
                nick = getNick(from);
                avatar = getAvatar(cache.getUserById(from) ? cache.getUserById(from).avatar : "");
            } else {
                var teamInfo = cache.getTeamById(to + "");
                if (teamInfo) {
                    nick = teamInfo.name + "-->" + getNick(from);
                    avatar = "images/" + teamInfo.type + ".png";
                } else {
                    nick = to + "-->" + getNick(from);
                    avatar = "images/normal.png";
                }
            }
            html += ['<div class="item">',
                '<img src="' + avatar + '">',
                '<div class="text">',
                '<p><span>' + nick + '</span><b class="time">' + transTime2(data[i].time) + '</b></p>',
                '<p><span class="first-msg">' + content + '</span></p>',
                '</div>',
                '</div>'].join('');
        }
        return html;
    },
    //聊天消息中的时间显示
    makeTimeTag: function (time) {
        return '<p class="u-msgTime">- - - - -&nbsp;' + time + '&nbsp;- -- - -</p>';
    },
    // 多人音视频列表
    buildmeetingMemberUI: function (data) {
        // data.nick = getNick(data.account);
        data.avatar = getAvatar(data.avatar);
        data.avatar = /default-icon\.png/gi.test(data.avatar) ? "" : data.avatar;
        return '<li class="item loading" style="'+ (data.avatar ? 'background-image:url(' + data.avatar + ')' : '') + '" data-account=' + data.account + '>'+
                    '<span class="fullScreenIcon" title="切换全屏">&nbsp;</span>'+
                    '<span class="tip"><i></i><i></i><i></i></span>'+
                    '<p class="name" data-account="' + data.account + '">' + data.nick + '</p>'+
                    '<p class="volume-show" style="width:0"></p>'+
                '</li>';
    },
    // 多人禁言ui
    buildspeakBanUI: function(data){
        data.nick = getNick(data.account);
        data.nick = data.nick === data.account ? "" : data.nick;
        return '<li data-icon="' + data.avatar +'" data-account="' + data.account + '" data-nick="' + (data.nick || data.name || data.account) + '">' +
                    '<i class="icon-control icon-micro"></i>' +
                    '<img src="' + getAvatar(data.avatar) + '">' +
                    '<span class="name">' + (data.nick || data.name || data.account) + '</span>' +
                '</li>';
    }

}