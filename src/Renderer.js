import React from 'react';
import assign from './assign';
import defaultChildren from './defaultChildren';
import defaultComponents from './defaultComponents';
import defaultRemarkableProps from './defaultRemarkableProps';
import defaultTokens from './defaultTokens';
import TokenTree from './TokenTree';

export default class Renderer {
  constructor(options = {}) {
    this.options = assign({
      keyGen: (token, index) => index,
    }, options, {
      children: assign({}, defaultChildren, options.children),
      components: assign({}, defaultComponents, options.components),
      remarkableProps: assign({}, defaultRemarkableProps, options.remarkableProps),
      tokens: assign({}, defaultTokens, options.tokens),
    });
  }

  render(tokens = [], remarkableOptions, env) {
    return this.renderTokenTree(
      this.buildTokenTree(tokens, remarkableOptions),
      env
    );
  }

  buildTokenTree(tokens, remarkableOptions) {
    return new TokenTree(tokens, this.options, remarkableOptions);
  }

  renderTokenTree(token, env, index = 0) {
    if (Array.isArray(token)) return token.map((token, indx) => this.renderTokenTree(token, env, indx));
    if (!token || !token.type) return token;
    if (!this.options.components[token.type]) return null;

    return React.createElement(
      this.options.components[token.type], assign({}, env, token.props, {
        key: this.options.keyGen(token, index),
      }), this.renderTokenTree(token.children, env),
    );
  }
}
