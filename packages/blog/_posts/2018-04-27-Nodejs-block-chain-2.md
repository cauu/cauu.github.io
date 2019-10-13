---
layout: post
title: NodeJS撸一个简单的区块链（二）
categories: 
date: 2018-04-27
---
[前一篇文章](https://cauu.github.io/2018/03/Nodejs-block-chain-1/)中，我们实现了区块链基本的数据结构：通过哈希值，将一个一个区块串联在了一起。不过，在这个实现中，有一个明显的问题：我们的系统没有任何权限控制的机制限制用户对区块链的操作，任何人都可以轻易通过`addBlock`函数向区块链中添加新的区块。可以想象，如果网络中的每个节点都随意的向区块链中添加数据，那么区块链将会变成一张混乱无序的图，链唯一性和可靠性就无从谈起。为了解决这个问题，中本聪创造性的提出了POW算法。

#### POW算法（工作量证明机制）的原理

以比特币为例，当节点希望获得向比特币的链中添加一个新的区块时，它首先需要解决一个数学难题。如果它成功解出这道题目，它将会把题目和“答案”一起广播到比特币网络中，供其他节点验证，验证通过的节点会将新的区块添加到它的区块链末尾。另一方面，同一时间可能会有多个节点算出答案，这时，链可能会分叉，为了避免这种情况，网络中的节点始终会以最长的链作为有效的结果。当节点收到一条更长的链的广播时，它就会把本地数据替换为更长的那条链。通过这种方式，网络中的所有节点在一定时间周期之后得以达成一致，即基于算法正确性和最长链原则的共识算法。

事实上，如果把比特币的网络类比于现实世界，那么在比特币就是这个网络的工资，矿工则是网络中的工人。节点必须付出劳动（算力），才能获得相应的报酬，节点的劳动成本推高了币价，而币价的上涨又刺激节点提供更多的算力，进而形成一个正向的反馈。一旦这个反馈形成，节点就会不遗余力的去维护网络的正常运行，整个网络以一种自发的方式不断运行下去。

#### 具体实现

之前我们通过`addBlock`函数添加新的区块。加入POW算法之后，添加区块之前，我们必须解出一道复杂的数学题目，这里我们采用比特币类似的算法sha256。

对任意数据进行sha256计算，我们都能得到一个256位的唯一值。比特币会提供一个难度系数（比如4），我们的目标就是找到一个数n，使得sha256(n) < 00001.....0(256位)成立。下面我们看看怎么去实现这一过程:

首先，定义难度系数:

```

const targetBits = 8;

```

在比特币的网络中，难度系数会动态的进行调整，使得无论算力大小，都可以保证平均的出块时间为10分钟。但此处，我们会把它写死。

接着，定义POW算法: 

```

class POW {

  constructor(block, targetNonce) {

    this.block = block;

    this.targetNonce = targetNonce;

  }

  prepareData(nonce) {

    return this.block.prevBlockHash

      + this.block.data

      + this.block.timeStamp

      + targetBits

      + nonce

    ;

  }



  validate() {

    const data = this.prepareData(this.block.nonce);

    const hash = sha256(data);



    return this.targetNonce.greater(bigInt(hash, 16));

  }

  run() {

    let nonce = 0;

    let hash;

    while(nonce < Number.MAX_VALUE) {

      const data = this.prepareData(nonce);

      hash = sha256(data);

      if(this.targetNonce.greater(bigInt(hash, 16))) {

        break;

      } else {

        nonce++;

      }

    }



    return {

      nonce,

      hash

    };

  }

}

```

其中的核心方法是`run`函数，它通过while循环不断改变nonce，最终找到一个满足公式的nonce。validate函数则用于验证区块提供的答案的合理性。

由于js不支持对256位数字的运算,此处我们用到了`bigInt`库,通过它提供的`greater`方法对大数字进行比较.

接着修改`newBlock`函数,使得pow算法成为创建一个新区块的前置条件:

```

function newBlock(data, prevBlockHash) {

    // ...

    const { nonce, hash } = POW.newProofOfWork(block).run();

    block.hash = hash;

    block.nonce = nonce;

    // ....

}

```



最后, 修改一下`index.js`, 我们就可以模拟一个简单的挖矿操作了.

```

const bigInt = require('big-integer');

const sha256 = require('sha256');

const moment = require('moment');



const BlockChain = require('./chain');

const POW = require('./pow');



const chain = BlockChain.newBlockChain();

process.stdout.write('\n');

chain.addBlock('My first transaction!');

chain.addBlock('My second transaction!');

process.stdout.write('\n');

chain.blocks.map((block, index) => {

  const {prevBlockHash, data, hash, timeStamp} = block;

  console.log(`Block${index}`);

  console.log(`PrevHash: ${prevBlockHash || '无'}`);

  console.log(`data: ${data}`);

  console.log(`hash: ${hash}`);

  console.log(`createdAt: ${moment(timeStamp).format('YYYY-MM-DD hh:mm:ss')}`);

  console.log(`POW: ${POW.newProofOfWork(block).validate()}`);

  console.log('---------------------------------');

});

```

输出为:

```

正在计算: 00b56b1d2d21e944c94c19ddbff3243513a57a76a0436275a4b25c8b065e27c7

正在计算: 0099ba9f6cc82b345be2726d3efdf80b391cb5322ddf53057e2e34a6e8e8ecb8

Block0

PrevHash: 无

data: GenesisBlock

hash: 00b56b1d2d21e944c94c19ddbff3243513a57a76a0436275a4b25c8b065e27c7

createdAt: 2018-04-27 10:23:31

POW: true

---------------------------------

Block1

PrevHash: 00b56b1d2d21e944c94c19ddbff3243513a57a76a0436275a4b25c8b065e27c7

data: My first transaction!

hash: 00bbeb8b4ce5705cff4ea687a61d44e6444462e8ba69341de1531de9bd636edd

createdAt: 2018-04-27 10:23:31

POW: true

---------------------------------

Block2

PrevHash: 00bbeb8b4ce5705cff4ea687a61d44e6444462e8ba69341de1531de9bd636edd

data: My second transaction!

hash: 0099ba9f6cc82b345be2726d3efdf80b391cb5322ddf53057e2e34a6e8e8ecb8

createdAt: 2018-04-27 10:23:31

POW: true

---------------------------------

```

当难度系数为8时,我们很快就找到了两个这样的数字`00b56b1d2d21e944c94c19ddbff3243513a57a76a0436275a4b25c8b065e27c7`和`00bbeb8b4ce5705cff4ea687a61d44e6444462e8ba69341de1531de9bd636edd`, 并基于它们创建了新的区块.如果感兴趣,可以适当调整这个难度系数, 可以看到,当难度系数足够大时, 挖矿会持续相当长的时间。

#### 结论

本章结束之后，我们的区块链又向前迈进了一小步：现在创建新的区块需要挖矿了。不过由于当前只有一个节点运行，因此我们还不能对挖矿的结果达成共识。另一个很明显的缺陷是，当前区块链的信息是保存在内存中，当程序关闭时，区块的信息就会丢失。在下一章我们会实现对区块链的持久化处理。

参考:

[js中最大安全整数类型](https://www.zhihu.com/question/29010688)

[比特币的区块与共识](https://blog.csdn.net/lhq186/article/details/77343201)
