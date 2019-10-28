import React from 'react';

class Header extends React.Component {
  render () {
    const { title = {}, subTitle = {}, menus, rss } = this.props

    return (
      <header id="header">
        <div id="banner"></div>
        <div id="header-outer" class="outer">
          <div id="header-title" class="inner">
            <h1 id="logo-wrap">
              <a href={title.url} id="logo">
                {title.text}
              </a>
            </h1>
            {
              subTitle &&
                <h2 id="subtitle-wrap">
                  <a href={subTitle.url} id="subtitle">
                    {subTitle.text}
                  </a>
                </h2>
            }
          </div>


          <div id="header-inner" class="inner">
            <nav id="main-nav">
              <a id="main-nav-toggle" class="nav-icon"></a>
              {
                (menus || []).map(({ url, text }) => {
                  return (
                    <a class="main-nav-link" href={url}>
                      {text}
                    </a>
                  )
                })
              }
            </nav>
            <nav id="sub-nav">
              {
                rss && (
                  <a id="nav-rss-link" class="nav-icon" href={rss.url} title={rss.text}></a>
                )
              }
              {/* <a id="nav-search-btn" class="nav-icon" title="<%= __('search') %>"></a> */}
            </nav>
            <div id="search-form-wrap">
            </div>
          </div>
        </div>
      </header>
    )
  }
}

export default Header