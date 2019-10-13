---
layout: post
title: 原生js实现一个简单的前端路由
categories: 
date: 2019-09-18
---

如今，前端开发大部分时间都在和vue、react等单页应用(SPA)框架打交道，这些框架的实现虽然各不相同，但所有的框架都离不开前端路由这个基础，甚至可以说，SPA就是前端路由+模版渲染引擎。  
  
尽管前端路由如此重要，但我们很多时候都把它当作了理所当然，而将其忽略了。这篇文章将通过原生js实现一个最简单的前端路由工具来帮助我们更加深入的理解前端路由的本质。  

### 目标 && 难点  
采用服务端渲染时，每一次url改变都需要重新向服务端请求相应的资源，在前端路由中，我们首要目标就是将这一过程解耦：  
  
url和网页的资源不再是一一对应的关系，由前端自己决定当前url需要渲染的内容。  

于是，之前由浏览器来处理的这些问题都抛到了前端头上：  

  1. 如何实现页面跳转？  

  2. 如何保证用户点击浏览器的前进/后退依然可用？  

  3. 如何保证用户手动修改url中的路径时页面不刷新？  

  4. 如何在路由改变时加载对应的页面/组件？  

### Hash路由  

我们知道，url中的#后的内容是用来指导浏览器的行为，而对服务端完全透明，#后的参数也不会带到服务端。因此，一个最直接的想法就是我们将路由的信息放到#后面，再通过监听#之后内容的变化来实现前端路由，也就是我们日常使用最多的hash路由。  

在hash路由中，我们页面的路由请求都变成了对#之后内容的操作，当#后的内容改变时，我们通过hashchange事件的回调函数就能获取到当前的实际路由，加载对应的页面。  

采用hash路由，我们可以实现：  

1、兼容性：可以兼容到ie8、Chrome5、Safari5，因此它的兼容性很好。针对不支持hashchange的浏览器，我们也可以通过setInterval来模拟hashchange的功能。  

2、改变#会改变浏览器的访问历史，因此浏览器前进/后退依然有效。  

3、无论页面的当前路由是什么、用户怎样刷新，我们获取到的都是同一份资源。  

但hash路由也不是十全十美，它存在以下一些问题：  

1、由于http请求不包含hash后的内容，因此服务端无法准确pv、uv等数据。  

2、微信oauth2.0校验登陆成功后，无法通过302重定向返回到登陆之前的页面  

3、微信分享会去掉#后的内容，导致用户只能访问到分享页面的首页  

4、无法使用#来定位网页中的内容  

因此，在以上这些场景中，我们需要寻求其他的解决方案。  

### Browser路由  

在h5中，新增了history.pushState api，在浏览器的console中输入：

```
window.history.pushState({ data: 'some data' },'Some history entry title', '/some-path');
```
此时，我们url的path变成了 /some-path而没有引起页面的刷新。  

再调用`history`对象，可以看到调用pushState之后，history的length增加了，意味着我们还是可以通过浏览器的前进/后退按钮实现页面的切换，因此，可以说这个api完美契合了前端路由的场景。  

除此之外，h5还提供了popstate事件，当进行页面的前进或回退时，会触发该事件，并且事件的回调函数中可以通过history.state拿到pushState传递的第一个参数。  

结合以上两个api，我们就可以实现基本的browser路由，相比hash路由，它的优势有：  

1、丢掉#之后，url更加直观也更加符合用户使用习惯  

2、可以使用锚点在页面中进行定位  

3、重定向、分享都不会丢失url参数  

4、可以更加简单的统计pv、uv  

基于以上这些原因，大部分框架都推荐在生产环境使用browser路由。不过，它也存在一些瑕疵：  

1、不兼容ie10以下的浏览器  

2、刷新页面时，会请求url对应的资源，而作为单页应用，对应的路径实际一般来说是没有资源的，此时，我们就需要配置nginx的fallback进行兜底，将这样的请求打到页面的入口文件上去。  

不过瑕不掩瑜，如果网页面向的用户使用的都是现代浏览器，browser路由完全可以作为一种完美的前端路由解决方案。  

### 实现  

原理说了这么多，我们来看一下具体如何实现。  

虽然browser路由和hash路由的表现上存在一定不同，但它们的基本流程是一致的，即：  

根据url获取当前路由路径path -> 根据path在路由表中匹配对应项 -> 根据匹配到的内容在合适的dom节点渲染模版  

只有url更新和获取path的逻辑不同。  

因此，我们将路由表初始化、路由表匹配和模版渲染的逻辑抽取出来，实现了一个路由的基础类，此处的render函数只支持html模版的渲染：  

