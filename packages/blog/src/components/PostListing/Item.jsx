import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';

import {
  Desktop,
  Tablet,
  Mobile
} from '../Responsive'

class PostListItem extends React.Component {
  static propTypes = {
    post: PropTypes.object
  }

  render () {
    const { post } = this.props

    return (
      <React.Fragment>
        <Desktop>
          <Link to={post.path} key={post.title}>
            <h1>{post.title}</h1>
          </Link>
        </Desktop>

        <Mobile>
         <div>mobile</div>
        </Mobile>

        <Tablet>
          <div>tablet</div>
        </Tablet>
      </React.Fragment>
    )
  }
}

export default PostListItem;