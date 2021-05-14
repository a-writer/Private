/*
    fileName:       main.js
    name:           自用博客初始化
    description:    背景图片加载与matomo等项目初始化
    create:         2020/04/28
    version:        2020/08/03
    By:             a-writer
    Url:            https://github.com/a-writer/Private/
*/
/*
检测jquery加载：isExitsFunction('$')
检测Browser加载：isExitsFunction('Browser')
200429：
    修正matomo参数设置
200430：
    尝试使用callback写法位于CloudflareInfo
200515：
    更新图片列表
200802:
    增加window.browserName，值w.bInfo.browser；
    页面底部增加访客浏览器显示；
    更换筒寄服务器域名，相关部分加密，以防被当广膏惨遭过绿
    CloudflareInfo执行前判断是否加载
    尝试增加图片错误捕获功能 imgErrorIgnore
200803:
    更换图片错误捕获使用的bind方法为live方法，使得可以捕获新生元素【jQuery .live()已从1.9版开始删除。。。】
*/
/*总初始化*/
function pageInit4blog(){
    var u='\x2f\x2f\x73\x31\x2e\x66\x65\x6e\x67\x6c\x65\x74\x69\x61\x6e\x2e\x63\x6e\x2f';
    _paq.push(['setTrackerUrl',u+'\x6d\x61\x74\x6f\x6d\x6f\x2e\x70\x68\x70']);/*防止广告过滤器*/
    var d=document,w=window,g=d.createElement('script'),s=d.getElementsByTagName('script')[0];g.type='text/javascript';g.async=true;g.defer=true;g.src=u+'matomo.js';s.parentNode.insertBefore(g,s);/*初始化统计JS与bgImg列表*/
    w.bgImg = [];
    if(isExitsFunction('imgErrorIgnore')){
        /*$("img").live("error",imgErrorIgnore);*/
        $('body').on('error', 'img', imgErrorIgnore);
    }
    /*捕获图片错误*/
    if(isExitsFunction('Browser')){/*检测Browser是否加载，加载则启用bInfo*/
        try{w.bInfo = new Browser();w.browserName = w.bInfo.browser;}catch(e){w.browserName = '未知';}
        _paq.push(['setCustomVariable',1,"browser",w.browserName,"visit"]);/*上报浏览器类型*/
        if(w.bInfo.device!="Mobile"){/*非手机端*/
            pageInit4bg();/*照顾手机端小流量党*/
            setTimeout(function(){pageInit4jsdelivr();}, 120000);/*页面完全加载超过120s才进行jsdelivr服务质量检测*/
        }
    }
    if(isExitsFunction('$') && isExitsFunction('CloudflareInfo')){
        CloudflareInfo('.footer-inner',function(type){
            if(type==false){
                window.Cloudflare = false;
                window.cfRailgun = false;
                window.CloudflareIp = 'Un';
            }
            pageInit4matomo();
        });
    }else{
        pageInit4matomo();
    }
}
/*统计初始化*/
function pageInit4matomo(){
    /*上报Cloudflare检测信息*/
    try{_paq.push(['setCustomVariable',2,"Cloudflare",window.Cloudflare,"visit"]);}catch(e){}
    try{_paq.push(['setCustomVariable',3,"cfRailgun",window.cfRailgun,"visit"]);}catch(e){}
    try{_paq.push(['setCustomVariable',4,"cfIp",window.CloudflareIp,"visit"]);}catch(e){}
    /*增加crx等下载类型*/
    _paq.push(['addDownloadExtensions', "crx|mkv|ass|flac|cue|log"]);
    /*设置统计暂停计时器 当用户单击下载文件或单击出站链接时，Matomo会记录该点击，为了保证上传成功，它会在用户重定向到所请求的文件或链接之前增加一个小的延迟。*/
    _paq.push(['setLinkTrackingTimer', 1888]);
    if(isExitsFunction('$')){
        $('.footer-inner').append('<div>您的浏览器类型为' + window.browserName + '</div>');
        $('.footer-inner').append('<div>继续浏览即代表您同意本站使用Cookies.</div>');
    }
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    _paq.push(['enableHeartBeatTimer',20]);
}
/*背景初始化*/
function pageInit4bg(){
    setCXimg({
        '1':['https://p.ananas.chaoxing.com/star3/origin/','https://qn-next.xuetangx.com/','http://i0.hdslb.com/bfs/album/'],
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
            ['',0,'1476408826c0e407ff15ecd909949899','#1'],
            ['',0,'7ff624aa657d926825b60ae7ccd536f8','#4'],
            ['',0,'b8d7358e81959f11750b45fad7f5466a','#1'],
            ['0502',0,'fee5cdea5fad75d6d6ee9ee6591e39a5','#3'],
            ['',0,'e18026fb64bf5ce86cd2cef0e1aa5a3c','#2'],
            ['',0,'d5a0acf07d6734b727a36db3516f910a','#2'],
            ['',0,'341e2992d2bbb5bfecafe36f5bf842a8','#1'],
            ['',0,'f24b65380ca06ad3e4b68f0b1f658405','#1'],
            ['',0,'691bf0a857f6d6e79150f8ed3407f2ee','#1'],
            ['',0,'bb39c97e6fd93744dc5ba7531ba8ae03','#5'],
            ['',0,'bed84adf85a6169a3d70f3b95f81d31a','#5'],
            ['',0,'ce2a9133ec1f33c252234b9c1f625110','#7'],
            ['',0,'f9a00b18dfecd5a558de9a10cda860df','#7'],
            ['',0,'fb4d98c90bb10a6f6a59a6459871c0c9','#2'],
            ['',0,'dd7da0a7b5f3ae8d3d195975466b71ed','#8'],
            ['',0,'eba1a614941fb851a14eb715b37449fd','#4'],
            ['0714',1,'15872815721833',0,'#6'],
        ]
    });
    setTimeout(function(){reSetBg();}, 4100);/*setCXimg超时为4000ms，100ms后加载成功的图片将作为背景*/
}
/*jsdelivr Contribute Performance Data 用于jsdelivr对cdn服务商进行网络测试*/
function pageInit4jsdelivr(){
    var j = document.createElement('script');
    j.type='text/javascript';
    j.async=true;
    j.defer=true;
    j.src = 'https://cdn.jsdelivr.net/npm/perfops-rom';
    document.body.appendChild(j);
}
