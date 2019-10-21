import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';

import {
  Desktop,
  Tablet,
  Mobile
} from '../Responsive';

import './style.scss';

const prefix = 'post-listing-item'
const prefixDesktop = `${prefix}-desktop`

class PostListItem extends React.Component {
  static propTypes = {
    post: PropTypes.object
  }

  render () {
    const { post } = this.props

    return (
      <React.Fragment>
        <Desktop>
          <div className={prefixDesktop}>
            <Link to={post.path} key={post.title}>
              <h1>{post.title}</h1>
            </Link>
          </div>
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