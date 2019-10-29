import React from 'react';

class Header extends React.Component {
  renderMenus (menus, currPath) {
    const menuCls = (menu) => currPath === menu.url ? `menu-item menu-item-active` : 'menu-item'

    return (
      <nav class="site-nav">
        <ul id="menu" class="menu">
          {
            (menus || []).map((menu) => {
              return (
                <li className={menuCls(menu)}>
                  <a href={menu.url} rel="section">
                    <i class="fa fa-fw fa-bullhorn"></i>
                    {menu.text}
                  </a>
                </li>
              )
            })
          }
        </ul>
      </nav>
    )
  }

  render () {
    const { title = {}, subTitle = {}, menus, rss } = this.props

    return (
      <header class="header" itemscope="" itemtype="http://schema.org/WPHeader">
        <div class="header-inner">
          <div class="site-brand-container">
            <div class="site-meta">
              <div>
                <a href="/" class="brand" rel="start">
                  <span class="logo-line-before"><i></i></span>
                  <span class="site-title">{title}</span>
                  <span class="logo-line-after"><i></i></span>
                </a>
              </div>
              <h1 class="site-subtitle" itemprop="description">{subTitle}</h1>
            </div>

            <div class="site-nav-toggle">
              <div class="toggle" aria-label="Toggle navigation bar">
                <span class="toggle-line toggle-line-first"></span>
                <span class="toggle-line toggle-line-middle"></span>
                <span class="toggle-line toggle-line-last"></span>
              </div>
            </div>
          </div>

          {this.renderMenus(menus)}
      </div>
    </header>
  )}
}

export default Header