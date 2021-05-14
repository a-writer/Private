/*
    fileName:       main.js
    name:           自用博客脚本
    description:    背景图片与matomo等项目初始化、异常处理等
    create:         2020/09/17
    version:        2020/05/12
    By:             a-writer
    Url:            https://github.com/a-writer/Private/
*/
/*
检测jquery加载：isExitsFunction('$')
检测Browser加载：isExitsFunction('Browser')
20200512：
    接入Sentry
    调整修复CF信息问题
    修改图片
20200917：
    合并old版本两个文件，整合为v1版；
    修复CloudflareInfo的callback在trace请求失败不触发的问题；
    分离imgErrorIgnore上报功能，上报会执行reportingImgError(imgUrl,baseUrl)命令；
    增加CloudflareInfo对机场代码的解析；
    修复重复调用pageInit4matomo初始化的问题
20200918：
    修复$.get.error错误问题，在3.5.1中更换为fail
    增加CloudflareInfo机场代码洲别信息
    *预定任务：更新背景图片组

*/
/*总初始化*/
function pageInit4blog(){
    console.log('Private：','pageInit4blog已开始执行');
    
    $('.powered-by').html('由 <a target="_blank" href="https://cn.wordpress.org/">WordPress</a> & <a target="_blank" href="https://www.cloudflare.com">Cloudflare</a> & <a target="_blank" href="https://www.jsdelivr.com/">jsdelivr</a> 联合强力驱动');/*不修改主题只能这样了*/
    
    var u='\x2f\x2f\x73\x31\x2e\x66\x65\x6e\x67\x6c\x65\x74\x69\x61\x6e\x2e\x63\x6e\x2f';
    _paq.push(['setTrackerUrl',u+'\x6d\x61\x74\x6f\x6d\x6f\x2e\x70\x68\x70']);/*防止广告过滤器*/
    var d=document,w=window,g=d.createElement('script'),s=d.getElementsByTagName('script')[0];g.type='text/javascript';g.async=true;g.defer=true;g.src=u+'matomo.js';s.parentNode.insertBefore(g,s);/*初始化统计JS与bgImg列表*/
    
    w.bgImg = [];/*背景图片地址数组*/
    
    $('div form#searchform[action]').removeAttr('action');/*移除搜索action，都不知道从何而来*/
    
    if(isExitsFunction('Browser')){/*检测Browser是否加载，加载则启用bInfo*/
        try{
            w.bInfo = new Browser();
            w.browserName = w.bInfo.browser;
        }catch(e){
            w.bInfo = [];
            w.bInfo.device = 'Mobile';/*默认手机党*/
            w.browserName = '未知';
        }
    }
    if(isExitsFunction('$') && isExitsFunction('CloudflareInfo')){
        CloudflareInfo('.footer-inner',function(type){
            if(type==false){/*获取失败*/
                w.Cloudflare = false;
                w.cfRailgun = false;
                w.CloudflareIp = 'Un';
            }
            pageInit4after();
        });
    }else{/*未知异常*/
        w.Cloudflare = 'cannot';
        w.cfRailgun = 'cannot';
        w.CloudflareIp = 'Un';
        pageInit4after();
    }
}
/*后续初始化*/
function pageInit4after(){
    window.matomo_id = 'Default';
    
    pageInit4matomo();
    pageInit4sentry();
    
    if(isExitsFunction('imgErrorIgnore')){
        /*$("img").live("error",imgErrorIgnore);已经弃用*/
        console.log('图片错误捕捉已创建');
        $('body').on('error', 'img', imgErrorIgnore);/*注意，bmqy自带的jq（2.1.3）无效，需要升级3.5.1的jq*/
    }
    
    if(window.bInfo.device != 'Mobile'){/*非手机端，照顾手机端小流量\限速党*/
        pageInit4bg();
        setTimeout(function(){pageInit4jsdelivr();}, 240000);/*页面完全加载超过240s(4分钟)才进行jsdelivr服务质量检测*/
    }
    
}

