import React from 'react';

class Header extends React.Component {
  render () {
    const { title = {}, subTitle = {}, menus, rss } = this.props

    return (
      <header className="header">
        <div className="banner"></div>
        <div className="header-outer">
          <div className="header-title">
            <h1 class="logo-wrap">
              <a href={title.url} class="logo">
                {title.text}
              </a>
            </h1>
            {
              subTitle &&
                <h2 class="subtitle-wrap">
                  <a href={subTitle.url} class="subtitle">
                    {subTitle.text}
                  </a>
                </h2>
            }
          </div>


          <div class="header-inner" class="inner">
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