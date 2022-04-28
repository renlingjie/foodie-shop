window.app = {
    /* 开发环境 */
    // serverUrl: "http://localhost:8088",                                   // 接口服务接口地址
    // paymentServerUrl: "http://192.168.1.3:8089",                          // 支付中心服务地址
    // shopServerUrl: "http://localhost:8080/foodie-shop/",                  // 门户网站地址
    // centerServerUrl: "http://localhost:8080/foodie-center/",              // 用户中心地址
    // cookieDomain: "",                                                     // cookie 域

    /* 生产环境 */
    serverUrl: "http://43.138.12.238:20004",                                 // 接口服务接口地址--->后端Gateway
    paymentServerUrl: "http://payment.t.mukewang.com/foodie-payment",         // 支付中心服务地址
    shopServerUrl: "http://81.70.242.107:8080/foodie-shop/",                  // 门户网站地址，就是我们这个前端的文件名
    centerServerUrl: "http://81.70.242.107:8080/foodie-center/",              // 用户中心地址
    // cookieDomain: "foodieshop.ltd",            	// cookie域（主要是多个域名才会需要设置，这里就一个域名，可以不设置）
    // 千万注意：当我们用网关层转发前后端(从根本解决跨域)，前端的domain是网关层的IP或域名，而不再是前端项目所在的IP或域名！！！
    cookieDomain: "43.138.12.238",

    ctx: "/foodie-shop",

    getCookie: function (cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            // console.log(c)
            while (c.charAt(0) == ' ') c = c.substring(1);
                if (c.indexOf(name) != -1){
                    return c.substring(name.length, c.length);
                }
            }
        return "";
    },

    goErrorPage() {
        window.location.href = "http://www.imooc.com/error/noexists";
    },

    setCookie: function(name, value) {
        var Days = 365;
        var exp = new Date(); 
        exp.setTime(exp.getTime() + Days*24*60*60*1000);
        var cookieContent = name + "="+ encodeURIComponent (value) + ";path=/;";
        if (this.cookieDomain != null && this.cookieDomain != undefined && this.cookieDomain != '') {
            cookieContent += "domain=" + this.cookieDomain;
        }
        document.cookie = cookieContent;
        // document.cookie = name + "="+ encodeURIComponent (value) + ";path=/;domain=" + cookieDomain;//expires=" + exp.toGMTString();
    },

    deleteCookie: function(name) {
        var cookieContent = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        if (this.cookieDomain != null && this.cookieDomain != undefined && this.cookieDomain != '') {
            cookieContent += "domain=" + this.cookieDomain;
        }
        document.cookie = cookieContent;
    },

    getUrlParam(paramName) {
        var reg = new RegExp("(^|&)" + paramName + "=([^&]*)(&|$)");    //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);            //匹配目标参数
        if (r != null) return decodeURI(r[2]); return null;             //返回参数值
    },

    /**
	 * 构建购物车商品对象
	 */
	ShopcartItem: function(itemId, itemImgUrl, itemName, specId, specName, buyCounts, priceDiscount, priceNormal) {
		this.itemId = itemId;
		this.itemImgUrl = itemImgUrl;
		this.itemName = itemName;
        this.specId = specId;
        this.specName = specName;
        this.buyCounts = buyCounts;
        this.priceDiscount = priceDiscount;
        this.priceNormal = priceNormal;
    },

    addItemToShopcart(pendingItem) {
        // 判断有没有购物车，如果没有购物车，则new 一个购物车list
        // 如果有购物车，则直接把shopcartItem丢进去，拿到cookie中的购物车信息（谨记名字是shopcart）
        var foodieShopcartCookie = this.getCookie("shopcart");
        var foodieShopcart = [];//默认为空数组
        if (foodieShopcartCookie != null && foodieShopcartCookie != "" && foodieShopcartCookie != undefined) {
			//只要不为空，就将foodieShopcartCookie中的数据存进去，并转换成json字符串
            var foodieShopcartStr = decodeURIComponent(foodieShopcartCookie);
            foodieShopcart = JSON.parse(foodieShopcartStr);

            // 如果不是对象，则重新复制为空数组
            if (typeof(foodieShopcart) != "object") {
                foodieShopcart = [];
            }

            var isHavingItem = false;
            // 如果添加的商品已经存在与购物车中，则购物车中已经存在的商品数量累加新增的
            for(var i = 0 ; i < foodieShopcart.length ; i ++) {
                var tmpItem = foodieShopcart[i];
                var specId = tmpItem.specId;
                if (specId == pendingItem.specId) {
                    isHavingItem = true;
                    var newCounts = tmpItem.buyCounts + pendingItem.buyCounts;
                    tmpItem.buyCounts = newCounts;
                    // 删除主图在数组中的位置
                    foodieShopcart.splice(i, 1, tmpItem);
                }
            }   
            if (!isHavingItem) {
                foodieShopcart.push(pendingItem);
            }
        } else {
            foodieShopcart.push(pendingItem);
        }

        this.setCookie("shopcart", JSON.stringify(foodieShopcart));
    },

    /**
     * 获得购物车中的数量
     */
    getShopcartItemCounts() {
        // 判断有没有购物车，如果没有购物车，则new 一个购物车list
        // 如果有购物车，则直接把shopcartItem丢进去
        var foodieShopcartCookie = this.getCookie("shopcart");
        var foodieShopcart = [];
        if (foodieShopcartCookie != null && foodieShopcartCookie != "" && foodieShopcartCookie != undefined) {
            var foodieShopcartStr = decodeURIComponent(foodieShopcartCookie);
            foodieShopcart = JSON.parse(foodieShopcartStr);

            // 如果不是对象，则重新复制为空数组
            if (typeof(foodieShopcart) != "object") {
                foodieShopcart = [];
            }
        }
        return foodieShopcart.length;
    },

    /**
     * 获得购物车列表
     */
    getShopcartList() {
        // 判断有没有购物车，如果没有购物车，则new 一个购物车list
        // 如果有购物车，则直接把shopcartItem丢进去
        var foodieShopcartCookie = this.getCookie("shopcart");
        var foodieShopcart = [];
        if (foodieShopcartCookie != null && foodieShopcartCookie != "" && foodieShopcartCookie != undefined) {
            var foodieShopcartStr = decodeURIComponent(foodieShopcartCookie);
            foodieShopcart = JSON.parse(foodieShopcartStr);

            // 如果不是对象，则重新复制为空数组
            if (typeof(foodieShopcart) != "object") {
                foodieShopcart = [];
            }
        }
        return foodieShopcart;
    },

    checkMobile(mobile) {
        var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
        if (!myreg.test(mobile)) {
            return false;
        }
        return true;
    },
}
