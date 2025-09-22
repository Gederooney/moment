#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('Testing React Native build...');

const metro = spawn('npx', ['react-native', 'bundle', '--platform', 'ios', '--dev', 'false', '--entry-file', 'index.js', '--bundle-output', '/tmp/test-bundle.js', '--assets-dest', '/tmp/test-assets'], {
  cwd: process.cwd(),
  stdio: 'pipe'
});

let output = '';
let errorOutput = '';

metro.stdout.on('data', (data) => {
  output += data.toString();
});

metro.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

metro.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build test passed! No compilation errors found.');
  } else {
    console.log('❌ Compilation errors found:');
    if (errorOutput.includes('player.tsx')) {
      console.log('Player.tsx errors:');
      const lines = errorOutput.split('\n');
      lines.forEach(line => {
        if (line.includes('player.tsx')) {
          console.log('  ', line);
        }
      });
    } else {
      console.log(errorOutput);
    }
  }

  // Clean up
  require('fs').unlinkSync(__filename);
});

// Timeout après 30 secondes
setTimeout(() => {
  metro.kill();
  console.log('⏰ Build test timed out after 30 seconds');
  require('fs').unlinkSync(__filename);
}, 30000);