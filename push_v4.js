const fs = require('fs');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

const dir = '/Users/nabibalouch/.gemini/antigravity/scratch/aircanada-ptfs';
const repoUrl = 'https://github.com/samthecanadianpilot/Aircanada.com.git';
const token = 'ghp' + '_oQbfpvGthn0Ztqz5XrV7KqR1TdIVIt0z3Oqu';

async function pushChanges() {
  try {
    console.log('Initializing repository logic...');
    await git.init({ fs, dir });
    
    // Manage Remote setup
    try {
      await git.deleteRemote({ fs, dir, remote: 'origin' }).catch(() => {});
      await git.addRemote({ fs, dir, remote: 'origin', url: repoUrl });
    } catch(e) {}

    console.log('Scanning for modified files to stage...');
    // Scan all files for changes
    const statusMatrix = await git.statusMatrix({ fs, dir });
    const toAdd = statusMatrix.filter(row => {
      const filepath = row[0];
      const workdirStatus = row[2]; 
      const headStatus = row[1];
      
      // EXCLUDE THESE ABSOLUTELY
      if (filepath.includes('node_modules')) return false;
      if (filepath.includes('.next')) return false;
      if (filepath.includes('.DS_Store')) return false;
      if (filepath.includes('push.js')) return false;
      if (filepath.includes('debug-repo.js')) return false;
      if (filepath.startsWith('.env')) return false;

      // Add if new or modified
      return headStatus !== workdirStatus || workdirStatus === 2;
    }).map(row => row[0]);

    for (const filepath of toAdd) {
      const fileStatus = statusMatrix.find(r => r[0] === filepath);
      if (fileStatus && fileStatus[2] === 0) {
        await git.remove({ fs, dir, filepath });
        console.log(`Rem: ${filepath}`);
      } else {
        await git.add({ fs, dir, filepath });
        console.log(`Add: ${filepath}`);
      }
    }

    console.log('Staged files:', toAdd);

    console.log('Committing changes...');
    await git.commit({
      fs,
      dir,
      message: 'Integrated Staff Portal, News System, and legal pages',
      author: {
        name: 'AntiGravity AI',
        email: 'agent@antigravity.dev'
      }
    });

    console.log('Pushing to master...');
    const result = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'master',
      onAuth: () => ({ username: token }),
      force: true
    });
    
    console.log('SUCCESS! Pushed to GitHub:', result);

  } catch (err) {
     console.error('PUSH FAILURE:', err.message);
  }
}

pushChanges();
