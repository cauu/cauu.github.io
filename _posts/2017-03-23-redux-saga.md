---
layout: post
title: redux saga
categories: 
date: 2017-03-23
---
最近项目中引入了redux-saga，在复杂的异步问题上为我们带来了很多便利。当然，对工程师来说，往往不满足于知其然，我们更希望知其所以然。本着这个原则，我研究了saga的源码，总结出了这篇文章。

在阅读本文前，如果你对redux还不了解，可以先看看阮一峰老师的这篇[Redux入门](http://www.ruanyifeng.com/blog/2016/09/redux_tutorial_part_one_basic_usages.html)。另外，在middleware的定义中大量使用了ES6的箭头函数，如果你对箭头函数还不熟悉，推荐去恶补一下箭头函数的知识。

#### 1.  redux middleware的原理

saga基于redux的middleware实现，想要深入了解saga，首先我们必须理解redux middleware的工作原理。

如果你之前熟悉express或是koa，那么对middleware这个概念一定不会陌生。redux中的middleware采用了类似的实现方式：当我们在redux中dispatch一个action时，我们的action将依次流经我们定义的每一个middleware。我们只需要根据需求定义合适的middleware，就可以实现热插拔的、批量处理action的方法。

middleware虽然听起来很高大上，然而它的代码却只有20多行，可谓非常精炼：

```

import compose from './compose';

export default function applyMiddleware(...middlewares) { 

    return (next) => (reducer, initialState) => {

        var store = next(reducer, initialState);

        var dispatch = store.dispatch;

        var chain = [];

        var middlewareAPI = {

            getState: store.getState,

            dispatch: (action) => dispatch(action)

        };        

        chain = middlewares.map(middleware => middleware(middlewareAPI));

        dispatch = compose(...chain)(store.dispatch); 

        return {

            ...store,

            dispatch

        }

    }

}

```

结合applyMiddleware函数通常的用法``applyMiddleware(middlewares)(createStore)``，不难理解，applyMiddleware返回的是一个包装后createStore方法，返回函数的参数next就对应了老的createStore方法。通过观察新的createStore方法的返回值，我们不难发现，这个函数实际上只做了一件事：那就是对dispatch方法进行重新赋值。看到这里，middleware的核心思想已经呼之欲出:**由于redux中的所有action都是通过dispatch函数进行分发，只需要对dispatch方法进行包装，就可以实现对action的批处理**。

如何包装dispatch函数呢？答案在这两行代码:

```

chain = middlewares.map(middleware => middleware(middlewareAPI))

dispatch = compose(...chain)(store.dispatch);

```

首先获得一个middleware的数组chain，然后调用compose函数将chain中的方法[f0, f1, ... fn]组合成一个新的函数。如果将其翻译成更通俗的代码，就是这样:

```

chain = middlewares.map(middleware => middleware(middlewareAPI));

for(let i = chain.length - 1; i >= 0; i--) {

    dispatch = chain[i](store.dispatch);

}

```

假设我们定义的middlwares数组为[m1, m2, m3]，当上面的函数执行完成后，我们的dispatch函数就变成了`m1(m2(m3(dispatch)))`，也就实现了对dipatch函数的包装。

#### 2. redux-saga的设计思想

redux-saga也是一个middleware，它的设计思路很简单：在Redux中，对ajax请求的处理一直是个让人头痛的问题。无论将这些会带来副作用的函数放在action还是reducer中，都会增加其复杂度，违背redux设计的初衷。因此，我们在action和reducer的基础上，再引入一个saga层，用来处理所有带副作用的操作，从而保持action和reducer层的纯净性。由于saga层不可避免的涉及到异步函数的调用，因此，作者选择使用generator来实现它。

这里我们将实现一个基于generator的简化版redux-saga。

#### 3. 简化版的saga

由于saga是redux的middleware，因此它的定义遵循一般middleware的定义方式:

```

function sagaMiddleware(saga) {

    return ({ getState, dispatch }) => next => action => {

        // ...

    }

}

```

这里，我们将saga层作为闭包的参数传给了我们的中间件。

在函数体内将带副作用的action通过中间件传给saga层:

```

function sagaMiddleware(saga) {

    return ({ getState, dispatch }) => next => action => {

       const generator = saga(getState, action);

        iterate(generator);

        return next(action);

    }

}

```

由于saga层返回的是generator，因此需要一个iterate方法来控制generator的执行:

```

function iterate(generator) {

    step();



    function step(arg) {

         const result = generator.next();

         if(!result.done) {

             const response = result.value;

              step(response);

         } 

    }

}

```

此处只实现了最基本的iterate，实际上，step函数每次执行时，我们都需要判断返回的result类型，并针对不同的result类型对其进行处理。

之后我们就可以定义我们的saga了:

```

function* saga(getState, action) {

    switch(action.type) {

        case 'EFFECT_ACTION':

            yield 'Get side-effect';

            break;

    }

}

```

#### 4. 结语

到这里，我们已经实现了一个最基本的saga middleware。当然，上面实现的代码只包含了最基本的实现思路，还有很多问题留待我们去思考。本文权当是抛砖引玉，大家有兴趣的话可以更深入的去阅读saga的源码。