---
layout: post
title: How to read ECMAScript Specification?
categories: 
date: 2017-07-13
---
[TC39 Overview](https://ponyfoo.com/articles/tc39-ecmascript-proposals-future-of-javascript)

[从零开始写个编译器](https://zhuanlan.zhihu.com/p/19878087?columnSlug=mosky)

[Javascript语法解析与抽象语法树](http://www.iteye.com/news/30731)

[TC39 Process](http://www.jianshu.com/p/b0877d1fc2a4)

[TC39 Proposals](https://prop-tc39.now.sh/)

[ECMAScript 2018规范](https://tc39.github.io/ecma262/)

[LL(K)算法](https://www.tutorialspoint.com/compiler_design/compiler_design_top_down_parser.htm)

[LL(1)文法分析器的简单实现](http://blog.csdn.net/it_dream_er/article/details/53483853)



Keywords: 

TC39, tokens, lexical grammer, terminal symbols, parse tree, nonterminal, 

Production, terminal symbols, nonterminal symbols

***



最近抽空大致看了下ES2018的specification，内容深广，涉及的语言设计的底层细节非一日所能达。面对这样庞大的一份资料，如何看待它呢？我的态度是，不求通读标准，但求拥有阅读和理解标准的能力。即使你熟记标准中的所有细节，对应用开发者来说，也无助于解决实际生产中的绝大部分问题，但当我们遇到某些无法可解疑难杂症时，查阅标准，可能是我们攻克问题的最后一件武器。更重要的是，对于自己朝夕使用的工具，如果都只知皮毛，那也确实说不过去了。

ECMAScript 8中，第1章到第3章是对文件本身的介绍，4章是对语言总体设计思路的介绍，类似于一个概览，第5章介绍了标准中词法、文法、算法定义的规则，第6章介绍了语言和标准中的变量类型，第7章叫Abstract Operations，这部分主要是定义了一些函数隐式调用的规则和文档中会用到的一些抽象方法。第8章详细介绍了emacscript中作用域、运行环境的定义（这也是js中问题的高发区），从第9章开始，就是对语言实现层面细节的介绍了，后面的内容都比较抽象、琐碎，对我来说，价值最大的反而是前面的4，8章。

如果我们只是希望了解这份规则，那到这里就可以打住了。但如果我们希望具备“看懂”这份标准的能力，这就不简单了。除了基本的英文，我们还需要一些额外的编译原理的知识。

#### 编译原理

编译器并不是什么高大上的东西，本质上它只是一种处理数据的方法。说白了，编译器就是根据定义好的规则去解析传入的字符串（高级语言），再将其转换成低级语言的一种工具。也就是计算机世界里的“翻译”。

插一句题外话，既然计算机语言可以通过编译器去翻译，我们能否用同样的方式让计算机来翻译我们人类的语言呢？20世纪5 60年代的科学家就是这么想的，最终，他们意识到，相比计算机语言，人类的语言要复杂的多，仅仅遵循固定的语法规则是不够的，语言和语法会不断进化，更恼火的是，自然语言中充满了不规则的用法和一词多意的情况，想穷举所有情况所需的计算量，用天文数字来形容都不够。直到数学和统计模型代替了基于编译器的方法，自然语言处理才迎来了质的飞跃。

既然编译器本质是一位“翻译”，它是如何“翻译”我们的代码呢？首先我们想想，现实世界中，我们要将一段中文翻译成英文，需要经历哪些过程？

1. 首先识别出句子中的每一个单词

2. 分析句子的结构

3. 初步翻译出译文

4. 对译文进行润色、修改

5. 写出最终译文

事实上，机器在进行翻译时，也遵循了这样一套流程：

词法分析、语法分析、语义分析、生成中间代码、优化、目标代码生成。

#### 词法分析

`function foo() { console.log('test') }`

前面提到了，在翻译一句话时，我们首先要识别出句子中每一个单词，计算机亦然。就拿上面这段代码为例，要理解它，计算机首先要将这串字符串中的关键字提取出来，形如:

```

['function', 'foo', '(', ')', '{', 'console', '.', 'log', '{', ''', 'test', ''', ')', '}']

```

但仅仅是把关键词切割出来还不够，计算机还需要知道每一个关键词的类型，这可以帮助它进行后续的语法分析（比如理解var var a = 1；是不合规的语句），结合类型和语素，我们就得到了词法分析的最小单位Token。标准的第11章主要工作就是定义了ECMAScript的基本的Token。举个例子:

```

BooleanLiteral ::

    true

    false

```

定义了基本的bool类型的token。它的类型是BooleanLiteral（Literal的一种），取值可以是true和false，当词法分析器看到程序中的true或者false，它就会向词法分析器的队列中添加这样一条数据:

```

语素: true

类型: Literal

```

由于词法分析器是逐字读取我们输入的源码，它如何判断true/false或是test这样的字符串是变量、字符串还是保留字呢？这又属于另一个课题了，可以看看[这篇文章](https://zhuanlan.zhihu.com/p/19878146?columnSlug=mosky)

#### 语法分析

首先可以看一个[demo](http://esprima.org/demo/parse.html#)，对语法分析生成的**抽象语法树(AST)**有一个直观的感受。

词法分析器的输出会作为输入传给语法分析器，然后被转换成对应的语法树。但我们知道，词法分析器的输出是如下一个数组:

```

[

    {

        "type": "Keyword",

        "value": "var"

    },

    {

        "type": "Identifier",

        "value": "answer"

    },

    {

        "type": "Punctuator",

        "value": "="

    },

    {

        "type": "Numeric",

        "value": "6"

    },

    {

        "type": "Punctuator",

        "value": "*"

    },

    {

        "type": "Numeric",

        "value": "7"

    },

    {

        "type": "Punctuator",

        "value": ";"

    }

]

```

这样一个数组要如何转换成我们最终的语法树呢?这里，就需要引出**文法**这个概念了。

文法，是描述语言结构的工具，通过文法，我们可以定义语言的具体表示形式。比如对语句:

``var a = 6;``

如果用文法来定义它，可表示为:

```

AssignmentExpression:

    LeftHandSizeExpression = AssignmentExpression   

```

这条文法规则统称为一条产生式**(Production)**，其中AssignmentExpression是一条非终结符**(Nonterminal)**，非终结符可以进一步分解，分解为一组基本的Token组成的语句，这些无法再分的token也叫终结符**(Terminal)**。

所以语法分析最终过程，就是将我们的源代码进行展开的过程。如果我们的代码能够找到一个合适的展开方式，并生成相应的AST，就意味着我们的代码是合乎语法规则的。如果无法找到这样一个AST，那么一定是我们的代码出错了。

关于展开式，还可以读一读[此文](https://zhuanlan.zhihu.com/p/19894073?columnSlug=mosky)。

标准的10到15章，详细定义了JS中的文法规则。

#### 语义分析(Elaborator)

这个阶段的英文叫做精细化，但是翻译过来叫语义分析。因为在强类型语言中，它的功能，主要是对上一步生成的AST进行类型检查，比如在Java中，如果出现string = int + char的情况，编译器就会报错。那么对js这样的弱类型语言来说，它就没有用处了吗？事实上，我们常用的uglify插件就是在这里起作用的。除此之外，判断参数个数、类型和声明是不是不一样，或是哪些变量定义了却没用到也可以归到它的指责中去。简而言之，它可以对一段合乎语法规则的代码进行语义检查和调优。

因此，翻译成精细化或许比语义分析更合适。

#### 生成目标代码

经过上面这几步，我们的源代码就可以替换为目标代码了。

了解了编译大概的步骤和原理，我们就可以更进一步了。

前面我们简单提到了第9章开始，就是对语言底层细节的描述，这里的内容细节、琐碎，但大量的问题都可以在这里得到解答。而了解的语言编译的过程，我们已经不必再畏惧它，如果有兴趣，甚至可以把这一部分啃下来。

标准的10-15章采用自底向上的方式，层层递进的定义了ECMACSript的词法和文法规则，第10章定义了基本的编码规则（词用Unicode进行编码）；第11-15依次定义了词法、表达式、声明和语句、类和方法、模块和Script，而整个JS的文法就这样金字塔般的搭建起来。在这基础之上，由算法 && 数据结构构成了我们最终的应用。

*  Token的定义

```

CommonToken::

IdentifierName
Punctuator
NumericLiteral
StringLiteral
Template


ReservedWord::

Keyword
FutureReservedWord
NullLiteral
BooleanLiteral

Keyword::one of
break do in typeof case else instanceof var catch export new void class extends returnwhile const finally super with continue for switch yield debugger function this default if throw delete import try await

```

上面的产生式采用嵌套的方式定义了ECMAScript的保留字，我们只需要将里面的字段替换掉，就可以得到包含所有reservedWord的表达式。

除了token，文法也采用了类似的嵌套+递归的方式进行定义。



* 一条典型的文法规则定义

```

If Statement[Yield, Await, Return]:
if (Expression[+In, ?Yield, ?Await]) Statement[?Yield, ?Await, ?Return] else Statement[?Yield, ?Await, ?Return]
if (Expression[+In, ?Yield, ?Await]) Statement[?Yield, ?Await, ?Return]



```

上面的规则定义了if block的文法，实际编译过程中，我们会把按照词法规则划分好的数组再进行文法匹配，常见的匹配算法有LL(k)和LR(k)算法。

* 算法的定义

文法和词法的定义主要还是面向编译器的开发者，对顶层的应用开发者来说，我们接触的最多、也是最有意义的部分其实是对某些内置算法的定义。比如使用```==```来比较两个变量，算法定义如下:

```

ReturnIfAbrupt(x).
ReturnIfAbrupt(y).
If Type(x) is the same as Type(y), then 
Return the result of performing Strict Equality Comparison x === y.
If x is null and y is undefined, return true.
If x is undefined and y is null, return true.
If Type(x) is Number and Type(y) is String, 
　　return the result of the comparison x == ToNumber(y).
If Type(x) is String and Type(y) is Number, 
　　return the result of the comparison ToNumber(x) == y.
If Type(x) is Boolean, return the result of the comparison ToNumber(x) == y.
If Type(y) is Boolean, return the result of the comparison x == ToNumber(y).
If Type(x) is either String, Number, or Symbol and Type(y) is Object, then 
　　return the result of the comparison x == ToPrimitive(y).
If Type(x) is Object and Type(y) is either String, Number, or Symbol, then 
　　return the result of the comparison ToPrimitive(x) == y.
Return false.
```

通过翻译这段伪代码，我们知道了，当使用==等号进行比较的时候, null == undefined返回的是true；当我们的实现涉及到了诸如此类的边界问题，如果google都无法解答，不妨读一读标准中关于算法定义的部分。
