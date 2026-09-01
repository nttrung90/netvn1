const fs = require('fs');
const page = fs.readFileSync('app/(site)/page.tsx', 'utf-8');
console.log(page.includes('post.cover_image'));
console.log(page.includes('heroLead.cover_image'));
