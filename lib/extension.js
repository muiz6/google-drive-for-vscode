const vscode = require('vscode');

const { AUTH_NAME, AUTH_TYPE, AuthenticationProvider } = require('./authentication_provider');
const { authenticate } = require('./commands');
const driveViewProvider = require('./drive_view_provider');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  vscode.commands.registerCommand('view-drive.auth', authenticate);
  vscode.authentication.registerAuthenticationProvider(
    AUTH_TYPE,
    AUTH_NAME,
    AuthenticationProvider(context),
  );

  const disposable = vscode.window.registerTreeDataProvider('view-drive', driveViewProvider);
  context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = { activate, deactivate };
