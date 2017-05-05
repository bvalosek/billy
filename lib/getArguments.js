const babylon = require('babylon');

/*

  Given a function or a class, resolve the name of its parameters

  Thanks to Dillon Shook for bringing the AST-based parser to this lib, instead
  of the absolutely terrifying old regex-based approach.

*/
module.exports = function getArguments(f, amended = false)
{
  if (!f) {
    throw new Error('Missing function or class parameter');
  }

  const fType = typeof f;

  if (fType !== 'function') {
    throw new Error(`Parameter must be type function, got ${fType}`);
  }

  let code = f.toString();

  if (amended) {

    // This is a fix for when we are passed anonymous functions (which are
    // passed to us as unassigned) e.g:
    //
    // "function (a, b, c) { }"
    //
    // These are actually parse errors so we'll try adding an assignment to fix
    // the parse error

    code = 'var a = ' + code;
  }

  try {
    const ast = babylon.parse(code);
    const node = findNode(ast);

    if (!node) {
      return [ ];
    }

    return node.params.map(p => p.name);
  }
  catch (e) {

    // If haven't already, re-fire and try with the prepended assignment op
    if (!amended) {
      return getArguments(f, true);
    }

    throw new Error(`Could not parse:\n${code}\n${e}`);
  }
};

/*

  Dive into AST to find the node we want with the parameters on it

*/
function findNode (node)
{
  if (!node) {
    return null;
  }

  if (['FunctionDeclaration', 'FunctionExpression', 'ClassMethod'].includes(node.type)) {
    return node;
  }

  let next = null;

  switch(node.type) {
    case 'File':
      next = node.program;
      break;
    case 'Program':
      next = node.body[0];
      break;
    case 'VariableDeclaration':
      next = node.declarations[0];
      break;
    case 'VariableDeclarator':
      next = node.init;
      break;
    case 'ClassDeclaration':
      next = node.body;
      break;
    case 'ClassBody':
      next = node.body.find(b => b.kind === 'constructor');
      break;
  }

  return findNode(next);
};

