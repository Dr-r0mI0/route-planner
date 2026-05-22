const fs = require('fs');

const cssToAppend = `
/* MAP CUSTOM STYLES */
.gmnoprint.gm-bundled-control.gm-bundled-control-on-bottom {
    top: 20% !important;
    height: 50px !important;
}

.gmnoprint div {
    width: 29px !important;
    height: 51px !important;
}

.gmnoprint button {
    width: 25px !important;
    height: 25px !important;
    margin: auto !important;
}

.gm-style img {
    height: 25px !important;
    width: 25px !important;
}

/* CUSTOM APP THEME STYLES - LIGHT */
body[data-theme='light'] .w-4.h-0\\.5.bg-white.rounded-full{
    background:#292929 !important;
}
body[data-theme='light'] .tiny-input.w-\\[65px\\].h-6.text-\\[10px\\].flex.items-center.justify-center.cursor-pointer.hover\\:border-brand-orange.transition-colors.select-none,
body[data-theme='light'] .tiny-input.w-\\[72px\\].h-6.text-\\[10px\\].flex.items-center.justify-center.cursor-pointer.hover\\:border-brand-orange.transition-colors.select-none{
    background:#8f8f8f !important;
    border:#949494 1px solid !important;
}
body[data-theme='light'] .bg-brand-input.rounded-\\[14px\\].p-2.flex.flex-col.items-center.justify-center.border.border-brand-border,
body[data-theme='light'] .flex.items-center.gap-1.w-full.bg-brand-input.rounded-\\[14px\\].p-1.border.border-brand-border.shadow-md.transition-all,
body[data-theme='light'] .absolute.bottom-0.left-0.right-0.bg-brand-bg.rounded-t-\\[32px\\].pt-6.pb-8.px-5.z-20.flex.flex-col.gap-4.shadow-\\[0_-10px_40px_rgba\\(0\\,0\\,0\\,0\\.5\\)\\].border-t.border-brand-border.pointer-events-auto.md\\:relative.md\\:bottom-auto.md\\:left-auto.md\\:right-auto.md\\:p-0.md\\:bg-transparent.md\\:border-none.md\\:shadow-none.md\\:flex-1.md\\:overflow-y-auto.md\\:pr-1.md\\:mt-2.md\\:gap-5.md\\:pt-5.top-\\[76px\\],
body[data-theme='light'] .absolute.inset-x-0.top-0.flex.justify-between.items-center.p-4.z-20.pointer-events-auto.bg-gradient-to-b.from-\\[\\#0c0c0cc9\\].to-transparent.md\\:bg-none.md\\:relative.md\\:top-auto.md\\:left-auto.md\\:right-auto.md\\:p-0.md\\:mb-6{
    backdrop-filter: blur(4px) saturate(131%) !important;
    -webkit-backdrop-filter: blur(4px) saturate(131%) !important;
    background-color: rgba(255, 255, 255, 0.39) !important;
    border-radius: 12px !important;
    border: 1px solid rgba(255, 255, 255, 0.125) !important;
    --tw-gradient-position: none !important;
    background-image: none !important;
    --tw-gradient-from: none !important;
    --tw-gradient-stops: none !important;
    --tw-gradient-to: none !important;
}
body[data-theme='light'] img.w-full.h-full.object-contain:hover {
    border: 1px solid #d9ad4452 !important;
    box-shadow: 0px 0px 10px 0px rgb(255 185 46 / 30%) !important;
}
body[data-theme='light'] img.w-full.h-full.object-contain {
    border-radius: 35% 35% 35% 35% / 35% 35% 35% 35% !important;
    -webkit-box-shadow: 0px 0px 8px 0px rgba(255, 185, 46, 0.87) !important;
    -moz-box-shadow: 0px 0px 8px 0px rgba(255,185,46,0.87) !important;
    box-shadow: 0px 0px 7px 0px rgb(255 185 46 / 15%) !important;
    height: 26px !important;
    width: 25px !important;
}
body[data-theme='light'] img.h-10.w-auto.cursor-pointer.object-contain.active\\:scale-95.transition-transform {
    -webkit-box-shadow: 0px 0px 8px 0px rgba(255, 185, 46, 0.87) !important;
    -moz-box-shadow: 0px 0px 8px 0px rgba(255,185,46,0.87) !important;
    box-shadow: 0px 0px 17px 0px rgb(255 185 46 / 17%) !important;
    background: #ffdfa114 !important;
}
body[data-theme='light'] button.bg-brand-red\\/90.hover\\:bg-brand-red.w-7.h-6.rounded.flex.items-center.justify-center.shadow.active\\:scale-95.transition-transform {
    background: #fb2c36 !important;
}
body[data-theme='light'] input.tiny-checkbox {
    border: 1px solid #292929 !important;
}
body[data-theme='light'] span.text-\\[8px\\].text-gray-400.font-bold.tracking-wider.uppercase.font-archivo {
    color: #292929 !important;
    font-weight: 400 !important;
}
body[data-theme='light'] p.font-archivo.text-brand-orange.font-black.text-\\[11px\\].tracking-wider.uppercase.mb-1.text-left {
    font-weight: 400 !important;
    color: #e16000 !important;
}
body[data-theme='light'] h2.text-brand-text.font-archivo.font-black.text-\\[24px\\].text-center.tracking-\\[0\\.1em\\].uppercase.shrink-0 {
    font-weight: 400 !important;
}
body[data-theme='light'] .flex.gap-3.pointer-events-auto.w-full {
    height: 35px !important;
}
body[data-theme='light'] button.w-2\\/3.h-\\[52px\\].bg-brand-orange.hover\\:bg-brand-orange\\/90.rounded-\\[16px\\].flex.items-center.justify-center.shadow-\\[0_10px_30px_rgba\\(224\\,105\\,56\\,0\\.3\\)\\].active\\:scale-\\[0\\.98\\].focus-visible\\:ring-2.focus-visible\\:ring-white.outline-none.transition-all.disabled\\:opacity-40.disabled\\:cursor-not-allowed,
body[data-theme='light'] button.w-1\\/3.h-\\[52px\\].bg-red-500.hover\\:bg-red-600.rounded-\\[16px\\].flex.items-center.justify-center.gap-2.shadow-lg.active\\:scale-\\[0\\.98\\].focus-visible\\:ring-2.focus-visible\\:ring-white.outline-none.transition-all {
    height: 100% !important;
    border-radius: 10px !important;
}
body[data-theme='light'] span.font-archivo.font-black.text-xl.text-brand-text.leading-none {
    color: #292929 !important;
    font-weight: 700 !important;
}
body[data-theme='light'] h3.text-brand-text.font-bold.text-sm.tracking-wide.mb-0\\.5.text-right.w-full.font-alexandria {
    margin: auto !important;
    padding: 0px 10px 0px 10px !important;
    text-align: center !important;
    font-weight: 700 !important;
    color: #292929 !important;
}

/* CUSTOM APP THEME STYLES - DARK */
body[data-theme='dark'] .w-4.h-0\\.5.bg-white.rounded-full{
    background:#292929 !important;
}
body[data-theme='dark'] .tiny-input.w-\\[65px\\].h-6.text-\\[10px\\].flex.items-center.justify-center.cursor-pointer.hover\\:border-brand-orange.transition-colors.select-none,
body[data-theme='dark'] .tiny-input.w-\\[72px\\].h-6.text-\\[10px\\].flex.items-center.justify-center.cursor-pointer.hover\\:border-brand-orange.transition-colors.select-none{
    background:#121212 !important;
    border:#404040 1px solid !important;
}
body[data-theme='dark'] .bg-brand-input.rounded-\\[14px\\].p-2.flex.flex-col.items-center.justify-center.border.border-brand-border,
body[data-theme='dark'] .flex.items-center.gap-1.w-full.bg-brand-input.rounded-\\[14px\\].p-1.border.border-brand-border.shadow-md.transition-all,
body[data-theme='dark'] .absolute.bottom-0.left-0.right-0.bg-brand-bg.rounded-t-\\[32px\\].pt-6.pb-8.px-5.z-20.flex.flex-col.gap-4.shadow-\\[0_-10px_40px_rgba\\(0\\,0\\,0\\,0\\.5\\)\\].border-t.border-brand-border.pointer-events-auto.md\\:relative.md\\:bottom-auto.md\\:left-auto.md\\:right-auto.md\\:p-0.md\\:bg-transparent.md\\:border-none.md\\:shadow-none.md\\:flex-1.md\\:overflow-y-auto.md\\:pr-1.md\\:mt-2.md\\:gap-5.md\\:pt-5.top-\\[76px\\],
body[data-theme='dark'] .absolute.inset-x-0.top-0.flex.justify-between.items-center.p-4.z-20.pointer-events-auto.bg-gradient-to-b.from-\\[\\#0c0c0cc9\\].to-transparent.md\\:bg-none.md\\:relative.md\\:top-auto.md\\:left-auto.md\\:right-auto.md\\:p-0.md\\:mb-6{
    backdrop-filter: blur(4px) saturate(131%) !important;
    -webkit-backdrop-filter: blur(4px) saturate(131%) !important;
    background-color: rgb(0 0 0 / 55%) !important;
    border-radius: 12px !important;
    border: 1px solid rgba(255, 255, 255, 0.125) !important;
    --tw-gradient-position: none !important;
    background-image: none !important;
    --tw-gradient-from: none !important;
    --tw-gradient-stops: none !important;
    --tw-gradient-to: none !important;
}
body[data-theme='dark'] img.w-full.h-full.object-contain:hover {
    border: 1px solid #d9ad4452 !important;
    box-shadow: 0px 0px 10px 0px rgb(255 185 46 / 30%) !important;
}
body[data-theme='dark'] img.w-full.h-full.object-contain {
    border-radius: 35% 35% 35% 35% / 35% 35% 35% 35% !important;
    -webkit-box-shadow: 0px 0px 8px 0px rgba(255, 185, 46, 0.87) !important;
    -moz-box-shadow: 0px 0px 8px 0px rgba(255,185,46,0.87) !important;
    box-shadow: 0px 0px 7px 0px rgb(255 185 46 / 15%) !important;
    height: 26px !important;
    width: 25px !important;
}
body[data-theme='dark'] img.h-10.w-auto.cursor-pointer.object-contain.active\\:scale-95.transition-transform {
    -webkit-box-shadow: 0px 0px 8px 0px rgba(255, 185, 46, 0.87) !important;
    -moz-box-shadow: 0px 0px 8px 0px rgba(255,185,46,0.87) !important;
    box-shadow: 0px 0px 17px 0px rgb(255 185 46 / 17%) !important;
    background: #ffdfa114 !important;
}
body[data-theme='dark'] button.bg-brand-red\\/90.hover\\:bg-brand-red.w-7.h-6.rounded.flex.items-center.justify-center.shadow.active\\:scale-95.transition-transform {
    background: #fb2c36 !important;
}
body[data-theme='dark'] input.tiny-checkbox {
    border: 1px solid #404040 !important;
}
body[data-theme='dark'] span.text-\\[8px\\].text-gray-400.font-bold.tracking-wider.uppercase.font-archivo {
    color: #d4d4d4 !important;
    font-weight: 400 !important;
}
body[data-theme='dark'] p.font-archivo.text-brand-orange.font-black.text-\\[11px\\].tracking-wider.uppercase.mb-1.text-left {
    font-weight: 400 !important;
    color: #e16000 !important;
}
body[data-theme='dark'] h2.text-brand-text.font-archivo.font-black.text-\\[24px\\].text-center.tracking-\\[0\\.1em\\].uppercase.shrink-0 {
    font-weight: 400 !important;
}
body[data-theme='dark'] .flex.gap-3.pointer-events-auto.w-full {
    height: 35px !important;
}
body[data-theme='dark'] button.w-2\\/3.h-\\[52px\\].bg-brand-orange.hover\\:bg-brand-orange\\/90.rounded-\\[16px\\].flex.items-center.justify-center.shadow-\\[0_10px_30px_rgba\\(224\\,105\\,56\\,0\\.3\\)\\].active\\:scale-\\[0\\.98\\].focus-visible\\:ring-2.focus-visible\\:ring-white.outline-none.transition-all.disabled\\:opacity-40.disabled\\:cursor-not-allowed,
body[data-theme='dark'] button.w-1\\/3.h-\\[52px\\].bg-red-500.hover\\:bg-red-600.rounded-\\[16px\\].flex.items-center.justify-center.gap-2.shadow-lg.active\\:scale-\\[0\\.98\\].focus-visible\\:ring-2.focus-visible\\:ring-white.outline-none.transition-all {
    height: 100% !important;
    border-radius: 10px !important;
}
body[data-theme='dark'] span.font-archivo.font-black.text-xl.text-brand-text.leading-none {
    color: #e2e2e2 !important;
    font-weight: 700 !important;
}
body[data-theme='dark'] h3.text-brand-text.font-bold.text-sm.tracking-wide.mb-0\\.5.text-right.w-full.font-alexandria {
    margin: auto !important;
    padding: 0px 10px 0px 10px !important;
    text-align: center !important;
    font-weight: 700 !important;
    color: #eaeaea !important;
}
`;

fs.appendFileSync('src/index.css', cssToAppend);

