const fs = require('fs');
const path = require('path');
const https = require('https');

const FONTS_DIR = path.join(__dirname, '../assets/fonts');
const FONTS = [
  {
    name: 'Inter-Regular.ttf',
    url: 'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Regular.ttf'
  },
  {
    name: 'Inter-Medium.ttf',
    url: 'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Medium.ttf'
  },
  {
    name: 'Inter-SemiBold.ttf',
    url: 'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-SemiBold.ttf'
  },
  {
    name: 'Inter-Bold.ttf',
    url: 'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Bold.ttf'
  }
];

// Create fonts directory if it doesn't exist
if (!fs.existsSync(FONTS_DIR)) {
  console.log(`Creating fonts directory: ${FONTS_DIR}`);
  fs.mkdirSync(FONTS_DIR, { recursive: true });
}

// Download each font
FONTS.forEach(font => {
  const filePath = path.join(FONTS_DIR, font.name);
  
  // Skip if font already exists
  if (fs.existsSync(filePath)) {
    console.log(`Font already exists: ${font.name}`);
    return;
  }
  
  console.log(`Downloading font: ${font.name} from ${font.url}`);
  
  const file = fs.createWriteStream(filePath);
  
  https.get(font.url, response => {
    if (response.statusCode !== 200) {
      console.error(`Failed to download ${font.name}: HTTP ${response.statusCode}`);
      fs.unlinkSync(filePath); // Remove partial file
      return;
    }
    
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      console.log(`Successfully downloaded: ${font.name}`);
    });
  }).on('error', err => {
    fs.unlinkSync(filePath); // Remove partial file
    console.error(`Error downloading ${font.name}: ${err.message}`);
  });
});