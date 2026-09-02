const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Add public folder to asset extensions and serve static files
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Serve static files from public folder
      if (req.url.startsWith('/logos/') || req.url.startsWith('/Logo.png') || req.url === '/Logo.png') {
        const publicPath = path.join(__dirname, 'public');
        let filePath;
        
        if (req.url.startsWith('/logos/')) {
          filePath = path.join(publicPath, req.url);
        } else {
          filePath = path.join(publicPath, 'Logo.png');
        }
        
        // Check if file exists
        if (fs.existsSync(filePath)) {
          return res.sendFile(filePath);
        } else {
          console.warn(`Static file not found: ${filePath}`);
        }
      }
      return middleware(req, res, next);
    };
  },
};

config.resolver.assetExts.push(
  'mp4',
  'webm',
  'ogg',
  'mp3',
  'wav',
  'flac',
  'aac',
  'm4a'
);

module.exports = config;
