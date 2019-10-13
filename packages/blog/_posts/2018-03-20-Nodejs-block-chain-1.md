---
layout: post
title: Nodejs撸一个简单的区块链（一）
categories: 
date: 2018-03-20
---
最近区块链概念大火，炒币、智能合约、闪电链等等各种新概念层出不穷，看的我们眼花缭乱。站在大时代的风口上，前端工程师难道就只能选择观望吗？不要忘了我们有NodeJS这个利器。下面就跟着我一起通过NodeJS来揭开区块链世界的神秘面纱吧。
  
不过，在开始开发之前，很多人肯定首先要问一句：

#### 什么是区块链？

一言以蔽之，区块链就是一种分布式数据库。分布式数据库并不是刚刚出现的新概念，经历了许多年的发展，它已经形成了一套相当成熟的体系。那么，区块链技术是如何从中脱颖而出呢？

#### 分布式数据库，分布式账本和区块链

要想回答上面的问题，我们就要搞清楚这三个概念的关系。分布式数据库，百度给它的定义是是指利用高速计算机网络将物理上分散的多个数据存储单元连接起来组成一个逻辑上统一的数据库。从这个角度来说，它和分布式账本没什么不同：都是将数据分散存储的一种技术。那么为什么我们还要提出分布式账本这个概念呢？

上面提到了，在分布式数据库中，**多个数据存储单元连接起来组成一个逻辑上统一的数据库**。翻译过来，就是说在分布式数据库中，所有节点之间都是相互信任的，它们可以保证即使每个节点只保存一部分数据，将所有节点的数据整合后依然可以拿到完整的正确的数据。然而，分布式账本面对的却是完全不同的陌生环境。

在分布式账本的世界里，每一个节点都是不可靠的，因此每个节点必须要保存完整的数据来保证数据不被恶意节点篡改。为了保证大部分人数据的可靠，分布式账本需要存在某种机制，使得所有节点能够就数据的更改达成共识。可以说，分布式账本面临着远比分布式数据库严酷的生存环境。因此，分布式账本可以作为分布式数据库来使用，然而现有的分布式数据库往往都不能满足分布式账本的需求。

那么区块链和二者的关系又是什么呢？

描述了分布式账本技术中，数据储存的结构。分布式账本可以采用各种各样的方式来储存它的数据，然而在区块链中，我们规定数据采用区块+链的模式进行储存。因此，我们可以说区块链可以说是分布式账本技术的子集。

英文比较好的同学可以读一读这篇文章[distributed ledger || database](https://gendal.me/2016/11/08/on-distributed-databases-and-distributed-ledgers/)

#### 区块和链

区块链中，区块是最基本的数据储存单元。区块创建时，除了会保存数据，还会通过[sha256算法](http://blog.sina.com.cn/s/blog_d66494300102wz0z.html)计算出能唯一标识它的hash值。并且，每个区块中都记录着它前一个区块的hash(prevBlockHash)，无数个区块通过这样的方式串联在一起，就构成了最基本的“区块链”。我们只需要知道最后一个区块对应的hash值，就可以毫不费力的遍历区块，拿到所有的数据。

下面，让我们来看看一个最基本的区块长什么样：

```

class Block {

    constructor({ timeStamp, data, prevBlockHash, hash }) {

        this.timeStamp = timeStamp;

        this.data = data;

        this.prevBlockHash = prevBlockHash;

        this.hash = hash;

    }

}

```

是不是出乎意料的简单？

有了区块，接着，我们实现一个“链”来保存这些区块:

```

class BlockChain {

    constructor(blocks = []) {

        this.blocks = blocks;

    }

    

    addBlock(data) {

        const prevBlock = this.blocks[this.blocks.length - 1];

        const newBlock = newBlock(data, prevBlock.hash);

        this.blocks.push(newBlock);

    }

}

```

之前我们提到了，在区块链中，每一个区块都会被一个hash值唯一标识，因此添加区块时，我们需要计算出当前区块的hash。此处为了避免产生相同的hash，计算hash时，我们加入了当前系统的时间戳和前一个区块的hash值作为参数：

```

  function newBlock(data, prevBlockHash) {

    const block = new Block({

      timeStamp: new Date().getTime(),

      data,

      prevBlockHash

    });



    block.setHash();



    return block;

  }

   Block {

      //...

     setHash() {

       const headers = this.prevBlockHash + this.data + this.timeStamp;

       this.hash = sha256(headers);

     }

   }

```

当我们添加区块时，我们需要拿到前一个区块的hash，但一开始，我们的链上一个区块都没有，我们又该如何向它添加区块呢？

为了避免这个问题，当我们初始化区块链的时候，默认会创建一个区块，该区块的prevBlockHash为空。中本聪称它为**创世区块(GenesisBlock)**。

下面我们看看如何初始化区块链：

```

  function newBlockChain() {

    return new BlockChain([BlockChain.newGenesisBlock()]);

  }



  function newGenesisBlock() {

    return Block.newBlock("GenesisBlock", "");

  }

```

有了这些方法，我们的迷你区块链就算搭建完成了。下面让我们运行一下:

```

const chain = newBlockChain();



addBlock('hello, world');

console.log(chain);

```

控制台中输出:

```

BlockChain {

  blocks:

   [ Block {

       timeStamp: 1521475867526,

       data: 'GenesisBlock',

       prevBlockHash: '',

       hash: '67d4953d5760415a66a5bf9effc8cc9dc8e468660c96ed04d6f4ade0bfaa438c' },

     Block {

       timeStamp: 1521475867528,

       data: 'hello, world',

       prevBlockHash: '67d4953d5760415a66a5bf9effc8cc9dc8e468660c96ed04d6f4ade0bfaa438c',

       hash: '9f4895eaa71abca2b0937869e9b5650429970ce0093fd35189490a8a7df46f20' } ] }

```

大功告成！

#### 结论

当然，尽管这个简单的原型只包括了区块链最基本的数据结构，和真正的区块链实现还差了十万八千里, 但通过这它, 大家应该可以对区块链的概念建立一个初步的映像: 区块链并不是技术的创新, 而是通过对已有技术进行组合, 而诞生的一种全新的架构。之后, 我们会在这个基本的区块链添加POW算法, 记录交易信息并实现点对点的通信。让我们一步步见证这个新的架构如何爆发出颠覆性的力量。
