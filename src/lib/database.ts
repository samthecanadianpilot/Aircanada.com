import { Octokit } from "@octokit/rest";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const OWNER = 'samthecanadianpilot';
const REPO = 'Aircanada.com';
const BRANCH = 'main';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

export async function getFileData(filename: string, defaultData: any) {
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

export async function saveFileData(filename: string, content: any) {
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

export async function updateNews(newsId: string, updates: any) {
  const news = await getNews();
  const existingIdx = news.findIndex((n: any) => n.id === newsId);
  if (existingIdx !== -1) {
    news[existingIdx] = { ...news[existingIdx], ...updates };
    return await saveFileData('news.json', news);
  }
  return false;
}

export async function deleteNews(newsId: string) {
  let news = await getNews();
  const initialLength = news.length;
  news = news.filter((n: any) => n.id !== newsId);
  if (news.length !== initialLength) {
    return await saveFileData('news.json', news);
  }
  return false;
}

export async function getMagazines() {
  return await getFileData('magazines.json', []);
}

export async function addMagazine(magazineItem: any) {
  const magazines = await getMagazines();
  magazines.unshift(magazineItem);
  return await saveFileData('magazines.json', magazines);
}

export async function updateMagazine(magazineId: string, updates: any) {
  const magazines = await getMagazines();
  const existingIdx = magazines.findIndex((m: any) => m.id === magazineId);
  if (existingIdx !== -1) {
    magazines[existingIdx] = { ...magazines[existingIdx], ...updates };
    return await saveFileData('magazines.json', magazines);
  }
  return false;
}

export async function deleteMagazine(magazineId: string) {
  let magazines = await getMagazines();
  const initialLength = magazines.length;
  magazines = magazines.filter((m: any) => m.id !== magazineId);
  if (magazines.length !== initialLength) {
    return await saveFileData('magazines.json', magazines);
  }
  return false;
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

export async function getAssistanceChats() {
  return await getFileData('assistance.json', {});
}

export async function saveAssistanceChat(chatId: string, chatData: any) {
  const chats = await getAssistanceChats();
  chats[chatId] = chatData;
  return await saveFileData('assistance.json', chats);
}

export async function getUsers() {
  return await getFileData('users.json', []);
}

export async function saveUser(user: any) {
  const users = await getUsers();
  users.push(user);
  return await saveFileData('users.json', users);
}

export async function updateUser(username: string, updates: any) {
  const users = await getUsers();
  const idx = users.findIndex((u: any) => u.username === username);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updates };
    return await saveFileData('users.json', users);
  }
  return false;
}
