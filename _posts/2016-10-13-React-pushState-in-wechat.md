---
layout: post
title: React-router和pushState在微信浏览器中的坑
categories: 技术
date: 2016-10-13
---
#### 什么是pushState？

pushState是HTML5新增加的history API。在这之前，我们的url一旦改变，网页就会随之刷新，几秒钟的白屏可以说是用户体验的大敌。我们理想中的单页面应用(SPA）应该有着如原生app一般的体验，这就要求在url切换时，我们的页面不能随之刷新。之前我们通常都使用html的描点(#)实现单页面应用，而pushState的出现，允许我们在不刷新页面的情况下改变url的值，这使得SPA配合优雅的url成为可能，浏览器的前进后退也能够被充分利用（描点可不能前进后退哦）。

### 基于pushState的路由实现目标

1. 页面跳转不刷新页面

2. 页面url与页面展现内容一致

3. 在不支持的浏览器下降级成传统的网页方式

### react-router在微信分享下的问题

虽然微信的文档中只提到安卓手机不支持pushState，但是它在ios上的表现也不尽如人意：尽管页面能够正常跳转，使用window.location也可以获取到正确的url，但是如果我们使用微信的复制页面Link的功能，会发现，这个Link不会根据页面的跳转而发生改变。当调用微信分享接口时，这个bug就会导致window.location传入的url和微信理解的当前url不同（微信获取到的是前面的Link），引发invalid domain name error。

### 解决方案

如前所说，在微信浏览器中，使用react-router控制页面跳转时，微信认为页面的url从未变过，一直是第一次进入的页面url，因此一个比较hack的方法就是记录第一次进入网页时的url，并储存起来，之后调用微信分享接口时，传入的始终是该url。但只在ios的微信浏览器下测试了该方法，至于安卓的微信浏览器还有待进一步测试。

#### 其他

pushState除了可以用来实现单页面应用，它还可以用来动态更改我们url中的参数。当然要考虑到在不支持的浏览器中优雅的降级。参考: [pushState更改网页参数](http://stackoverflow.com/questions/10970078/modifying-a-query-string-without-reloading-the-page)

参考:

[解决方案](http://react-china.org/t/react/1928)

[坑](http://react-china.org/t/react-router-react/1927)