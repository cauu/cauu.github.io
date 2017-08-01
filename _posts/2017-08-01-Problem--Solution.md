---
layout: post
title: 浏览器兼容issues && solution
categories: 
date: 2017-08-01
---
web开发中，对ie的兼容曾经是无数前端工程师的切肤之痛，如今，随着移动设备的崛起和ie浏览器的没落，我们越来越不需要考虑在ie上的兼容性问题。

然而，没有ie我们就可以高枕无忧了吗？在移动端，一个新的问题又摆在了我们的面前---对旧版移动端浏览器的兼容。

下面就总结一下这些年在移动端踩过的大大小小的兼容性的坑和解决办法。

首先是有关函数兼容性的问题(大部分转自我的同事[乔乐的博客](http://qiaolevip.iteye.com/blog/2306090)):

#### 1. ES6中新的内置函数

由于babel默认不会对es6的内置函数添加polyfill，因此如果项目中用到了es6新的 字符串/数组/对象操作函数，那么在低版本的浏览器由于其内核没有实现这些函数，就会引发兼容性问题。

上述问题包括但不限于以下函数：

函数名|常见机型|解决方法
:--|:--|:--|
for...of|【部分安卓】|使用for循环或forEach代替
str.startWith|【华为】【老版iphone】|使用字符串的indexOf代替
str.search|【华为】【老版iphone】|使用indexOf代替
array.find|【部分国产安卓手机】|使用filter函数或for loop遍历
array.includes|【部分国产安卓手机】|同上
Promise|【部分国产安卓手机】【老版iphone】|全局引入bluebird或es6-promise模块
{``}语法，如`${today}`|【部分安卓手机】|使用+实现字符串拼接
onblur事件|iphone|添加不可见的mask模拟onblur事件

#### 2. CSS兼容性问题

问题名|常见机型|解决方法
:--|:--|:--|
scale缩放动画|【安卓手机】|使用gif代替或添加webkit前缀
(不算兼容性)transform导致position:absolute失效||删除父组件的transform属性

#### 3. 其他兼容性问题


问题名|常见机型|解决方法
:--|:--|:--|
window.open||部分浏览器会拦截popup，移动端更推荐window.location.href
不支持localstorage|【点融APP】|使用cookie，object.toString来处理对象

#### 4. 移动端兼容性问题之debug

要避免兼容性问题，首先我们要做的就是尽量不用上面提到的那些函数，如果一定要使用也要做好Polyfill。

但如果不幸中招，我们又该如何定位问题呢？

首先可以尝试window.onerror函数，该函数会监听所有抛出且未被catch的error。

```window.onerror = function (e) { alert(e) }```

如果是新版的chrome浏览器上的问题，我们可以使用chrome的[remote debug模式](https://developers.google.com/web/tools/chrome-devtools/remote-debugging/)，将手机浏览器投影到pc的chrome上，再通过pc的console定位问题。

但如果是老版本或是国产手机的内置浏览器出了问题呢？我们可以用下面的方法定位问题:

1. alert(navigator.useragent)查看浏览器的内核版本。(如Webkit 537.36)

2. 在[google chrome version history](https://en.wikipedia.org/wiki/Google_Chrome_version_history)上找到该内核版本对应的chrome版本

3. 在[old versions](http://www.oldversion.com/)上下载相应的chome浏览器

4. 在chrome浏览器中进行测试

