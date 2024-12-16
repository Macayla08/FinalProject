const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);


function sanitizeInput(dirtyHtml) {
    return DOMPurify.sanitize(dirtyHtml);
}

module.exports = sanitizeInput;
