---
layout: post
title: 安装node-sass的正确姿势
categories: 技术 
date: 2016-09-08
---

使用npm安装node-sass时，常常会遇到安装失败的情况，多数时候都会伴随404 error。究其原因，在于node-sass安装过程依赖于一个从github上下载的二进制文件，而国内的网络环境嘛，大家都懂的。解决方案也很简单，主要有下面几种：  

### 1. 翻墙  
最简单粗暴的解决方法，不多说。  
  
### 2. 使用淘宝镜像安装
cnpm的包管理方式还停留在node4.0，因此对于最新版的node，暂时不支持这种安装方式。不过如果你的node版本<=4.0，可以考虑使用cnpm安装所有依赖。
```
npm install -g cnpm --registry=https://registry.npm.taobao.org
cnpm install node-sass
```
  
### 3. 手动下载二进制文件
* 前往[node-sass-binaries](https://github.com/sass/node-sass-binaries)下载相应版本的二进制文件。
* 调用```npm install node-sass -sass-binary-path=/path/to/your/linux-x64-48_binding.node```安装node-sass(如果二进制文件没问题的话，这次应该能安装成功)
* 切换到工程目录，执行

 ```
 cp /path/to/your/linux-x64-48_binding.node node_modules/node-sass/vendor/darwin-x64-48/binding.node 
 ```
* 问题解决！