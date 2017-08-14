const TOP_LEVEL = 0;
const OPEN_IDENTIFIER = '_open';
const CLOSE_IDENTIFIER = '_close';
const INLINE_TYPE = 'inline';

function isOpenToken({ type }) {
  return type.includes(OPEN_IDENTIFIER);
}

function isCloseToken({ type }) {
  return type.includes(CLOSE_IDENTIFIER);
}

function isInlineToken({ type }) {
  return type === INLINE_TYPE;
}

function getType(tokenMap, token, options) {
  return typeof tokenMap[token.type] === 'function'
    ? tokenMap[token.type](token, options)
    : tokenMap[token.type];
}

function expandToken(token, types) {
  return types.reduceRight((child, type, index) => {
    return {
      type,
      props: token,
      children: index === types.length - 1 ? token.content : [child],
    };
  }, null);
}

function buildToken(tokenMap, token, options) {
  const type = getType(tokenMap, token, options);

  if (Array.isArray(type)) {
    return expandToken(token, type);
  }

  return {
    type,
    props: token,
    children: token.content,
  };
}

function buildParentToken(tokenMap, tokens, options, index, level) {
  return {
    ...buildToken(tokenMap, tokens[index], options),
    children: buildTokenTree(tokenMap, tokens, options, index, level + 1),
  };
}

function buildTokenTree(tokenMap, tokens, options, index = -1, level = TOP_LEVEL) {
  const collection = [];

  while (++index < tokens.length) {
    if (level === tokens[index].level) {
      if (isInlineToken(tokens[index])) {
        return buildTokenTree(tokenMap, tokens[index].children, options);
      }

      if (isOpenToken(tokens[index])) {
        collection.push(buildParentToken(tokenMap, tokens, options, index, level));
      } else if (!isCloseToken(tokens[index])) {
        collection.push(buildToken(tokenMap, tokens[index], options));
      }
    } else if (level !== TOP_LEVEL && level > tokens[index].level) {
      return collection;
    }
  }

  return collection;
}

module.exports = buildTokenTree;
