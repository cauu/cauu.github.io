import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';

import { formatDate } from '../../../utils'

import './style.scss';

class PostListItem extends React.Component {
  static propTypes = {
    post: PropTypes.object
  }

  render () {
    const { post } = this.props

    const { date, excerpt } = post

    return (
      <article className="post-block home">
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
              <time title={date}>
                {formatDate(date)}
              </time>
            </span>
          </div>
        </header>

        <div className="post-body">
          <p>
            {excerpt}
          </p>
        </div>

        <div style={{ 'text-align': 'right' }}>
          <Link to={post.path}>
            继续阅读
          </Link>
        </div>
      </article>
    )
  }
}

export default PostListItem;