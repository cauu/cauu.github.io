---
layout: post
title: javascript中类型的判断
categories: 
date: 2017-09-25
---

JS中的数据类型分为两类：基本数据类型和用户自定的数据类型。对数据类型的判断遵循以下两个基本原则即可：

  

- 如果判断的是基本数据类型或javascript内置对象，用`toString`

  

- 如果判断的是自定义类型，用`instanceof`



为什么不用typeof呢？看看下面的例子：

```

typeof null; // object

typeof ''; // string

typeof new String('123') // object

```

typeof null已经是一个众所周知的bug，按下不表。对String类型的判断才是我们的心头大患: 我们希望无论是'123'

还是new String('123')都是同样的string类型，而toString方法正好可以满足这个要求。

  

由于很多对象都重载了toString方法，因此我们用Object.prototype.toString来判断对象的类型:

```

toString = Object.prototype.toString;

toString.call('') // [object String]

toString.call(new String('')) // [object String]

```

如果要更加深入的理解这种用法，推荐大家阅读[lodash](https://github.com/lodash/lodash)中`isXXX`

部分的源码。



相比静态语言，动态语言的类型判断更加灵活。有的时候只要实例满足某些条件，我们也认为它是可接受的

数据类型，这就是所谓的[鸭子类型](http://blog.csdn.net/handsomekang/article/details/40270009)。



关于类型检测的更多细节，还可以读一下[这篇文章](http://harttle.com/2015/09/18/js-type-checking.html)。

