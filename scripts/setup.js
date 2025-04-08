import fs from 'fs';
import { execSync } from 'child_process';
import readline from 'readline';
import path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask for user input with a default value
const askQuestion = (query, defaultValue) => {
  return new Promise((resolve) => {
    rl.question(`${query} (${defaultValue}): `, (answer) => {
      resolve(answer || defaultValue);
    });
  });
};

// Function to replace text in a file
const replaceInFile = (filePath, searchText, replaceText) => {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(new RegExp(searchText, 'g'), replaceText);
  fs.writeFileSync(filePath, content);
};

async function setupProject() {
  try {
    console.log('🚀 Starting project setup...\n');

    // Get the default project slug from the folder name
    const defaultSlug = path.basename(process.cwd());

    // Get project slug from user, with default value
    const slug = await askQuestion('Enter your project slug', defaultSlug);
    if (!slug) {
      throw new Error('Project slug is required');
    }

    // Replace placeholders in project.config.json
    console.log('\n📝 Updating project configuration...');
    replaceInFile('project.config.json', '\\[insert project slug\\]', slug);

    // Replace placeholders in index.html
    console.log('📝 Updating index.html...');
    replaceInFile('index.html', '\\[insert slug\\]', slug);

    // Install dependencies
    console.log('\n📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // Initialize git
    console.log('\n🔧 Setting up git...');
    execSync('git init', { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Initial commit"', { stdio: 'inherit' });

    // Set up remote repository
    const repoName = await askQuestion('\nEnter the GitHub repository name (e.g., "water-quality-2024")', slug);
    if (!repoName) {
      throw new Error('Repository name is required');
    }

    const remoteUrl = `git@github.com:agwaterdesk/${repoName}.git`;
    execSync(`git remote add origin ${remoteUrl}`, { stdio: 'inherit' });

    console.log('\n✨ Project setup complete!');
    console.log('\nNext steps:');
    console.log('1. Create a new repository on GitHub named:', repoName);
    console.log('2. Push your code: git push -u origin main');
    console.log('3. Start development: npm run dev');

  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the setup
setupProject(); 