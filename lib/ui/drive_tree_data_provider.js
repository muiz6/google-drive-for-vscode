const googleApiClient = require('../google_api_client');

async function getChildren(element) {
  const files = await googleApiClient.getFiles();
  return files.map((f) => ({ label: f.name }));
}

function getTreeItem(element) {
  return element;
}

module.exports = { getChildren, getTreeItem };
