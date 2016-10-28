---
layout: post
title: 前端面试题目总结
categories: 技术
date: 2016-10-28
---
  
### dom0事件

使用onclick添加的事件为dom0事件，同一个元素只能拥有一个dom0事件，后添加的事件会覆盖之前的事件。


```

<div id="test" onclick="alert('test')" />  //在元素上直接绑定dom0事件

<script>

    //使用onclick方法添加dom0事件

    document.getElementById('test').onclick=function() {

        alert('test');

    }

</script>

```


对dom0事件，IE的事件流是冒泡（首先出发叶子节点事件），而netscape采用的是事件捕获（相反的顺序）。    

  

### dom2事件

使用addEventListener绑定的事件被称为dom2级事件。dom2级事件规定了事件流包含3个阶段：事件捕获、处于目标、事件冒泡。看一个例子:

```

<body>

    <div id="p">

        <div id="c">

        </div>

    </div>

</body>

<script type="text/javascript">

    var p = document.getElementById('p'),

        c = document.getElementById('c');

    c.addEventListener('click', function() {

        alert('子节点捕获');

    }, true);

    c.addEventListener('click', function() {

        alert('子节点冒泡');

    }, false);

    p.addEventListener('click', function() {    

        alert('父节点捕获');

    }, true);

    p.addEventListner('click', function() {

        alert('父节点冒泡');

    }, false);

</script>

```

点击元素，会依次输出``父节点捕获->子节点捕获->子节点冒泡->父节点冒泡``。

  

### js事件的三个阶段的理解



### js事件代理/委托

当我们需要为多个相同层级的子节点添加事件处理函数时，我们可以通过事件冒泡的机制，使用它们共同的父节点来处理这些事件。例子:

```

//对每一个<li>添加事件处理函数

<ul id="parent-list">
  <li id="post-1">Item 1</li>
  <li id="post-2">Item 2</li>
  <li id="post-3">Item 3</li>
  <li id="post-4">Item 4</li>
  <li id="post-5">Item 5</li>
  <li id="post-6">Item 6</li>
</ul>
//事件代理的写法
// 获取父节点，并为它添加一个click事件
document.getElementById("parent-list").addEventListener("click",function(e) {
  // 检查事件源e.targe是否为Li
  if(e.target && e.target.nodeName.toUpperCase == "LI") {
    // 真正的处理过程在这里
    console.log("List item ",e.target.id.replace("post-")," was clicked!");
  }
});
```

  

### 前端性能优化

* 减少http请求（包括合并js文件、css文件、图片）

* 减少对DOM的操作，正确理解Repaint和Reflow（React中天然增加了一层VirtualDOM来保证每次重绘影响的范围尽可能小）

* 使用CDN

* 将css放在<head>中，javascript引用放在<body>的最后（因为js阻塞执行的特点，保证即使js没有执行，用户也可以看到完整的页面）。

* minfy js和css文件。

* 压缩图片大小

* 尽可能减少不必要的cookie和localstorage。



### 闭包的原理及应用

参考之前的文章[ES6][JS闭包].md

  

### JS中this的使用

参考之前的文章[ES6][you dont know this].md



### 手写bind函数

bind函数用来实现函数调用的``hard bind``。因为它返回的是函数，因此一定少不了闭包的应用。核心代码就一句:

```

function(func, ctx) {

    //...省略..

    return function() {

        return func.apply(ctx, arguments);
    }

}

```

  

### js变量提升(hoisting)

所谓变量提升，是指ES5中，函数声明和变量声明被隐式的提升到函数开头的现象。需要注意的是使用var声明的变量只会提升变量的声明，而类似于function a() {} 这样的函数定义则会整体被提升。

ES5中，只存在全局和函数作用域，不存在块级作用域，再加上变量提升的特性，很容易产生很多在其他语言中不会出现的现象，下面是一道非常典型的包含变量提升的面试题:

```

function Foo() {
    getName = function () { alert (1); };
    return this;
}
Foo.getName = function () { alert (2);};
Foo.prototype.getName = function () { alert (3);};
var getName = function () { alert (4);};
function getName() { alert (5);}

//请写出以下输出结果：
Foo.getName();  
getName(); 
Foo().getName(); 
getName(); 
new Foo.getName(); 
new Foo().getName(); 
new new Foo().getName();
```

这道题目，结合变量提升，可以翻译成如下形式:

```

var getName; //getName声明被提升到开头

function getName() { alert(5);  }  //函数getName被提升到开头，并覆盖getName变量

function Foo() {

    getName= function() { alert(1); };  //没有使用var声明的getName默认指向全局变量

    return this;

}

Foo.getName = function () { alert(2); }

Foo.prototype.getName = function () { alert(3); }

getName = function () { alert(4); }  //getName函数定义未被提升

```

需要注意的是，<font color="red">ES6中，let和const声明不再存在变量提升的现象</font>，这样也规避了很多问题。



### js中运算符的优先级



### js垃圾回收机制

在Javascript中，如果一个对象不再被引用，那么这个对象就会被GC回收。如果两个对象互相引用，而不再被第3者所引用，那么这两个互相引用的对象也会被回收。

  

### js跨域问题

 跨域分为iframe的跨域请求和跨全域的请求。

常见的跨全域请求的解决方法主要有下面三种:

```

1.  JSONP

2.  Access-Control

3.  服务器代理

```

关于JSONP的实现可以参考这篇文章:[说说JSON和JSONP](http://kb.cnblogs.com/page/139725/)

  

### 函数节流

在网页中，我们常常碰到这种情况: 需要短时间内频繁调用一段函数来判断scroll的位置，或是判断用户拖拽的对象所处的位置，此时，除了优化响应函数外，函数节流也必不可少。

所谓函数节流，是指通过一个throttle函数控制函数两次调用的间隔，或规定其单位时间内的调用次数的方法。

实际使用中，我们常常使用underscore库定义的throttle函数。

还可以参考这篇文章: [浅谈js中的throttle函数](http://www.alloyteam.com/2012/11/javascript-throttle/)

  

### 设计模式

js中，常见的设计模式包括**观察者模式**，**责任链模式**，**工厂模式**。

  

### css垂直居中

1. 单行文字设置容器的line-height等于容器height属性即可

2. 文字+<img>可以通过设置容器的vertical-align属性，使得图片和文字基于某一基准线对齐（设置为middle就实现了垂直居中）。

3. table结合table-cell的vertical-align属性可以让单元格在表格中居中对齐。

4. 使用position: absolute手动调整控件位置直到居中。

5. 让容器的上下padding相同实现居中效果。 

6. float一个不可见的高度为50%的控件，然后为需要垂直居中的控件添加clear:both。

参考: [css垂直居中的6种方法](http://blog.csdn.net/wolinxuebin/article/details/7615098)

  

### 响应式布局

主要是对media query的使用和对max-width的理解。此外，使用rem作为响应式布局长度的基本单位，可以保证控件和文字大小的自适应。



### 深拷贝和浅拷贝

浅拷贝(shallow copy)



### viewport的理解



### js数组方法



### html缓存策略

cookie:

localstorage:

sessionstorage:

  

参考:

[移动开发之viewport深入理解](http://www.cnblogs.com/2050/p/3877280.html)

[事件的几个阶段你真的了解了吗](http://www.cnblogs.com/yexiaochai/p/3567597.html)

[2016十家公司前端面试小结](http://www.cnblogs.com/xxcanghai/p/5205998.html)

[前端各种优化](http://www.cnblogs.com/Darren_code/archive/2011/12/31/property.html)