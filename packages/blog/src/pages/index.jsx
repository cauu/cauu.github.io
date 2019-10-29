import React from "react";
import Helmet from "react-helmet";
import { graphql } from "gatsby";

import Layout from "../layout";
import Header from '../components/Header';
import PostListing from "../components/PostListing";
import SEO from "../components/SEO/SEO";
import config from "../../data/SiteConfig";

import '../styles/theme-next/main.styl'
// import '../styles/test.styl'

class Index extends React.Component {
  render() {
    const postEdges = this.props.data.allMarkdownRemark.edges;
    return (
      <Layout>
        <Header
          title={{ text: '123', url: '123' }}
          menus={
            [
              {
                text: '123',
                url: '123'
              }
            ]
          }
        />
        <div className="index-container">
          <Helmet title={config.siteTitle} />
          <SEO />
          <PostListing postEdges={postEdges} />
        </div>
      </Layout>
    );
  }
}

export default Index;

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query IndexQuery {
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [fields___date], order: DESC }
    ) {
      edges {
        node {
          fields {
            slug
            date
          }
          excerpt
          timeToRead
          frontmatter {
            title
            tags
            cover
            date
          }
        }
      }
    }
  }
`;
