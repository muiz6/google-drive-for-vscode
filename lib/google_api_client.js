const axios = require('axios').default;
const vscode = require('vscode');

const { AUTH_TYPE } = require('./authentication_provider');

let axiosClient;

async function getFiles() {
  const client = await getClient();
  const response = await client.get('/drive/v3/files');
  return response.data.files;
}

async function getClient() {
  const session = await vscode.authentication.getSession(AUTH_TYPE, []);
  if (!axiosClient) {
    axiosClient = axios.create({
      baseURL: 'https://www.googleapis.com',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
  }
  return axiosClient;
}

module.exports = { getFiles };
