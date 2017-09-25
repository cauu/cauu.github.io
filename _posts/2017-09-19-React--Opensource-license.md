---
layout: post
title: React开源协议之争知多少?
categories: 
date: 2017-09-19
---
最近，风传百度要求外部产品线全部停止使用React/RN等Facebook下涉及专利条款的开源产品的，再结合7月，Apache基金会禁止使用facebook带附加条款的遵循BSD许可证的开源软件，React开源协议问题再次被推到了风口浪尖。这到底是怎么回事呢？



### 1. 常见的开源协议

针对开发中遇到的疑难杂症，github无疑是程序员的第一良医。作为世界上最大的开源社区，github几乎可以帮助你解决业务开发过程中遇到的所有问题。甚至出现了所谓的`github程序员`：遇到问题，`search copy paste`的连招一气呵成，抄起键盘就是干，老夫连代码长什么样都不知道，更别给我提什么开源协议。再加上大天朝作为制外之都，并没有明确法律条文去保护这些所谓的开源协议，因此相信绝大部分人都不知道不同的开源协议会对软件带来什么影响：反正你都开源了，就是给大家分享呗，别整那些没用的。

  

但是如果你希望和国际同仁进行代码层面的交流，或者软件考虑出海，那么了解这些开源协议就必不可少了。阮一峰老师的这幅图很好的总结了github上常见的开源协议以及他们的使用场景：

![Lisence](http://image.beekka.com/blog/201105/bg2011050101.png)

除了这些常见协议，开源世界事实上已经存在了上百种开源协议，分别从不同的维度对开源软件的使用者进行了一定的限制。由于上面几种协议已经可以满足我们的大部分需求，对其他协议就不再赘述。

  

不过，有一种协议可谓是跳出三界外，不在五行中，我忍不住要安利一波。这个协议叫*WTFPL协议*。单看缩写，可能不会觉得它有什么特别，但如果我告诉你它的全称是`Do What The Fuck You Want To Public License`呢？是不是恍然大悟。没错，这个协议可谓是一种极度放任的协议，使用了它基本就代表了你将代码贡献到公共领域，并且不采取任何版权或保护措施了。

### 2. facebook的BSD协议存在什么问题?

结合上图可以看到，BSD协议本身并没有太大问题，这次React事件问题的焦点也不在BSD协议，而是在此基础上的facebook附加条款：

> Additional Grant of Patent Rights Version 2 "Software" means the React software distributed by Facebook, Inc. Facebook, Inc. ("Facebook") hereby grants to each recipient of the Software ("you") a perpetual, worldwide, royalty-free, non-exclusive, irrevocable (subject to the termination provision below) license under any Necessary Claims, to make, have made, use, sell, offer to sell, import, and otherwise transfer the Software. For avoidance of doubt, no license is granted under Facebook's rights in any patent claims that are infringed by (i) modifications to the Software made by you or any third party or (ii) the Software in combination with any software or other technology. The license granted hereunder will terminate, automatically and without notice, if you (or any of your subsidiaries, corporate affiliates or agents) initiate directly or indirectly, or take a direct financial interest in, any Patent Assertion: 

> <div style="font-weight: bold">

(i) against Facebook or any of its subsidiaries or corporate affiliates, (ii) against any party if such Patent Assertion arises in whole or in part from any software, technology, product or service of Facebook or any of its subsidiaries or corporate affiliates, or (iii) against any party relating to the Software.

 </div>

> Notwithstanding the foregoing, if Facebook or any of its subsidiaries or corporate affiliates files a lawsuit alleging patent infringement against you in the first instance, and you respond by filing a patent infringement counterclaim in that lawsuit against that party that is unrelated to the Software, the license granted hereunder will not terminate under section (i) of this paragraph due to such counterclaim. A "Necessary Claim" is a claim of a patent owned by Facebook that is necessarily infringed by the Software standing alone. A "Patent Assertion" is any lawsuit or other action alleging direct, indirect, or contributory infringement or inducement to infringe any patent, including a cross-claim or counterclaim.

虽然内容不多，但你还真别想轻易读懂。毕竟法律文书面向的也不是我们这些一般的读者。我们最关心的是，到底还能不能放心使用React？

  

上面的条款虽然很长，但其中的核心内容我已经做了加粗处理。

  

结合网上的资料，把这部分内容用白话简单翻译过来就是说:

```

当发生下列情况时，facebook有权益吊销你的React使用权：

i) 与facebook及其附属机构发生利益冲突

ii) 同任何一个和facebook有关的组织发生了法律纠纷

iii) 同任何与React有关的组织发生利益冲突

```

对于大公司来说，这几点尤其致命。怎么说呢？比如，facebook侵犯了你的专利，同时你的核心产品是基于React实现，如果此时你想起诉facebook，那你就要三思了，因为根据条款它有权利吊销你的React使用权。或者说你用React做了一个产品并且在某些领域对facebook（或它的子公司）构成了威胁（也就是发生了所谓的利益冲突），那么它也可以二话不说，强制你的产品下线。第三点更加唬人，不过到什么程度才叫与React相关的组织，可能还需要更专业的人士来解答。

  

可以说，一旦你开始使用React去构建你的核心产品，你的公司就被facebook埋下了一颗定时炸弹，并且，炸弹的引爆按钮就握在facebook手中。因此，作为行业巨头，不难理解百度的这些顾虑。  

  

不过，作为个人或小团队，我们依然可以放心使用React，毕竟要成长为一个能facebook”发生利益冲突“的公司不是一朝一夕的事。而且，在前端开发的领域，React依然有很多难以取代的优势。



另一方面，尽管有很多大公司依然毫无顾忌的在用React构建产品（比如微软），但经过这次事件，React可能不会再是很多公司前端技术选型的No.1，没有大量使用者的支持，面对各种前端框架环伺，React还能走多远呢？还是希望facebook能意识到这些问题，早日修改协议的附加条款。



延伸阅读：

[选择一个开源软件协议](http://choosealicense.online/)

[如何为你的代码选择一个开源协议](http://www.cnblogs.com/Wayou/p/how_to_choose_a_license.html)

[法律角度你可以放心使用React吗](https://zhuanlan.zhihu.com/p/27990414)

[WTFPL协议](https://zh.wikipedia.org/wiki/WTFPL)

[如何看待百度内部要求全面停止使用React/React Native](https://www.zhihu.com/question/65437198/answer/231290033)

[一年之后，ReactJS许可协议再起争端](https://linux.cn/article-8733-1.html)
