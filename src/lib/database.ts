import { Octokit } from "@octokit/rest";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const OWNER = 'samthecanadianpilot';
const REPO = 'Aircanada.com';
const BRANCH = 'main';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function getFileData(filename: string, defaultData: any) {
  try {
    const { data } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: `data/${filename}`,
      ref: BRANCH
    });
    
    if ('type' in data && data.type === 'file' && data.content) {
      const contentStr = Buffer.from(data.content, 'base64').toString('utf8');
      return JSON.parse(contentStr);
    }
  } catch (err: any) {
    if (err.status !== 404) console.error(`DB Read Error (${filename}):`, err);
  }
  return defaultData;
}

async function saveFileData(filename: string, content: any) {
  try {
    let sha;
    try {
      const { data } = await octokit.repos.getContent({
        owner: OWNER, repo: REPO, path: `data/${filename}`, ref: BRANCH
      });
      if (!Array.isArray(data)) sha = data.sha;
    } catch (e) {}

    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: `data/${filename}`,
      message: `db: update ${filename} via Staff Portal`,
      content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
      branch: BRANCH,
      sha
    });
    return true;
  } catch (err) {
    console.error(`DB Write Error (${filename}):`, err);
    return false;
  }
}

// ── Database Helper Functions ── //

export async function getTeamMembers() {
  return await getFileData('team.json', []);
}

export async function updateTeamMembers(members: any[]) {
  return await saveFileData('team.json', members);
}

export async function getForms() {
  return await getFileData('forms.json', []);
}

export async function saveForm(formId: string, formDefinition: any) {
  const forms = await getForms();
  const existingIdx = forms.findIndex((f: any) => f.id === formId);
  if (existingIdx !== -1) forms[existingIdx] = { id: formId, ...formDefinition };
  else forms.push({ id: formId, ...formDefinition });
  return await saveFileData('forms.json', forms);
}

export async function getNews() {
  return await getFileData('news.json', []);
}

export async function addNews(newsItem: any) {
  const news = await getNews();
  news.unshift(newsItem);
  return await saveFileData('news.json', news);
}

export async function getPolls() {
  return await getFileData('polls.json', []);
}

export async function addPoll(pollItem: any) {
  const polls = await getPolls();
  polls.unshift(pollItem);
  return await saveFileData('polls.json', polls);
}

export async function getProfiles() {
  return await getFileData('profiles.json', []);
}

export async function updateProfile(discordId: string, updates: any) {
  const profiles = await getProfiles();
  const existingIdx = profiles.findIndex((p: any) => p.discordId === discordId);
  
  if (existingIdx !== -1) {
    profiles[existingIdx] = { ...profiles[existingIdx], ...updates };
  } else {
    profiles.push({ discordId, ...updates });
  }
  
  return await saveFileData('profiles.json', profiles);
}
