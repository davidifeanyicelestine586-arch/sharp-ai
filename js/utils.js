/* ========================= UTILITY FUNCTIONS ========================= */
import { state } from './state.js';

export function sanitizeHTML(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  
  const sanitizeNode = (node) => {
    if (['script', 'iframe', 'object', 'embed', 'link', 'style'].includes(node.nodeName.toLowerCase())) {
      node.remove();
      return;
    }
    
    if (node.attributes) {
      Array.from(node.attributes).forEach(attr => {
        const name = attr.name.toLowerCase();
        const val = attr.value.toLowerCase();
        if (name.startsWith('on') || val.startsWith('javascript:')) {
          node.removeAttribute(attr.name);
        }
      });
    }
    
    Array.from(node.childNodes).forEach(sanitizeNode);
  };
  
  sanitizeNode(doc.body);
  return doc.body.innerHTML;
}

export function escapeHTML(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function clearAllActiveTypewriters() {
  state.activeTypewriterTimeouts.forEach(t => clearTimeout(t));
  state.activeTypewriterTimeouts = [];
}

export function typeWriterMarkdown(element, text) {
  element.innerHTML = "";
  let i = 0;
  let currentText = "";
  
  function frame() {
    if (i < text.length) {
      currentText += text.charAt(i);
      if (typeof marked !== 'undefined') {
        element.innerHTML = sanitizeHTML(marked.parse(currentText));
      } else {
        element.innerText = currentText;
      }
      i++;
      const t = setTimeout(frame, 3);
      state.activeTypewriterTimeouts.push(t);
    }
  }
  frame();
}
