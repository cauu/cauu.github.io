import React from "react"

export default class ContentWrapper extends React.PureComponent {
  render () {
    const { children } = this.props

    return (
      <div class="main">
        <div className="main-inner">
          <div className="content-wrap">
            <div className="content">
              {children}
            </div>
          </div>
        </div>
      </div>
    )
  }
}