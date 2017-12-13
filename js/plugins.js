// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.

function roundTo(n, digits) {
    var negative = false;
    if (digits === undefined) {
        digits = 0;
    }
    if( n < 0) {
        negative = true;
        n = n * -1;
    }
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    n = (Math.round(n) / multiplicator).toFixed(digits);
    if( negative ) {
        n = (n * -1).toFixed(digits);
    }
    return n;
}

function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}

function convertToDateCalculated(millis) {
    /**
     * Нормализация значений дат под европейский формат
     * @param data
     * @returns {string}
     */
    function normalizeDateValues(data) {
        return data < 10 ? "0" + data : data;
    }

    var dateReadable = new Date(millis);
    var year = dateReadable.getFullYear();
    var month = normalizeDateValues(dateReadable.getMonth() + 1);
    var day = normalizeDateValues(dateReadable.getDate());
    var hour = normalizeDateValues(dateReadable.getHours());
    var minutes = normalizeDateValues(dateReadable.getMinutes());
    var seconds = normalizeDateValues(dateReadable.getSeconds());

    return day + "." + month + "." + year + " " + hour + ":" + minutes + ":" + seconds;
}

function goToAccountPage(){
    window.location.href = "index.html?account=" + document.getElementById('accountInput').value;
}
