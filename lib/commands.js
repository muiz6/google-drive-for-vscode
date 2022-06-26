const vscode = require('vscode');

const { AUTH_TYPE } = require('./authentication_provider');

async function authenticate() {
  const session = await vscode.authentication.getSession(AUTH_TYPE, [], { createIfNone: true });
  if (session) {
    vscode.window.showInformationMessage(`Welcome back ${session.account.label}`);
  }
}

module.exports = { authenticate };
