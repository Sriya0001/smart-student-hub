const fs = require('fs');
const path = require('path');

const API = "import.meta.env.VITE_API_BASE_URL";
const BASE = "import.meta.env.VITE_API_BASE_URL_BASE";

const fixes = {
  'frontend/src/pages/Login.jsx': (c) =>
    c.replace(
      /axios\.post\(.*?\/api\/login.*?,/,
      `axios.post(\`\${${API}}/login\`,`
    ),
  'frontend/src/pages/Signup.jsx': (c) =>
    c.replace(
      /'http:\/\/localhost:3000\/api\/signup'/,
      `\`\${${API}}/signup\``
    ),
  'frontend/src/pages/StudentDashboard.jsx': (c) =>
    c.replace(/'http:\/\/localhost:3000\/api\/students\/profile'/g, `\`\${${API}}/students/profile\``)
     .replace(/'http:\/\/localhost:3000\/api\/students\/my'/g, `\`\${${API}}/students/my\``)
     .replace(/'http:\/\/localhost:3000\/api\/students\/stats'/g, `\`\${${API}}/students/stats\``),
  'frontend/src/pages/ProfileSettings.jsx': (c) =>
    c.replace(/'http:\/\/localhost:3000\/api\/students\/profile'/g, `\`\${${API}}/students/profile\``),
  'frontend/src/pages/CertificateUpload.jsx': (c) =>
    c.replace(/'http:\/\/localhost:3000\/api\/students\/upload'/g, `\`\${${API}}/students/upload\``),
  'frontend/src/pages/FacultyDashboard.jsx': (c) =>
    c.replace(/'http:\/\/localhost:3000\/api\/teachers\/activities\/pending'/g, `\`\${${API}}/teachers/activities/pending\``)
     .replace(/'http:\/\/localhost:3000\/api\/teachers\/activities\/history'/g, `\`\${${API}}/teachers/activities/history\``)
     .replace(/'http:\/\/localhost:3000\/api\/teachers\/stats'/g, `\`\${${API}}/teachers/stats\``)
     .replace(/'http:\/\/localhost:3000\/api\/teachers\/mentees'/g, `\`\${${API}}/teachers/mentees\``)
     .replace(/'http:\/\/localhost:3000\/api\/teachers\/activities\/bulk-review'/g, `\`\${${API}}/teachers/activities/bulk-review\``)
     .replace(/`http:\/\/localhost:3000\/api\/teachers\/activities\/\$\{id\}\/undo`/g, `\`\${${API}}/teachers/activities/\${id}/undo\``)
     .replace(/href=\{`\\?\$\{${API}\.replace\('\/api', ''\)}\\?\$\{/g, `href={\`\${${BASE}}\${`)
     .replace(/`http:\/\/localhost:3000\$\{activity\.fileUrl\}`/g, `\`\${${BASE}}\${activity.fileUrl}\``),
  'frontend/src/pages/AdminDashboard.jsx': (c) =>
    c.replace(/'http:\/\/localhost:3000\/api\/admin\/analytics'/g, `\`\${${API}}/admin/analytics\``)
     .replace(/'http:\/\/localhost:3000\/api\/admin\/logs'/g, `\`\${${API}}/admin/logs\``)
     .replace(/'http:\/\/localhost:3000\/api\/admin\/users'/g, `\`\${${API}}/admin/users\``)
     .replace(/'http:\/\/localhost:3000\/api\/admin\/mentorships\/repair'/g, `\`\${${API}}/admin/mentorships/repair\``),
  'frontend/src/pages/UserManagement.jsx': (c) =>
    c.replace(/'http:\/\/localhost:3000\/api\/admin\/users'/g, `\`\${${API}}/admin/users\``)
     .replace(/`http:\/\/localhost:3000\/api\/admin\/users\/\$\{userId\}`/g, `\`\${${API}}/admin/users/\${userId}\``)
     .replace(/'http:\/\/localhost:3000\/api\/admin\/mentorships\/repair'/g, `\`\${${API}}/admin/mentorships/repair\``),
  'frontend/src/pages/AchievementGallery.jsx': (c) =>
    c.replace(/'http:\/\/localhost:3000\/api\/students\/my'/g, `\`\${${API}}/students/my\``),
};

const root = 'c:/sriya/student records';

for (const [relPath, transform] of Object.entries(fixes)) {
  const fullPath = path.join(root, relPath);
  if (!fs.existsSync(fullPath)) { console.log('MISSING:', relPath); continue; }
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  content = transform(content);
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('FIXED:', relPath);
  } else {
    console.log('NO CHANGE (already fixed or pattern not found):', relPath);
  }
}
