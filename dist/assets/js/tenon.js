/* global hljs */
/* eslint-disable no-useless-escape */

(function (d) {
    var currentScript = "currentScript",
        scripts = d.getElementsByTagName('script'); // Live NodeList collection

    // If browser needs currentScript polyfill, add get currentScript() to the document object
    if (!(currentScript in d)) {
        Object.defineProperty(d, currentScript, {
            get: function () {

                // IE 6-10 supports script readyState
                // IE 10+ support stack trace
                try {
                    throw new Error();
                } catch (err) {

                    // Find the second match for the "at" string to get file src url from stack.
                    // Specifically works with the format of stack traces in IE.
                    var i, res = ((/.*at [^\(]*\((.*):.+:.+\)$/ig).exec(err.stack) || [false])[1];

                    // For all scripts on the page, if src matches or if ready state is interactive, return the script tag
                    for (i in scripts) {
                        if (scripts[i].src == res || scripts[i].readyState == "interactive") {
                            return scripts[i];
                        }
                    }

                    // If no match, return null
                    return null;
                }
            }
        });
    }

    /**
     * Tenon constructor
     *
     * @param {Element} currentScript Current script
     * @constructor
     */
    function TenonAPIClient(currentScript) {
        var path = currentScript.getAttribute('src', 2).split('/');
        this.apiUrl = 'https://tenon.io/api/';
        this.apiKey = path[2];
        this.publicUrl = atob(path[3]);
    }

    /**
     * Test the current component against Tenon
     *
     * @param {String} relUrl Relative component URL
     */
    TenonAPIClient.prototype.test = function (relUrl) {
        this.button = d.querySelector('.tenon-controls button');
        this.history = d.querySelector('.tenon-history');
        this.results = d.querySelector('.tenon-results');

        this.button.disabled = true;
        this.clearElement(this.results);

        var data = new FormData();
        data.append('key', this.apiKey);
        data.append('url', this.publicUrl + relUrl);
        data.append('viewPortWidth', d.querySelector('.Preview-iframe').clientWidth);
        data.append('fragment', '1');
        data.append('store', '1');

        // API call
        var that = this;
        fetch(this.apiUrl, { method: 'post', body: data })
            .then(function (response) {
                return response.json();
            })
            .then(this.showResult.bind(this))
            .catch(function () {
                that.button.disabled = false;
                that.results.appendChild(that.createElement('p', { 'class': 'tenon-error' }, 'An error occurred. Please view the results on tenon.io'));
            });
    };

    /**
     * Show the tenon test results
     *
     * @param {Object} data Test results
     */
    TenonAPIClient.prototype.showResult = function (data) {
        this.button.disabled = false;

        // Create the history link
        if (data.resultUrl) {
            this.clearElement(this.history).appendChild(this.createElement('a', {
                href: data.resultUrl,
                target: '_blank',
            }, 'View results on tenon.io'));
        }

        // Create the result list
        var results;
        var issues = this.filterIssues(data.resultSet);
        if (issues.length) {
            results = this.createElement('ol', { class: 'tenon-issues' });
            for (var i = 0; i < issues.length; ++i) {
                this.addIssue(results, issues[i]);
            }
        } else {
            results = this.createElement('p', { class: 'tenon-success' }, 'Congratulations! There were no issues found with this component.');
        }
        this.results.appendChild(results);
    };

    /**
     * Filter issues
     *
     * @param {Array} issues Issues
     * @return {Array} Filtered issus
     */
    TenonAPIClient.prototype.filterIssues = function (issues) {
        return issues.filter(function (issue) {
            return issue.bpID ? ([
                28 // Page level heading
            ].indexOf(issue.bpID) < 0) : true;
        });
    };

    /**
     * Add an issue to the result list
     *
     * @param {Element} results Result list
     * @param {Object} data Issue
     */
    TenonAPIClient.prototype.addIssue = function (results, data) {
        var issue = this.createElement('li');

        // Add title
        issue.appendChild(this.createElement('h3', null, data.errorTitle));
        issue.appendChild(this.createElement('div', { class: 'tenon-priority Tree-title' }, 'Priority ' + data.priority + '%'));

        // Add code snippet
        var code = this.createElement('code');
        var pre = code.appendChild(this.createElement('pre', null));
        pre.innerHTML = data.errorSnippet;
        hljs.highlightBlock(pre);
        issue.appendChild(code);

        // Add error description
        var descr = this.createElement('p');
        descr.innerHTML = data.errorDescription;
        issue.appendChild(descr);

        results.appendChild(issue);
    };

    /**
     * Create and return an HTML element
     *
     * @param {String} element Element name
     * @param {Object} attributes Attributes
     * @param {String} content Text content
     * @return {Element} Element
     */
    TenonAPIClient.prototype.createElement = function (element, attributes, content) {
        var el = d.createElement(element);
        var attrs = attributes || {};
        for (var a in attrs) {
            el.setAttribute(a, attrs[a]);
        }
        el.textContent = content || '';
        return el;
    };

    /**
     * Clear an element
     *
     * @param {Element} element Element
     * @return {Element}
     */
    TenonAPIClient.prototype.clearElement = function (element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        return element;
    };

    window.Tenon = new TenonAPIClient(d.currentScript);
}(document));
