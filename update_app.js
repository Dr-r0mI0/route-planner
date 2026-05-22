const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const imports = `import logoDark from './assets/svg/logo-dark.svg';
import logoLight from './assets/svg/logo-white.svg';
import backDark from './assets/svg/back-dark.svg';
import backLight from './assets/svg/back-white.svg';
import enDark from './assets/svg/en-dark.svg';
import enLight from './assets/svg/en-white.svg';
import arDark from './assets/svg/ar-dark.svg';
import arLight from './assets/svg/ar-white.svg';
`;
code = code.replace("import './App.css';", "import './App.css';\n" + imports);

const headerCode = `        <div className="absolute inset-x-0 top-0 flex justify-between items-center p-4 z-20 pointer-events-auto bg-gradient-to-b from-[#0c0c0cc9] to-transparent md:bg-none md:relative md:top-auto md:left-auto md:right-auto md:p-0 md:mb-6">
          <div className="flex items-center gap-3">
            {step !== STEPS.INPUT && (
              <button
                className="w-10 h-10 flex items-center justify-center active:scale-95 outline-none transition-transform"
                aria-label="Back"
                onClick={() => window.history.back()}
              >
                <img src={theme === 'light' ? backLight : backDark} alt="Back" className="w-full h-full object-contain" />
              </button>
            )}
            <img 
              src={theme === 'light' ? logoLight : logoDark} 
              alt="Route Optimizer" 
              className="h-10 w-auto cursor-pointer object-contain active:scale-95 transition-transform"
              onClick={reset}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              className="w-10 h-10 flex items-center justify-center active:scale-95 outline-none transition-transform"
              aria-label="Change Language"
              onClick={toggleLang}
            >
              <img 
                src={lang === 'ar' ? (theme === 'light' ? enLight : enDark) : (theme === 'light' ? arLight : arDark)} 
                alt="Change Language" 
                className="w-full h-full object-contain" 
              />
            </button>
            <button
              className="w-10 h-10 flex items-center justify-center active:scale-95 outline-none transition-transform text-brand-text"
              aria-label="Toggle Theme"
              onClick={toggleTheme}>
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8V16Z" fill="currentColor" />
                <path fillRule="evenodd" clipRule="evenodd"
                  d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4V8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16V20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z"
                  fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>`;

code = code.replace(/<div className="absolute inset-x-0 top-0 flex justify-between items-start[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, headerCode);

fs.writeFileSync('src/App.jsx', code);
