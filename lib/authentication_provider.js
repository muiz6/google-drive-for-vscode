const { randomUUID } = require('crypto');
const http = require('http');
const url = require('url');

const { OAuth2Client } = require('google-auth-library');
const vscode = require('vscode');

const clientSecret = require('../client_secret.json').installed;

const AUTH_NAME = 'Google OAuth 2.0';
const AUTH_TYPE = 'google-oauth2.0';
const SESSIONS_SECRET_KEY = `${AUTH_TYPE}-sessions`;
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

const oAuth2Client = new OAuth2Client(
  clientSecret.client_id,
  clientSecret.client_secret,
  'http://localhost:3000/oauth2callback/',
);

function AuthenticationProvider(context) {
  return {
    createSession: () => vscode.window.withProgress(
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
              const responseScopes = r.tokens.scope.split(' ');
              if (SCOPES.every((s) => responseScopes.includes(s))) {
                const session = {
                  accessToken: r.tokens.access_token,
                  account: {
                    label: '',
                    id: '',
                  },
                  id: randomUUID(),
                  scopes: r.tokens.scope.split(' '),
                };
                context.secrets.store(SESSIONS_SECRET_KEY, JSON.stringify([session]));
                resolve(session);
              }
              throw new Error('Insufficient permissions.');
            }
          } catch (e) {
            reject(e);
          }
        }).listen(3000, () => {
          const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
          });
          vscode.env.openExternal(vscode.Uri.parse(authUrl));
        });
      }),
    ),

    getSessions: async () => {
      const allSessions = await context.secrets.get(SESSIONS_SECRET_KEY);
      if (allSessions) {
        return JSON.parse(allSessions);
      }
      return [];
    },

    onDidChangeSessions: () => { },
    removeSession: () => { },
  };
}

module.exports = { AUTH_NAME, AUTH_TYPE, AuthenticationProvider };
