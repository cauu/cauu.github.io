import React from "react";
import Helmet from "react-helmet";
import { graphql } from "gatsby";

import Layout from "../layout";
import Header from '../components/Header'
import UserInfo from "../components/UserInfo/UserInfo";
import ContentWrapper from '../components/ContentWrapper'
import Disqus from "../components/Disqus/Disqus";
import PostTags from "../components/PostTags/PostTags";
import SocialLinks from "../components/SocialLinks/SocialLinks";
import SEO from "../components/SEO/SEO";
import config from "../../data/SiteConfig";
import { formatDate } from '../utils'

import "./b16-tomorrow-dark.css";
// import "./post.css";

export default class PostTemplate extends React.Component {
  render() {
    const { data, pageContext } = this.props;
    const { slug } = pageContext;
    const postNode = data.markdownRemark;
    const post = postNode.frontmatter;
    if (!post.id) {
      post.id = slug;
    }
    if (!post.category_id) {
      post.category_id = config.postDefaultCategoryID;
    }
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
        
        <div className="posts-expand">
          <ContentWrapper>
            <article className="post-block home">
              <Helmet>
                <title>{`${post.title} | ${config.siteTitle}`}</title>
              </Helmet>
              <SEO postPath={slug} postNode={postNode} postSEO />

              <header className="post-header">
                <h1 className="post-title">
                  {post.title}
                </h1>
                <div className="post-meta">
                  <span className="post-meta-item">
                    <span className="post-meta-item-icon">
                    </span>
                    <span className= "post-meta-item-text">
                      Posted on
                      &nbsp;
                    </span>
                    <time title={post.date}>
                      {formatDate(post.date)}
                    </time>
                  </span>
                </div>
              </header>

              <div className="post-body">
                <div dangerouslySetInnerHTML={{ __html: postNode.html }} />
                <div className="post-meta">
                  <PostTags tags={post.tags} />
                  <SocialLinks postPath={slug} postNode={postNode} />
                </div>
                <UserInfo config={config} />
                <Disqus postNode={postNode} />
              </div>
            </article>
          </ContentWrapper>
        </div>
      </Layout>
    );
  }
}

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      timeToRead
      excerpt
      frontmatter {
        title
        cover
        date
        category
        tags
      }
      fields {
        slug
        date
      }
    }
  }
`;
