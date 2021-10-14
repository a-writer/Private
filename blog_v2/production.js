$(function(){
    console.log('init');
    $('div#_JL_footer').html('');
    window.bgImg = [];/*背景图片地址数组*/
    $('section#banner div.shape').removeClass('shape-style-1');/*移除主题的旗袍效果*/
    $('div#float_action_buttons').append($('textarea#_JL_moreSetting_html').text());/*增加二次元模式开关*/
    $('div#content').prepend($('textarea#_JL_BGI_html').text());/*创建背景图片div（由主题背景图功能的css伪元素改写）*/
    $('button#fabtn_toggle_2cy_switch').on('click' , function(){_2cy_switch(this);});/*绑定二次元模式开关事件*/
    initBrowser();
    initCloudFlareCheck();
    init4BGI();
    /*setTimeout(function(){init4jsdelivr();}, 240000);*/
});
/**
 * [IsExitsFunction 方法是否已定义]
 * @param    {[string]}    fun_name [方法名]
 * @return 	 {[boolean]}        	[已定义true, 则false]
 */
function isExitsFunction(fun_name)
{
    try
    {
        if(typeof(eval(fun_name)) == "function") return true;
    } catch(e) {}
    return false;
}
/**二次元模式切换事件**/
function _2cy_switch(node){
    if(window.bInfo.device !== 'PC'){alert('为了避免流量消耗，仅支持电脑开启该功能。');return;}
    $(node).toggleClass('btn-neutral');
    $('div#_JL_BGI').toggleClass('_JL_display');
    $('#banner').toggleClass('_JL_background_banner');
    $('#banner .shape').toggleClass('_JL_background_banner');
    $('span.banner-title-inner').toggleClass('_JL_background_title');
    if($('div#_JL_BGI div.backstretch').length ==0){/*未初始化backstretch*/
        if(window.bgImg.length == 0){/*fix"No images were supplied for Backstretch"*/
            window.bgImg.push("/wp-content/uploads/2021/10/planet-1702788.jpg");
        }
        window.bgImg.sort(function(){ return 0.5 - Math.random() });/*展示顺序打乱*/
        $('div#_JL_BGI').backstretch(window.bgImg, {duration:3000});
        $('div.backstretch img').on('dragstart' , function(){return false;});/*屏蔽拖动避免误触拖动到新标签打开*/
    }
}
/**初始化Browser功能**/
function initBrowser(){
    window.bInfo = [];
    window.bInfo.device = 'Mobile';/*默认手机党*/
    window.browserName = '未知';
    if(isExitsFunction('Browser')){/*检测Browser是否加载，加载则启用bInfo*/
        try{
            window.bInfo = new Browser();
            $('div#_JL_footer').append('<p>优雅的' + (window.browserName = window.bInfo.browser) + '用户你好</p>');
        }catch(e){}
    }
}
/**背景图片相关**/
/*背景图片初始化*/
function init4BGI(){
    if(window.bInfo.device !== 'PC'){return;}
    console.log('开始检测可用的背景图片外链');
    setCXimg({
        '1':['https://qn-next.xuetangx.com/','http://i0.hdslb.com/bfs/album/'],
        '3':['.jpg','.png','.gif'],
        /*'Tag':['不是排名，不分先后。',
            '1梅普露&莎莉',
            '2莎莉',
            '3御坂美琴0502',
            '4太怕痛就全点防御力了',
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
        ],*/
        'url':[
            ['0714',0,'15872815721833',0,'#6'],
        ]
    });
}
/*设置背景图片展示
功能：外链拼接、生日唯一展示
如果当天没有生日图片则展示全部图片
*/
function setCXimg(arr){
    /*
    arr组合方式：
    {
        "1":["http://","https://"],  //此处为数组1，主要用于网址开头
        "3":["/?s=","/s?wd="],       //此处为数组2，主要用于图片后缀
        "url":[ //注释：除第一个值为4位生日数字如【0419】，其余值为字符串时按字符串算，为整数时按整数变量叠加(由0开始)，最后一个值为#开头时将忽略，不会组合进网址，单独作为备注值使用。
                //这个注释可能不好理解，看下面的样例吧，希望未来不要忘记..
            ['',1,"exp.com",0], //注释：数组1的第1个,"exp.com",数组2的第0个,组合起来即"https://exp.com/?s=",无限长度叠加
            ['0419',0,"exp.com",1], //注释：数组1的第0个,"exp.com",数组2的第1个,组合起来即"http://exp.com/s?wd=",无限长度叠加
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
    return true;/*拦截防止继续传递到本身的onerror*/
}
/**报错跟踪平台：哨兵**/
function init4sentry(){
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
                /*scope.setUser({
                    matomo_id: window.matomo_id,
                });*/
            });
        }
        console.log('Sentry',textStatus);
    }).fail(function() {
        console.log('Sentry', 'fail');
    });
}
/**CloudFlare检测**/
function initCloudFlareCheck(){
    if(isExitsFunction('$') && isExitsFunction('CloudflareInfo')){
        CloudflareInfo('div#_JL_footer',function(type){
            if(type==false){/*获取失败*/
                w.Cloudflare = false;
                w.cfRailgun = false;
                w.CloudflareIp = 'Un';
            }
        });
    }else{/*未知异常*/
        w.Cloudflare = 'cannot';
        w.cfRailgun = 'cannot';
        w.CloudflareIp = 'Un';
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
            $(selector).append('<p class="CloudflareInfo">当前CDN节点:[' + str + ']' + ' 访客IP:' + sip + ' </p>');
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
/**jsdelivr服务质量检测**/
/*jsdelivr Contribute Performance Data 用于jsdelivr对cdn服务商进行网络测试*/
function init4jsdelivr(){
    if(window.bInfo.device !== 'PC'){return;}
    /*
    * 20211014更新：我禁我自己？
    * Package perfops-rom is blocked. Please refer to https://www.jsdelivr.com/terms/acceptable-use-policy-jsdelivr-net for more information.
    * */
    var j = document.createElement('script');
    j.type='text/javascript';
    j.async=true;
    j.defer=true;
    j.src = 'https://cdn.jsdelivr.net/npm/perfops-rom';
    document.body.appendChild(j);
}
/**Date增加日期格式化函数**/
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
