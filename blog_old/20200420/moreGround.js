/*
    fileName:       moreGround.js
    name:           自用博客增强
    description:    基于Backstretch.js的外链背景自动处理，以及基于Jquery的Cloudflare信息展示，需要保证所依赖Js的优先加载。
    create:         2020/04/19
    version:        2020/08/03
    By:             a-writer
    Url:            https://github.com/a-writer/Private/
*/
/*
200428：
    增加window.Cloudflare、window.cfRailgun用于获取cf状态，未检测完毕就调用会报错
200430：
    CloudflareInfo与CloudFlareInfoMore增加callback，用于检测结束推送，拥有一个type参数【站点启用Cloudfalre且完成检测为true，反之亦然】。
200514：
    背景图片展示顺序打乱
    增加window.CloudflareIp用于获取cf认定的IP
200802:
    Railgun检测增加判断禁用状态
    增加imgErrorIgnore用于解析图片错误
    为setCXimg对接imgErrorIgnore
200803:
    因main.js更换了绑定方法，取消为setCXimg对接imgErrorIgnore
*/
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
    setTimeout(function(){img.removeAttribute('src');},4000);/*4秒超时，到时间后自动移除src停止加载*/
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
                testBGImgUrl(objUrl);
            }
        }
        if(c > 1){stop = true;break;}
        c++;
    }
}
/*获取并显示Cloudflare节点名与访客IP
食用方法：CloudflareInfo(".footer-inner",function(){alert("检测完成");});
*/
function CloudflareInfo(selector,callback){
    $.get("/cdn-cgi/trace",
    function(data) {
        try{
            var sip = data.match(/(ip=?)(\S*)/)[2], str = data.match(/(colo=?)(\S*)/)[2];
        }catch(e){
            console.error('trace失败.');
            window.Cloudflare = false;
            window.CloudflareIp = 'Unknow';
            if(typeof callback == "function"){callback(false);}
            return;
        }
        window.Cloudflare = true;
        window.CloudflareIp = sip;
        var every = [
        /*以下数据来源https://www.cloudflarestatus.com/，摘录一些常见节点*/
            ['AMS', '荷兰阿姆斯特丹'],
            ['DME', '俄罗斯莫斯科'],
            ['DME', '德国慕尼黑'],
            ['HKG', '香港'],
            ['MFM', '澳门'],
            ['TPE', '台北'],
            ['NRT', '日本东京'],
            ['KIX', '日本大阪'],
            ['ICN', '韩国首尔'],
            ['LHR', '英国伦敦'],
            ['SIN', '新加坡'],
            ['CDG', '法国巴黎'],
            ['FRA', '德国法兰克福'],
            ['KUL', '马来西亚吉隆坡'],
            ['LAX', '美国洛杉矶'],
            ['SJC', '美国圣何塞'],
            ['BOS', '美国波士顿'],
            ['KBP', '乌克兰基辅'],
            ['PRG', '捷克布拉格'],
            ['BLR', '印度班加罗尔'],
            ['BKK', '泰国曼谷'],
            ['VTE', '老挝万象'],
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
                    str = 'BaiDu' + str.substr(1);
                }else{
                    str = 'Cloudflare' + str;
                }
                break;
            }
        }
        $(selector).append('<div class="CloudflareInfo">当前CDN节点:[' + str + ']' + ' 访客IP:' + sip + ' </div>');
        CloudFlareInfoMore(callback);
    });
}
/*测试Railgun状态，需要/wp-content/public/test.png可访问并禁止缓存，否则无法正常检测*/
function CloudFlareInfoMore(callback){
    $.ajax({
        'type': 'head',
        'url': '/wp-content/public/test.png',
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
        }
    })
}
/*图片onerror解析*/
function imgErrorIgnore(err){   
    console.log(
        '-----------------',"\n",
        '捕获到图片加载异常,准备上报',"\n",
        '图片地址：',err.currentTarget.currentSrc,"\n",
        '页面地址：',err.currentTarget.baseURI,"\n",
        '-----------------'
        );
    return true;
}

