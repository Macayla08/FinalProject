const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Sanitize input to prevent XSS or malicious code.
 * @param {string} dirtyHtml - 
 * @returns {string} 
 */
function sanitizeInput(dirtyHtml) {
    return DOMPurify.sanitize(dirtyHtml);
}

module.exports = sanitizeInput;
