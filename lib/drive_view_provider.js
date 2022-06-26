const vscode = require('vscode');

function getChildren(element) {
  return ['apple', 'berry', 'citrus'].map((i) => ({ label: i }));
}

function getTreeItem(element) {
  return element;
}

module.exports = { getChildren, getTreeItem };