```
/**
 * @params Array<Object> routeConfig
 * [
 *  {
 *    path,     -- String
 *    name,     -- String
 *    template, -- String
 *    children  -- Array<routeConfig>
  * }
 * ]
 */
class Router {
  /**
   * @description 路由过程
   * 1. 根据路由配置routeConfig初始化路由
   * 2. 获取当前路由信息，将router节点中的内容替换为相应的template
   * 3. 实现push方法，用户可以手动触发前端路由
   * 4. 监听hash/path变化，当其变化时，执行操作2
   */
  routeConfig = null
  pathToRoute = {}
  toMatchPaths = [] // 匹配顺序：按声明顺序，从前往后，从子往父
  history = window.history
  location = window.location

  constructor (routeConfig) {
    this.routeConfig = routeConfig
    const _meta = this._initRoute(routeConfig)
    this.pathToRoute = _meta.pathToRoute
    this.toMatchPaths = _meta.toMatchPaths
  }

  _initRoute (routeConfig) {
    const toMatchPaths = []
    const pathToRoute = {}

    function appendRouteConfig (config, parent) {
      (config || []).map(route => {
        if (route.children && route.children.length) {
          appendRouteConfig(route.children, route)
        }
        pathToRoute[route.path] = Object.assign({}, route, {parent: parent})
        toMatchPaths.push(route.path)
      })
    }

    appendRouteConfig(routeConfig, null)

    return {
      toMatchPaths: toMatchPaths,
      pathToRoute: pathToRoute
    }
  }

  _matchUrlToRoute (url) {
    const matchedPath = this.toMatchPaths.find((path) => {
      /**
       * @description 此处用来实现url和path的匹配
       */
      return path === url
    })

    return this.pathToRoute[matchedPath]
  }

  _render (url) {
    const matchedRoute = this._matchUrlToRoute(url)

    // 如果dom节点定义了data-router-view属性，将其视为模版的挂载点
    function renderNode (node) {
      let routerOutletElement

      if (node && node.parent) {
        const parentTemplate = renderNode(node.parent)
        routerOutletElement = parentTemplate.querySelectorAll('[data-router-view]')[0];
      } else {
        routerOutletElement = document.querySelectorAll('[data-router-view]')[0];
      }

      routerOutletElement.innerHTML = node.template

      return routerOutletElement
    }

    return renderNode(matchedRoute)
  }
}
```

browser路由和hash路由再去继承这个路由基础类，实现各自差异化的逻辑。  

browser路由通过pushState实现路由的跳转，通过监听popstate响应路由改变。  

```
class BrowserRouter extends Router {
  constructor (props) {
    super(props)

    this.push(location.pathname)
    window.addEventListener('popstate', () => {
      this.push(location.pathname)
    })
  }

  push (url) {
    const matchedRoute = this._matchUrlToRoute(url)

    window.history.pushState({}, matchedRoute.name, url)

    this._render(url)
  }
}
```

hash路由跳转时，直接改变#后的内容，同时会去监听hashchange事件：  

```
class HashRouter extends Router {
  constructor (props) {
    super(props)

    const _that = this
    this.onHashRouteChange()
    window.addEventListener('hashchange', function () {
      _that.onHashRouteChange()
    })
  }

  onHashRouteChange () {
    const hash = this.location.hash

    const hashUrl = hash.split('#').slice(1)[0]

    this._render(hashUrl || '/')
  }

  push (url) {
    /**
     * @description pushState没有触发hashRouteChange
     */
    // window.history.pushState({}, matchedRoute.name, `#${hashUrl}`)
    location.hash = `#${url}`
  }
}
```

接着我们实现了一个简单的网页测试我们的路由：  

```
<html>
  <head>
      <title>Client Side Routing Demo</title>
    </head>
    
    <body>
      <header>
        <ul>
          <li><button id="toHome">Home</button></li>
          <li><button id="toAbout">About</button></li>
          <li><button id="toContact">Contact</button></li>
        </ul>
      </header>
      <div data-router-view>
        <h1>Hello!</h1>
      </div>

      <script src="./src/router/router.js"></script>
      <script src="./src/router/browser.js"></script>
      <script src="./src/router/hash.js"></script>
      <script type="text/javascript">
        const routerConfig = [
          {
            path: '/',
            name: 'HOME',
            template: '<div><h1>Home</h1><div data-router-view></div></div>',
            children: [
              {
                path: '/test',
                template: '<h2>Children1</h2>'
              }
            ]
          },
          {
            path: '/about',
            name: 'ABOUT',
            template: '<h1>About</h1>',
          },
          {
            path: '/contact',
            name: 'CONTACT',
            template: '<h1>Contact</h1>',
          }
        ]

        const router = new BrowserRouter(routerConfig)
        // const router = new HashRouter(routerConfig)

        function init () {
          const btnToHome = document.getElementById('toHome')
          const btnToAbout = document.getElementById('toAbout')
          const btnToConcact = document.getElementById('toContact')

          btnToHome.onclick = function () {
            router.push('/test')
          }

          btnToAbout.onclick = function () {
            router.push('/about')
          }

          btnToConcact.onclick = function () {
            router.push('/contact')
          }
        }

        init()
      </script>
    </body>
</html>
```

最后，通过一个简单的http服务来访问该页面：  

```
npm install http-server-spa -g
http-server-spa . ./index.html
```

### 结语  

到这里，我们基本实现了一个前端路由常用的两种模式和最基本的功能，但真正要做到生产可用，还有很长的路要走。包括：  

1、路由钩子  

2、url参数匹配  

3、结合vue/react组件进行渲染  

4、防止xss注入攻击  

等常用功能都留待我们去实现。感兴趣的同学可以看看react和vue中router对于这些功能的实现，就不在此展开了。  

本文的源码位于：https://github.com/cauu/client-side-routing  










