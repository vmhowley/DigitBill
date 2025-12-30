const fs = require('fs');
const path = require('path');

try {
    const src = path.join(__dirname, 'src', 'db', 'schema.sql');
    const destDir = path.join(__dirname, 'dist', 'db');
    const dest = path.join(destDir, 'schema.sql');

    console.log(`Copying ${src} to ${dest}...`);

    if (!fs.existsSync(destDir)) {
        console.log(`Creating directory ${destDir}...`);
        fs.mkdirSync(destDir, { recursive: true });
    }

    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log('✅ schema.sql copied successfully.');
    } else {
        console.error('❌ Source schema.sql not found!');
        process.exit(1);
    }
} catch (error) {
    console.error('❌ Error copying assets:', error);
    process.exit(1);
}
