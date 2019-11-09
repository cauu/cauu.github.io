import React from "react";
import Helmet from "react-helmet";

import config from "../../data/SiteConfig";

import '../styles/theme-next/main.styl'
import "./index.css";

export default class MainLayout extends React.Component {
  render() {
    const { children } = this.props;
    return (
      <div class="container">
        <Helmet>
          <meta name="description" content={config.siteDescription} />
          <html lang="en" />
        </Helmet>

        {children}
      </div>
    );
  }
}
