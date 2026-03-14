// React bundle disabled to allow a static HTML/CSS/JS app in public/index.html.
// Keeping this file minimal prevents React from overwriting the static UI.
const root = document.getElementById('root');
if (root) {
  root.remove();
}

export {};
