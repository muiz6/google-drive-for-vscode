const { randomUUID } = require('crypto');
const http = require('http');
const url = require('url');

const { OAuth2Client } = require('google-auth-library');
const vscode = require('vscode');

const clientSecret = require('../client_secret.json').installed;

const AUTH_NAME = 'Google OAuth 2.0';
const AUTH_TYPE = 'google-oauth2.0';
const SESSIONS_SECRET_KEY = `${AUTH_TYPE}-sessions`;

const oAuth2Client = new OAuth2Client(
  clientSecret.client_id,
  clientSecret.client_secret,
  'http://localhost:3000/oauth2callback/',
);

function AuthenticationProvider(context) {
  return {
    createSession: createSession(context),
    getSessions: getSessions(context),
    onDidChangeSessions: onDidChangeSessions(context),
    removeSession: removeSession(context),
  };
}

function createSession(context) {
  return (scopes) => vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Signing in to Google...',
      cancellable: true,
    },
    (_, token) => new Promise((resolve, reject) => {
      token.onCancellationRequested(() => reject(new Error('Authentication Cancelled.')));
      const server = http.createServer(async (req, res) => {
        try {
          if (req.url.indexOf('/oauth2callback') > -1) {
            const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
            const code = qs.get('code');
            res.end('Authentication successful! Please return to the VS Code.');
            server.close();

            const r = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(r.tokens);
            console.info('Tokens acquired.');
            resolve({
              accessToken: r.tokens.access_token,
              account: {
                label: '',
                id: '',
              },
              id: randomUUID(),
              scopes: r.tokens.scope.split(' '),
            });
          }
        } catch (e) {
          reject(e);
        }
      }).listen(3000, () => {
        const authUrl = oAuth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
          ],
        });
        vscode.env.openExternal(vscode.Uri.parse(authUrl));
      });
    }),
  );
}

function getSessions(context) {
  return (scopes) => {
    return [{
      accessToken: '',
      account: {
        label: '',
        id: '',
      },
      id: randomUUID(),
      scopes: ['drive'],
    }];
  };
}

function onDidChangeSessions(context) {
  return () => { };
}

async function removeSession(context) {
  return (sessionId) => { };
}

module.exports = { AUTH_NAME, AUTH_TYPE, AuthenticationProvider };
