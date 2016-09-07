---
layout: post
title: Mocha单元测试入门
categories: 技术
date: 2016-09-07
---  
  
### 什么是Mocha  
Mocha是一个简单灵活的javascript测试框架，用于nodejs和浏览器上的javascript应用测试。

### 搭建Mocha测试环境
安装依赖:

```
mkdir myproject
cd myproject
npm install --global mocha 
npm install mochawesome --save-dev //
npm install should //断言库;可以用chai或类似的库代替

npm install gulp --global
npm install gulp-env --save-dev
npm install gulp-mocha --save-dev
```

在根目录下创建gulpfile.js: 
 
```
let path = require('path');
let gulp = require('gulp');
let mocha = require¡'gulp-mocha');
let env = require('gulp-env');

gulp.task('set-env', function() {
  env({
    vars: {
      'NODE_ENV': 'test'
    }
  });
});

gulp.task('test', ['set-env'], function() {
  gulp
    .src(
      path.join('test', '/**/*.test.js'), 
      { read: false }
    )
    .pipe(
      mocha({
        reporter: 'list',
        require: ['should'],
        timeout: 5000
      })
    )
    .once('error', function() {
      process.exit(1);
    })
    .once('end', function() {
      process.exit();
    })
  ;
});

```
之后就可以通过``gulp test``调用位于./test目录下的测试用例了。
  
### 编写基本测试用例
假如我们要测试的脚本是add.js: 
  
```
function add(x, y) {
	return x + y;
}
module.exports = add;
```

我们可以在./test目录下添加相应的测试用例add.test.js:
  
```
var add = require('./add.js');
var should = require('should');

describe('加法函数测试', function() {
    it('1加1应该等于2', function() {
        add(1, 1).should.be.equal(2);
    });
});
```

其中:  

* require('./add.js')引入需要测试的模块   
* require('should')引入了断言库should  
* describe块包含一组相关的测试用例，每一个测试用例对应一个it块，如测试add方法时，我们可能需要测试两个负数相加，两个小数相加等多种情况。
* 每一个it块都是一个测试用例，他们是单元测试的最小单位。
  
总结一下，一个测试脚本包含了多个测试套件和他们对应的测试用例，通过编写周密的测试用例，我们可以将代码中的大部分bug扼杀在摇篮中。

### 测试后端api
我们可以把每一个api看做一个函数，给定一组输入判断其对应的输出。唯一不同之处在于，api的输入来自于http请求，因此模拟http请求就成了api测试的关键。此处，我们使用supertest来模拟http请求。
首先安装supertest:
  
```
npm install supertest --save-dev
```
比如我们想测试一个简单的基于express服务app.js:

```
var express = require('express');

var app = express();

app.get('/user', function(req, res) {
  res.status(200).json({ name: 'tobi' });
});

app.listen(3000);

module.exports = app;
```

接着，我们在./test目录下添加相应的测试用例app.test.js:

```
const app = require('../app.js');
const request = require('supertest')(app.listen());
const should = require('should');

describe('GET /user', function() {
  it('respond with json', function(done) {
    request(app)
      .get('/user')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        res.body.name.should.be.equal('tobi');
        done();        
      });
  });
});
```
调用``gulp test``就可以看到相应的测试结果。

除了编写独立的测试用例，如果我们的api涉及到对数据库中数据的更改，我们可以通过before和after模块，添加/删除测试数据，保证数据库的纯净。


### 测试React组件

由于React页面使用jsx模板语言进行渲染，因此，如同所有的动态网站测试，我们可以等待网页渲染完成之后再对其组件进行测试。然而，React还存在一个独一无二的概念：VirtualDOM，因此，如果我们的测试用例不涉及和真实DOM的交互，我们完全可以通过VirtualDOM测试DOM中的内容即可。
基于这两种情况，react官方为我们提供了相应的测试工具库：react-addons-test-utils。还是通过例子来说明其用法。
首先实现一个简单的React Component Title:

```
//./Title.jsx
import React from 'react';
class Title extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
        <div>This is a Title</div>
    );
  }
}
export default Title;
```

接着引入官方测试工具集，之后我们会在测试用例中用到该方法:
 
```
//./test/utils.js
import TestUtils from 'react-addons-test-utils';
function shallowRender(Component, props) {
    const renderer = TestUtiles.createRenderer();
    renderer.render(<Component {...props} />);
    return renderer.getRenderOutput(); 
}
export.shallow = shallowRender;
```

在./test目录下添加相应的测试用例title.test.js:

```
import Title from '../Title.jsx';
import { shallow } from './utils.js';
import should from 'should';

describe('虚拟DOM渲染测试', function() {(
)    it('Title的标题', function() {
        const app = shallow(Title);
        app.props.children[0].props.children.should.be.equal('This is a Title');
     )};
});
```
这样我们就实现对虚拟DOM的测试。

参考资料:  
  
[测试框架实例教程-阮一峰](http://www.ruanyifeng.com/blog/2015/12/a-mocha-tutorial-of-examples.html)
  
[React测试入门教程](http://www.ruanyifeng.com/blog/2016/02/react-testing-tutorial.html)
  
[supertest](https://github.com/visionmedia/supertest)  
  
[should-js](http://unitjs.com/guide/should-js.html)
