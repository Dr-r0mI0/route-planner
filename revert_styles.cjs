const fs = require('fs');

// 1. App.jsx - revert map full height
let appJsx = fs.readFileSync('src/App.jsx', 'utf8');
appJsx = appJsx.replace('h-full md:h-full', 'h-[60%] md:h-full');
fs.writeFileSync('src/App.jsx', appJsx);

// 2. ActiveRoute.jsx - revert map full height
let activeRouteJsx = fs.readFileSync('src/components/ActiveRoute/ActiveRoute.jsx', 'utf8');
// The script replaced h-[60%] with h-full and replaced the ternary. Let's look at the original file or just run a command to restore from backup if we had one.
// Since we don't have git, we might need to manually restore the line in ActiveRoute.jsx.
