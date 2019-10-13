---
layout: post
title: NodeJS撸一个简单的区块链（三）
categories: 
date: 2018-05-02
---
本章，我们会通过[levelDB](https://www.npmjs.com/package/level)对区块链的数据进行持久化操作。持久化主要涉及的是对levelDB的使用，如果不懂的地方可以看看leveldb的API。此处用到最多的API就两个，`put`和`get`。

#### 持久化的数据结构

在实现之前，我们首先定义需要持久化数据的结构。此处，我们还是参考比特币的实现。

在比特币中，将两类主要的数据储存在两个bucket中：

```
1. blocks： 保存所有区块的信息

2. chainstate： 保存所有unspent transaction output（即utxos, 未使用的交易输出，这个我们之后会说到）和一些元数据

```

在blocks bucket中，采用key -> value的形式，保存了如下数据：

```

1. 'b' + 32-byte hashID -> 区块的索引记录

2. 'f' + 4-byte 的文件名 -> 文件信息

3. 'l' -> 4byte，指向最后一个区块所在的文件名

4. 'R' -> 1-byte flag, 判断当前是否正在执行索引的创建操作

5. 'F' + 1-byte flag名称的长度 + flag的名字 -> 对应flag的开关

5. 't' + 32-byte 交易hash -> 交易的索引记录

```

chainstate bucket中，保存的数据为：

```

1. 'c' + 32-byte交易hash -> 交易包含的UTXO数据

2. 'B' -> 32-byte 区块hashID

```

关于比特币的实现有兴趣的朋友还可以读一读[bitcoin core](https://en.bitcoin.it/wiki/Bitcoin_Core_0.11_(ch_2):_Data_Storage)

当前的区块链还没涉及对交易的处理，因此我们暂时不储存chainstate，也不考虑通过索引和分片来优化数据的存取速度，仅仅在数据库中保存blocks的主要信息， 包括：

```

1. 'l' -> 最后一个区块的hashID

2. blockHashID -> 序列化的区块数据

```

由于区块链是一个链式结构，因此只要我们通过`l`字段拿到最后一个区块的hashID，我们就可以顺藤摸瓜，遍历整个区块链了。

#### 具体实现

由于数据库中只能储存序列化的数据，因此，我们首先要对区块数据进行序列化/反序列化操作。在JS中，最常用的做法，自然是使用stringify:

```

  serialize() {

    return JSON.stringify({

      timeStamp: this.timeStamp,

      data: this.data,

      prevBlockHash: this.prevBlockHash,

      hash: this.hash

    });

  }

```

增加了一个timestamp字段来记录区块的创建时间。

反序列化：

```

  static deserializeBlock(blockStr) {

    try {

      return new Block(JSON.parse(blockStr));

    } catch(e) {

      console.log(e);

    }

  }

```

有了序列化的区块数据，我们就可以将他们储存到数据库中。

通过对区块数据进行序列化，我们就可以将它储存到数据库中；对数据库中的数据执行反序列化，我们就可以在内存中实例化区块。将区块信息实例化之后，我们就可以初始化整个区块链。

这里有两种情况需要考虑：已经存在区块链数据以及区块信息为空的情况。下面简单说说解决的步骤：

1. 访问数据库

2. 查看数据库中是否已经储存了区块链数据

3. 若已经储存了区块链数据：

    * 创建一个新的blockchain实例

    * 读取数据库中的区块链信息，并用它来初始化区块链

4. 若还未储存数据：

    * 调用`newGenesisBlock`创建创世区块

    * 将区块信息保存到数据库中

    * 将创世区块的HashID保存到`l`字段中

    * 用创世区块数据来初始化一个新的区块链

  

读取数据库并初始化区块链的代码如下:

```

const DB = 'chainDB';



  function newBlockChain() {

    const db = level(DB);

    

    return db.get('l')

      .then(() => {

        return Promise.resolve(new BlockChain(db));

      })

      .catch((e) => {

        const genesis = BlockChain.newGenesisBlock();



        return db.put('l', genesis.hash)

          .then(() => {

            return db.put(genesis.hash, genesis.serialize());

          })

          .then(() => {

            return Promise.resolve(new BlockChain(db));

          })

        ;

      })

    ;

  }

```

首先我们调用`level(DB)`与数据库建立连接，接着调用`db.get('l')`获取最后一个区块的hashID，若存在，则我们初始化区块链，如果不存在，则调用`newGenesisBlock`后，使用`db.put`将区块信息写入到数据库中，再初始化区块链。

区块链初始化以后，我们添加如下代码，赋予节点向区块链中写入并持久化数据的能力:

```

class BlockChain {

  //...

  getLastHash() {

    return this.db.get('l')

      .then((lastHash) => {

        return Promise.resolve(lastHash);

      })

      .catch((e) => {

        return e;

      })

    ;

  }



  addBlock(data) {

    return this.getLastHash()

      .then((hash) => {

        const newBlock = Block.newBlock(data, hash);

        this.db.put(newBlock.hash, newBlock.serialize())

          .then(() => {

            return this.db.put('l', newBlock.hash).then(() => Promise.resolve());

          })

        ;

      })

    ;

  }

  //...

}

```

在`addBlock`方法中，首先通过`getLashHash`函数拿到最新的区块ID，接着将它作为下一个区块的parentHashId，创建一个新的区块，最后对新区块执行序列化操作并写入到数据库中。完成这一些操作之后，我们会将数据库中的`l`字段更新为刚刚创建的区块的hashID。

通过这几个方法，我们已经可以将区块链储存到本地的数据库中，而不必在每次程序运行时生成一个新的区块链。但此处还有一个问题：

比如当我们需要查找区块链中是否包含某些数据时，我们还并没有一个有效的方法去遍历这个区块链。下我们通过实现一个迭代器来实现这个功能：

```

class ChainIterator {

  constructor(chain) {

    this.chain = chain;



    this.nextHash = null;

  }



  next() {

    const iterToNext = (hash) => {

      return this.chain

        .getBlock(hash)

        .then((block) => {

          this.nextHash = block.prevBlockHash;



          return Promise.resolve(block);

        })

        .catch((e) => {

          return Promise.reject(e);

        })

      ;

    };



    if(this.nextHash === '') {

      return Promise.resolve(null);

    }



    if(!this.nextHash && this.nextHash !== '') {

      return this.chain.getLastHash()

        .then(iterToNext)

      ;

    }



    return iterToNext(this.nextHash);

  }

}



module.exports = ChainIterator;

```

现在，通过不断调用迭代器提供的`next`方法，我们就可以遍历整个区块链了。

下面，我们编写一段简单的测试代码，看看效果：

```

BlockChain.newBlockChain().then((chain) => {

  chain.addBlock('test').then(() => {

    const iter = new ChainIter(chain);

    iter.next().then((block) => {

      console.log('block', block);

      iter.next().then((block) => {

        console.log('block', block);

      }).catch((e) => {

        console.log(e);

      });

    });

  });

});

```

连续调用两次该操作后，控制台的输出为：

```

{"timeStamp":1525250246160,"data":"test",

"prevBlockHash":"00ed8f133eac47bfba53025ba2ec9ee2b32a1e14cdde631888843771fd46e161",

"hash":"00339cc47740f5ba2fa8201010a91f9fd60e8bdf355ed33

835783e730066f5d0"}

block Block {

  timeStamp: 1525250246160,

  data: 'test',

  prevBlockHash: '00ed8f133eac47bfba53025ba2ec9ee2b32a1e14cdde631888843771fd46e161',

  hash: '00339cc47740f5ba2fa8201010a91f9fd60e8bdf355ed33835783e730066f5d0' }

{"timeStamp":1525250246022,"data":"GenesisBlock","prevBlockHash":"",

"hash":"00ed8f133eac47bfba53025ba2ec9ee2b32a1e14cdde631888843771fd46e161"}

block Block {

  timeStamp: 1525250246022,

  data: 'GenesisBlock',

  prevBlockHash: '',

  hash: '00ed8f133eac47bfba53025ba2ec9ee2b32a1e14cdde631888843771fd46e161' }

```

看来我们成功更新了数据库中的区块链信息，mission complete!

#### 结论

这一章我们实现了对区块链数据的持久化。前面我们提到过，比特币的持久化包含对`block`和`chainstate`，下一章，我们会实现一个基本的交易[utxo模型](https://draveness.me/utxo-account-models)。在那之后，我们再回过头实现对`chainstate`的持久化。
