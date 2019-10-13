---
layout: post
title: iqc system development
categories: 
date: 2018-02-05
---
最近完成了质检系统第一阶段的开发，在实现的时候，加入了一些新的东西和之前较少用到的特性。总结下来，值得回味的大概有下面这几点：

* 通过react-router v4实现路由

* 使用[import()函数](http://2ality.com/2017/01/import-operator.html)实现模块的动态加载

* [react-container-query](https://github.com/d6u/react-container-query)实现响应式的布局

* 通过react-url-query实现了对antd form状态管理的优化

* 学习并了解了g2的基本用法

* 实现了一个简单的音频播放器

  

下面，针对每一个点简单聊聊思路及实现。

#### 1.  react-router v4的使用及模块动态加载的实现

react-router v4从思路上对老的实现进行了颠覆，彻底贯彻了React模块化的设计思想，每一个Router都可以看作是一个单独的模块，被插入到不同的组件中。举个例子:

```

// PageA的url: /page/A

// PageB的url: /page/B

// 我们定义了组件C的render函数如下:

class C extends React.Component {
    //...

    render() {
      return (

        <div>

            <Route path={`${match.url}/C`} component={C} />

        </div>

      );

    }

}

// 如果组件C被插入到页面A中，那么访问 /page/A/C时，组件C就会被渲染

// 如果它被插入到B中，同样的，/page/B/C会显示组件C

```

这样的实现为可插拔的组件和模块的动态加载提供了基础。

在react-router v4的基础上，结合[dva/dynamic](https://github.com/dvajs/dva/blob/master/packages/dva/src/dynamic.js)实现了模块的动态加载功能。具体实现如下:

```

import dynamic from 'dva/dynamic';

const dynamicWrapper = (app, models, component) => dynamic({

  app,

  models: () => models.map(m => import(`models/${m}.js`)),

  component,

});



export default (app) => [

  {

    component: dynamicWrapper(app, ['user'], () => import('layouts/basic')),

    layout: 'basic',

    children: [

      {

        name: '首页',

        icon: 'dashboard',

        path: '/',

        component: dynamicWrapper(app, ['dashboard'], () => import('pages/basic/dashboard'))

      },

    ]

  }

];

```

dva/dynamic的源码并不复杂，其本质就是基于[import()函数](http://2ality.com/2017/01/import-operator.html)实现的hoc，所以到最后，问题就成了，在最新ES标准中，如何使用import实现模块的动态加载?

简单来说，dynamic import是ES即将添加的新特性（目前处于stage3阶段），通过dynamic import，我们可以很方便的实现模块的懒加载和按需加载；由于模块的加载是在运行时，我们还可以方便的向其中注入参数。语法`import('module-name.js')`会返回一个promise，模块对象会返回到then方法的回调函数中。关于这部分的应用可以看看[dva/dynamic的源码](https://github.com/dvajs/dva/blob/master/packages/dva/src/dynamic.js)。

#### 2.  通过react-url-query收集antd的表单数据，并映射到url

后台管理系统中，用户经常需要填写复杂的表单，既然是表单，那么undo和redo功能就是必不可少的。在webapp中，我们常见的做法可能是通过redux/dva来管理表单状态，并为用户提供undo/redo的功能，但相比桌面端的软件，网页app又有其特殊性：

  

1. 用户一旦刷新页面，我们储存在内存中的状态就会丢失，导致用户需要重新填写表单。

2. 由于浏览器一般都提供了前进/后退的功能，用户习惯性的会认为通过前进/后退页面就可以回到之前的状态，而这样的操作很容易导致填写的数据丢失。

3. 当用户将网页复制给他人时，不能完美的复现用户当前的页面效果。基于这三点，我们考虑将数据储存在url中。

  

事实上，只要稍加留意，就会发现这个解决方案早已存在于许多网站中，无论是google、百度还是淘宝，在涉及搜索业务时，都采用了这种方式。而这也完美的解决上述的三个痛点，唯一的问题可能就是留下了一串丑陋的url。不过相比于它的便捷性，这点小问题完全可以忍受。

那么在我们的系统中，我们是如何实现这一功能呢？

首先它依赖了[react-url-query](https://github.com/pbeshai/react-url-query)，这个库仿照react-redux，实现了一个高阶函数，通过该函数，我们可以将url中的参数自动映射为组件的props，并更新组件，同时我们实现的searchable高阶函数会调用antd的表单方法，获取所有的表单数据；当props更新时，会调用antd-form的setFields函数，为相应的表单域赋值。被searchable封装的组件只需要实现一个onsearch方法，就可以对收集到的表单数据执行相应的操作。

具体的实现如下（由于业务需要，增加了保存到localstorage的功能）：

```

import React, { Component } from 'react';

import moment from 'moment';

import _ from 'lodash';

// import Debounce from 'lodash-decorators/debounce';

// import Throttle from 'lodash-decorators/throttle';

import PropTypes from 'prop-types';

import { Form } from 'antd';

import {

  addUrlProps,

  pushUrlQuery

} from 'react-url-query';

import { Base64 } from 'js-base64';



/**

 * @desc

 * props: {

 *   onSearch: 数据采集完成之后的回调函数，用来处理业务逻辑,

 *   onReset: 重置表单之后回调

 * }

 *

 */

/**

 * @todo

 * 增加对复杂表单数据的支持

 */

export default ({ onValuesChange = () => {}, onFieldsChange = () => {} }) => (WrappedComponent) => {

  class SearchableTable extends Component {

    static propTypes = {

      conditions: PropTypes.object.isRequired,

      filterValue: PropTypes.array,

      location: PropTypes.object,

      history: PropTypes.object,

      onSearch: PropTypes.func,

      onReset: PropTypes.func,

      onCollectData: PropTypes.func

    };



    static defaultProps = {

      filterValue: [],

      conditions: {}

    };



    constructor(props) {

      super(props);



      this.state = {

        dataSource: []

      };



      this.onRefresh = this.onRefresh.bind(this);

      this.onSearch = this.onSearch.bind(this);

    }



    componentDidMount() {

      const { conditions } = this.props;



      this.onRefresh({}, conditions);



      this.onSearch({}, false);

    }



    componentWillReceiveProps(nextProps) {

      /**

       * @todo

       * mapConditionsToUrl后，

       * 会触发该方法，导致重复调用api

       */

      if(!_.isEqual(nextProps.conditions, this.props.conditions) && this.props.location.search !== nextProps.location.search) {

        this.onRefresh(this.props.conditions, nextProps.conditions);

      }

    }



    mapQueryToUrl = (searchConditions) => {

      pushUrlQuery({ sc: Base64.encode(JSON.stringify(searchConditions)) });

    }



    mapQueryToLocastorage = (searchConditions, saveToHistory = true) => {

      const condition = Base64.encode(JSON.stringify({ ...searchConditions, createdAt: moment() }));



      localStorage.setItem('search_recent', condition);



      if(!saveToHistory) return;



      let searchHistory = [];



      _.range(0, 3).map((index) => {

        const item = localStorage.getItem(`search_${index}`);

        item && searchHistory.push(item);

      });



      if(searchHistory.length >= 3) {

        searchHistory = searchHistory.slice(1);

      }



      searchHistory.push(condition);



      searchHistory.forEach((history, index) => {

        localStorage.setItem(`search_${index}`, history);

      });

    }



    /**

     * @desc

     * 该方法将自动收集url, form、onCollectData和参数中的数据

     * 并进行搜索

     */

    onSearch(params = {}, saveToHistory = true) {

      const { onSearch: search, form, onCollectData, filterValue, conditions } = this.props;



      const searchParam = {};



      const collected = onCollectData && onCollectData() || {};



      form.validateFields((err, data) => {

        if(err) return;



        data = { ...conditions, ...data, ...collected, ...params };



        const filterUnused = (result) => (obj) => (key) => {

          if(obj.hasOwnProperty(key) && !!obj[key] && !filterValue.includes(obj[key])) {

            result[key] = obj[key];

          }

        };



        Object.keys(data).map(filterUnused(searchParam)(data));



        search && search(searchParam);



        /**

         * @hack

         * @todo

         * 重置form的fields并重新设置（触发initialValue),

         * 最好修改为重置的时候变成每个表单的默认值（也就是能取道表单的defaultValue)

         */

        this.mapQueryToLocastorage(searchParam, saveToHistory);



        this.mapQueryToUrl(searchParam);

      });

    }



    onReset = (params = {}, saveToHistory = false) => {

      const { form, onReset: reset, onSearch: search } = this.props;



      form.resetFields();



      reset && reset();



      search(params || {});



      this.mapQueryToLocastorage(params || {}, saveToHistory);



      this.mapQueryToUrl(params || {});

    }



    onRefresh(prevCond, nextCond) {

      const { form } = this.props;



      const merged = Object.keys(prevCond).reduce((acc, prevKey) => {

        if(!nextCond[prevKey]) {

          acc[prevKey] = '';

        } else {

          acc[prevKey] = nextCond[prevKey];

        }

        return acc;

      }, { ...prevCond });



      form.setFieldsValue({ ...nextCond, ...merged });

      /** @todo 更新表单中非form中的内容 */

      // this.onSearch({ ...nextCond, ...merged });

    }



    render() {

      const { form, ...others } = this.props;



      return (

        <WrappedComponent

          {...others}

          onSearch={this.onSearch}

          onReset={this.onReset}

          form={form}

          conditions />

      );

    }

  }



  return addUrlProps({

    mapUrlToProps: (url) => ({ conditions: url.sc && JSON.parse(Base64.decode(url.sc)) || {}  }),

    mapUrlChangeHandlersToProps: () => {}

  })(Form.create({

    onValuesChange,

    onFieldsChange

  })(SearchableTable));

};

```

#### 3. [G2 chart](https://github.com/antvis/g2)的基本用法

G2是阿里实现的一个开源绘制图形的库，采用类似于D3的声明式语法，就可以绘制出统计上常用的图表。G2中，绘制一个图形主要分为两部：首先定义它的各个要素的表现形式（包括data, view, legend, axis等），然后调用draw方法即可。关于G2的进一步使用可以参考他们的[官方文档](https://antv.alipay.com/zh-cn/g2/3.x/api/index.html)。

#### 4. 如何实现简单的音频播放器?

一个可视化的音频播放器需要实现一些基本的功能：

* 基本的播放、前进、后退、暂停

* 音量控制

* 波形图

  

h5的audio对象已经为了我们封装了播放、暂停、音量等API，因此，我们只需要获取到原生的audio对象就可以实现对音频的控制。在React中，通过ref可以取得audio对象，接着调用封装的`currentTime, duration, volume`属性，就可以取得当前音频文件的播放进度、总时间和当前的音量；另一方面，audio的`play(), pause()`方法提供了播放/暂停功能。基于它们，我们就可以轻松的实现播放器的基础功能了。

除了上述基础功能，我们还需要实现波形图。

在实现之前，我们要先问问自己：

* [声音的波形和频谱分别是什么？波形图要展示的是什么？](https://www.zhihu.com/question/29712404)

首先，声音是由于空气分子振动产生的，决定我们听到的声音效果主要由两个因素决定：振幅和频率。声音的频率越高，音高越高。振幅越大，音量越大。

  



上图表示某个频率下，声音随时间变化的波形图。然而，现实世界中，我们听到的所有声音都是由不只一个频段的声波振动叠加而成，因此，上图这种理想化的图形在实际操纵中是几乎遇不到。在实际生活中，我们常见的关于音频的图形一般有两种：表示音量随时间变化的波形图，和表示各个频率下音量大小的频谱图。

下面针对两种情况分别聊聊实现的思路：

* [实时波形展示](http://blog.csdn.net/twobyte/article/details/62043425)

根据上面的结论，实时的波形更准确的说法应该是声音频谱。在某个时间点，用频率做为我们的横坐标，声音的强度（也就是振幅）做为纵坐标，就可以得到当前时间点各个频段声音的强度图（也就是所谓的频谱）。下图就是音频播放器中的一个典型频谱图。



很复杂？好在html5的audiocontext对象已经为我们封装了一套API，通过它，我们可以轻松绘制出声音的频谱。具体的实现可以参考[此处](http://blog.csdn.net/twobyte/article/details/62043425)

* 音频文件波形

如果横坐标表示时间，纵坐标表示当前时间点声音的大小（也就是振幅），就可以画出一个波形图。通过波形图，可以直观的看到各个时间点音量的相对大小，但无法获得任何关于声音频率的信息。类似与这样：



对于这种情况，我们首先等待audio对象的load函数执行完成，获得整个音频的数据，接着调用[wavesurfer](https://wavesurfer-js.org/)库封装的方法，就可以得到整个音频文件的波形图。需要注意的是，wavesurfer不能处理跨域的音频文件，因此需要服务端对跨域的文件进行支持。
