---
layout: post
title: webpack HMR插件原理浅析
categories: 
date: 2017-07-27
---
开发过程中，我们一般都会在webpack的配置文件中添加热更新的插件：

```

plugins: [

    // ...

    new webpack.HotModuleReplacementPlugin(),

    // ...

]

```
有了这个插件，开发过程中，一旦我们对代码进行了改动，webpack会立即rebuild我们的代码，大大提高了开发效率。那么，它背后的原理是什么呢？  

一旦添加了该插件，webpack就会在构建后的文件中添加HMR的服务，当网站被访问时，它向后台轮询发送`/__webpack_hmr`的请求。  

之后我们再通过webpack-dev-server启动一个本地的服务，服务一旦启动，webpack就开始监听所有需要构建的文件内容，当文件发生变化时，它会进行重新打包。当它接受到网站发送的`/__webpack_hmr`请求时，会将更新后的bundle替换掉原有的bundle，这样我们就实现了本地浏览我们的网站以及热更新了。  

但开发的时候，除了一个简单的服务器，我们还希望实现mock数据，调试本地build后的文件等功能。webpack-dev-server无法满足这些需求的情况下，就需要祭出我们的koa/express服务器了。  

koa中，有两个中间件能够替代webpack-dev-server的工作：koa-webpack-dev-middleware和koa-webpack-hot-middleware。  

koa-webpack-dev-middleware本质上就是webpack + webpack-dev-server，那么koa-webpack-hot-middleware的作用是什么呢？  

我们之前提到了，为了实现热更新，网站需要定时发送`__webpack_hmr`请求，当我们使用koa时，我们的koa服务器并不能对该请求做出响应，需要有人将该请求转发给webpack，`koa-webpack-hot-middleware`就扮演的是这样一个角色。   

至此，我们基本理清了hmr的原理及生产环境中的实现，下面是一个简易的包含hmr的koa server:

```

import webpack from  'webpack';

import config from './webpack.dev.conf';

import webpackMiddleware from 'koa-webpack-dev-middleware';

import webpackHotMiddleware from 'koa-webpack-hot-middleware';

import Koa from  'koa';



const app = new Koa();

const middleware = webpackMiddleware(compiler, {

    publicPath: config.output.publicPath,

    contentBase: 'src',

    stats: {

      colors: true,

      hash: false,

      timings: true,

      chunks: false,

      chunkModules: false,

      modules: false

    }

});


app.use(convert(middleware));

app.use(convert(webpackHotMiddleware(compiler)));




app.listen(port, '0.0.0.0', function onStart(err) {

 if (err) {

   console.log(err);

}



  console.info('==>   Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);

});

```
