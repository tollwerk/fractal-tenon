/* eslint-disable global-require, import/no-dynamic-require, no-console */
const path = require('path');
const btoa = require('btoa');

function setupTenon(theme, opts) {
    const config = opts || {};

    // Test for the theme
    if ((typeof theme !== 'object') || (typeof theme.options !== 'function')) {
        throw new Error('Please provide a valid Fractal theme as first argument');
    }

    // Test for the Tenon API key
    if (!('apiKey' in config)) {
        throw new Error('Please provide a Tenon API key');
    }

    // Test for the public URL
    if (!('publicUrl' in config)) {
        throw new Error('Please provide the public URL of your Fractal instance');
    }

    // const scriptMount = `/tenon/${config.apiKey}/${encodeURIComponent(config.publicUrl)}`;
    const scriptMount = `/tenon/${config.apiKey}/${btoa(config.publicUrl)}`;
    theme.addLoadPath(path.resolve(__dirname, 'dist', 'views'));
    theme.addStatic(path.resolve(__dirname, 'dist', 'assets'), scriptMount);

    const options = theme.options();
    options.scripts = [].concat(...(options.scripts || ['default'])).concat([
        `/tenon/${config.apiKey}/${btoa(config.publicUrl)}/js/tenon.js`,
        `/tenon/${config.apiKey}/${btoa(config.publicUrl)}/js/highlight.js`,
    ]);
    options.styles = [].concat(...(options.styles || ['default'])).concat(`/tenon/${config.apiKey}/${btoa(config.publicUrl)}/css/tenon.css`);
    if (options.panels.indexOf('tenon') < 0) {
        options.panels.push('tenon');
    }
    theme.options(options);
}

module.exports = setupTenon;
