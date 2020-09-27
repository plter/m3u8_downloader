// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
    }
})


window.NodePath = require("path");
window.electron = require("electron");
window.http = require("http");
window.util = require("util");
window.fs = require("fs");
window.NodeBuffer = Buffer;
window.fsWriteAsync = window.util.promisify(fs.writeFile.bind(fs));