/*报错拦截平台*/
function pageInit4sentry(){
    $.getScript('https://cdn.jsdelivr.net/combine/npm/@sentry/browser@6.3.6/build/bundle.min.js,npm/@sentry/tracing@6.3.6/build/bundle.tracing.min.js').done(function(script, textStatus) {
    if (textStatus == "success") {
        window.SentryDia = false;
        Sentry.init({
            dsn: 'https://47583df709d74f9caa98e003a128b815@sentry.fengletian.cn/5',
            beforeSend(event, hint) {
              if (event.exception) {
                if(window.SentryDia){
                    Sentry.showReportDialog({ eventId: event.event_id });
                }
              }
              return event;
            }
        });
        Sentry.configureScope(function (scope) {
            scope.setUser({
                matomo_id: window.matomo_id,
            });
        });
    }
    console.log('Sentry',textStatus);
    }).fail(function() {
    console.log('Sentry', 'fail');
    });
}
/*统计初始化*/
function pageInit4matomo(){
    /*上报Cloudflare检测信息*/
    /*console.log(1, window.Cloudflare, window.cfRailgun, window.CloudflareIp);*/
    try{_paq.push(['setCustomVariable', 1, 'browser', window.browserName, 'visit']);/*上报浏览器类型*/}catch(e){}
    try{_paq.push(['setCustomVariable', 2, 'Cloudflare', window.Cloudflare, 'visit']);}catch(e){}
    try{_paq.push(['setCustomVariable', 3, 'cfRailgun', window.cfRailgun, 'visit']);}catch(e){}
    try{_paq.push(['setCustomVariable', 4, 'cfIp', window.CloudflareIp, 'visit']);}catch(e){}
    try{_paq.push([ function () { window.matomo_id = this.getVisitorId(); }]);}catch(e){}
    /*增加crx等下载类型*/
    _paq.push(['addDownloadExtensions', "crx|mkv|ass|flac|cue|log"]);
    /*设置统计暂停计时器 当用户单击下载文件或单击出站链接时，Matomo会记录该点击，为了保证上传成功，它会在用户重定向到所请求的文件或链接之前增加一个小的延迟。*/
    _paq.push(['setLinkTrackingTimer', 1888]);
    if(isExitsFunction('$')){
        $('.footer-inner').append('<div>' + window.browserName + '用户你好，继续浏览即代表您同意本站使用Cookies.</div>');
    }
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    _paq.push(['enableHeartBeatTimer',20]);
}
/*背景初始化*/
function pageInit4bg(){
    setCXimg({
        '1':['https://qn-next.xuetangx.com/','http://i0.hdslb.com/bfs/album/'],
        '3':['.jpg','.png','.gif'],
        'Tag':['不是排名，不分先后。',
            '1梅普露&莎莉',
            '2莎莉',
            '3御坂美琴0502',
            '4盾娘4人组',
            '5芙蕾德丽卡',
            '6白井黑子0714',
            '7佐天泪子0310',
            '8梅普露',
            '9初春饰利0105',
            '10超炮4人组',
            '11丈枪由纪0405',
            '12惠飞须泽胡桃0807',
            '13若狭悠里1011',
            '14平泽唯1127',
            '15秋山澪0115',
            '16田井中律0821',
            '17琴吹䌷0702',
            '18中野梓1111',
            '19平泽忧0222',
            '20山中佐和子0131',
        ],
        'url':[
            ['0714',0,'15872815721833',0,'#6'],
        ]
    });
    setTimeout(function(){reSetBg();}, 4100);/*setCXimg超时为4000ms，100ms后加载成功的图片将作为背景*/
}
/* * * * * * * * * 功能集合 * * * * * * * * */
/*jsdelivr Contribute Performance Data 用于jsdelivr对cdn服务商进行网络测试*/
function pageInit4jsdelivr(){
    var j = document.createElement('script');
    j.type='text/javascript';
    j.async=true;
    j.defer=true;
    j.src = 'https://cdn.jsdelivr.net/npm/perfops-rom';
    document.body.appendChild(j);
}
/*增加日期格式化函数*/
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
/*检测图片地址是否可用*/
function testBGImgUrl(url){
    var img = document.createElement("img");
    img.src = url;
    img.style = 'display:none';
    img.class = 'bgImgTest';
    img.onload = function(){
        window.bgImg.push(this.src);
    };
    setTimeout(function(){img.removeAttribute('src');},4000);/*4秒后自动移除src属性即停止加载，另类判断图片地址状态*/
}
/*检测图片地址是否可用2*/
function testBGImgUrl2(url){
    var img = $('<img>',{
        name: 'bgImgTest',
        class: 'bgImgTest',
        style: 'display:none',
    });
    /*$('body').append(img);*/
    img.on('error', imgErrorIgnore);
    img.on('load', function(){window.bgImg.push(this.src);});
    img.attr('src', url);
    setTimeout(function(){img.removeAttr('src');},4000);/*4秒后自动移除src属性即停止加载，另类判断图片地址状态*/
}
/*设置背景图片*/
function reSetBg(){
    if(window.bgImg.length > 0){/*fix"No images were supplied for Backstretch"*/
        window.bgImg.sort(function(){ return 0.5 - Math.random() });/*展示顺序打乱*/
        $.backstretch(window.bgImg,{duration:3000});
    }
}
/*设置背景图片展示
功能：外链拼接与生日唯一展示*/
function setCXimg(arr){
    /*
    arr组合方式：
    {
        "1":["http://","https://"],
        "3":["/?s=","/s?wd="],
        "url":[ //注释：除第一个值为4位生日数字如【0419】，其余值为字符串时按字符串算，为整数时按整数变量叠加(由0开始)，最后一个为#开头时将忽略不组合进网址单独作为备注值使用。这个注释可能不好理解，看下面的样例吧，希望未来不要忘记..
            ['',1,"exp.com",0], //注释：数组1的第1个,"exp.com",数组2的第0个,组合起来即"https://exp.com/?s=",无限长度叠加
            ['0419',0,"exp.com",1], //注释：数组0的第0个,"exp.com",数组2的第1个,组合起来即"http://exp.com/s?wd=",无限长度叠加
        ]
    }
    */
    var stop = false;
    var c = 1;
    /*    while过程
    次数    c    过程
    1        0    匹配今天专属展示的图片组合外链，不存在则进入下一轮
    2        1    组合所有图片外链
    */
    while(!stop){
        for(j=0,len=arr['url'].length;j<len;j++){
            var objArr = arr['url'][j];
            var objUrl = '';
            for(i=0,slen=objArr.length;i<slen;i++){
                if(c === 1 && i === 0){
                    /*首次执行则进行生日判断*/
                    if(new Date().format('MMdd')!==objArr[i]){break;/*生日信息不对则跳过*/}
                }
                if(i === 0){continue;/*跳过生日段*/}
                if(i === (slen-1)){if(objArr[i].substring(0,1)==='#'){continue;/*最后一个值为#开头时忽略*/}}
                stop = true;
                if(typeof(objArr[i])=='string'){
                    objUrl += objArr[i];/*字符串则直接增尾*/
                }else{
                    objUrl += arr[i][objArr[i]];/*整数型则调用对应的变量*/
                }
            }
            if(objUrl!==''){
                testBGImgUrl2(objUrl);
            }
        }
        if(c > 1){stop = true;break;}
        c++;
    }
}
/*获取并显示Cloudflare节点名与访客IP
食用方法：CloudflareInfo(".footer-inner",function(ret){alert("检测完成"+ret);});
callback仅在trace失败时返回false
*/
function CloudflareInfo(selector,callback){
    $.get("/cdn-cgi/trace",
    function(data) {
        try{
            var sip = data.match(/(ip=?)(\S*)/)[2], str = data.match(/(colo=?)(\S*)/)[2];
        }catch(e){
            console.error('Private：','捕获异常：Cloudflare trace失败，无法匹配.');
            window.Cloudflare = false;
            window.CloudflareIp = 'Unknow';
            if(typeof callback == "function"){callback(false);}
            return;
        }
        window.Cloudflare = true;
        window.CloudflareIp = sip;
        var every = [
        /*以下数据来源https://www.cloudflarestatus.com/，摘录一些常见节点*/
            ['AMS', '欧洲,荷兰,阿姆斯特丹'],
            ['BWN', '亚洲,文莱'],
            ['CGP', '亚洲,孟加拉,吉大港'],
            ['ARN', '欧洲,瑞典,斯德哥尔摩'],
            ['ZRH', '欧洲,瑞士,苏黎世'],
            ['DME', '欧洲,俄罗斯,莫斯科'],
            ['MUC', '欧洲,德国,慕尼黑'],
            ['MXP', '欧洲,意大利,米兰'],
            ['MRS', '欧洲,法国,马赛'],
            ['MAN', '欧洲,英国,曼彻斯特'],
            ['HAM', '欧洲,德国,汉堡'],
            ['HEL', '欧洲,芬兰,赫尔辛基'],
            ['PNH', '亚洲,柬埔寨,金边'],
            ['DEL', '亚洲,印度,新德里'],
            ['NRT', '亚洲,日本,东京'],
            ['KIX', '亚洲,日本,大阪'],
            ['ICN', '亚洲,韩国,首尔'],
            ['LHR', '欧洲,英国,伦敦'],
            ['SIN', '亚洲,新加坡'],
            ['CDG', '欧洲,法国,巴黎'],
            ['FRA', '欧洲,德国,法兰克福'],
            ['KUL', '亚洲,马来西亚,吉隆坡'],
            ['JHB', '亚洲,马来西亚,新山'],
            ['MLE', '亚洲,马尔代夫,马累'],
            ['LAX', '北美洲,美国,洛杉矶'],
            ['SJC', '北美洲,美国,圣何塞'],
            ['BOS', '北美洲,美国,波士顿'],
            ['KBP', '欧洲,乌克兰,基辅'],
            ['PRG', '欧洲,捷克,布拉格'],
            ['KHI', '亚洲,巴基斯坦,卡拉奇'],
            ['BLR', '亚洲,印度,班加罗尔'],
            ['CEB', '亚洲,菲律宾,宿雾'],
            ['BKK', '亚洲,泰国,曼谷'],
            ['VTE', '亚洲,老挝,万象'],
            ['TNR', '非洲,马达加斯加,塔那那利佛'],
            ['CPT', '非洲,南非,开普敦'],
            ['CMN', '非洲,摩洛哥,卡萨布兰卡'],
            ['DKR', '非洲,塞内加尔,达喀尔'],
            ['DAR', '非洲,坦桑尼亚,达累斯萨拉姆'],
            ['SOF', '欧洲,保加利亚,索非亚'],
            ['TLL', '欧洲,爱沙尼亚,塔林'],
            ['HKG', '香港'],
            ['MFM', '澳门'],
            ['TPE', '台北'],
            ['CTU', 'B成都'], /*B开头为百度节点*/
            ['CKG', 'B重庆'],
            ['SZX', 'B东莞'],
            ['FUO', 'B佛山'],
            ['FOC', 'B福州'],
            ['CAN', 'B广州'],
            ['HGH', 'B杭州'],
            ['HNY', 'B衡阳'],
            ['TNA', 'B济南'],
            ['NAY', 'B廊坊'],
            ['LYA', 'B洛阳'],
            ['NNG', 'B南宁'],
            ['TAO', 'B青岛'],
            ['SHA', 'B上海'],
            ['SHE', 'B沈阳'],
            ['SJW', 'B石家庄'],
            ['SZV', 'B苏州'],
            ['TSN', 'B天津'],
            ['WUH', 'B武汉'],
            ['WUX', 'B无锡'],
            ['XIY', 'B西安'],
            ['CGO', 'B郑州'],
            ['CSX', 'B株洲'],/*cloudflarestatus为[Zuzhou, China - (CSX)]拼音漏字了估计是？*/
        ];
        for (var i = 0; i < every.length; i++) {
            if (str == every[i][0]) {
                str = every[i][1];
                if(str.substring(0,1) == 'B'){
                    str = 'BaiDu,' + str.substr(1);
                }else{
                    str = 'Cloudflare,' + str;
                }
                break;
            }
        }
        $(selector).append('<div class="CloudflareInfo">当前CDN节点:[' + str + ']' + ' 访客IP:' + sip + ' </div>');
        CloudFlareInfoMore(callback);
    }).fail(function(){
        console.error('Private：','捕获异常：Cloudflare trace失败，无法请求.');
        if(typeof callback == "function"){callback(false);}
    });
}
/*测试Railgun状态，需要/test.png可访问并禁止缓存，否则无法正常检测*/
function CloudFlareInfoMore(callback){
    $.ajax({
        'type': 'head',
        'url': '/test.png',
        'success': function(data,status,xhr){
            var str = '', head = xhr.getAllResponseHeaders();
            try{
                str = head.match(/(cf-railgun=?)(\S*)/)[2];
                if(str.indexOf('connection')>-1){
                    str = '启用';
                }else{
                    str = '工作';
                }
                window.cfRailgun=true;
            }catch(e){
                if(head.indexOf('cf-railgun=')===-1){
                    str = '禁用';
                }else{
                    str = '未知';
                }
                window.cfRailgun=false;
            }
            $(".CloudflareInfo").append('Railgun:' + str);
            if(typeof callback == "function"){callback(true);}
        },
        'error': function(XMLHttpRequest, textStatus, errorThrown){
            var errStr = "";
            switch(XMLHttpRequest.readyState) {
                case 0:
                    errStr = "未载入";
                    break;
                case 1:
                    errStr = "载入中";
                    break;
                case 2:
                    errStr = "已载入";
                    break;
                case 3:
                    errStr = "解析中";
                    break;
                case 4:
                    errStr = "完成";
                    break;
                default:
                    errStr = "未知";
            }
            console.error('Private：','捕获异常：Cloudflare test失败，状态[' + errStr + ']状态码[' + XMLHttpRequest.status + '].');
        }
    })
}
/*图片onerror解析*/
function imgErrorIgnore(err){
    var str='';
    var imgUrl = err.currentTarget.currentSrc;
    var baseUrl = err.currentTarget.baseURI;
    str += '-----------------图片异常捕获' + "\n";
    str += '图片地址：' + imgUrl + "\n";
    str += '页面地址：' + baseUrl + "\n";
    str += '上报结果：';
    if(isExitsFunction('$') && isExitsFunction('reportingImgError')){
        str += reportingImgError(imgUrl,baseUrl);
    }else{
        str += '无jq或未开启上报';
    }
    str += "\n";
    if(typeof(Sentry) !== 'undefined'){
        Sentry.captureMessage('badImg: ' + imgUrl);
        str += 'Sentry已上报' + "\n";
    }
    
    str += '-----------------';
    console.log(str);
    return true;/*不传递到本身的onerror*/
}

