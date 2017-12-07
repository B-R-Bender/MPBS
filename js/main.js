var account;
var accountHash;

$(document).ready(function(){
    var accountParam = getQueryParams(document.location.search).account;
    document.getElementById('accountInput').placeholder = accountParam ? "Current account: " + accountParam : "Search for account";
    account = accountParam ? accountParam : 0;
    $('#workersTable').DataTable({
        info: false
    });
    $('#calculatorTable').DataTable({
        info: false,
        paging: false,
        searching: false,
        order: [[1, "asc"]]
    });
    updateHashRate();
    updateTabs();
});

setInterval(function() {
    "use strict";
    updateHashRate();
    updateTabs();
}, 60000);

function updateHashRate() {
    "use strict";
    getAndUpdateRate("hashrate");
    getAndUpdateRate("average_hashrate");
    getAndUpdateRate("last_reported_hashrate");
}


function getAndUpdateRate(hashType) {
    var url, data;
    switch (hashType) {
        case ("hashrate") :
            url = "http://monopool.io/api/eth/hashrate";
            // url = "https://api.nanopool.org/v1/eth/hashrate/" + account;
            data = JSON.stringify([account]);
            break;
        case ("average_hashrate") :
            url = "http://monopool.io/api/eth/avghashratelimited";
            // url = "https://api.nanopool.org/v1/eth/avghashratelimited/" + account + "/6";
            data = JSON.stringify([account, "6"]);
            break;
        case ("last_reported_hashrate") :
            url = "http://monopool.io/api/eth/reportedhashrate";
            // url = "https://api.nanopool.org/v1/eth/reportedhashrate/" + account;
            data = JSON.stringify([account]);
            break;
    }
    $.ajax({
        type:"POST",
        // type:"GET",
        url: url,
        dataType: "json",
        data: data,
        crossDomain : true
    }).done(function (responseData) {
        updateHashRateData(hashType ,responseData);
    }).fail(function (xhr, status, error) {
        console.log("error:");
        console.log(status);
        console.log(xhr.responseText);
    });
}

function updateHashRateData(type, data){
    "use strict";
    var bind;
    switch (type) {
        case "hashrate":
            bind = document.querySelector('div[data-bind="hashrate"]');
            accountHash = data.data;
            break;
        case "average_hashrate":
            bind = document.querySelector('div[data-bind="average_hashrate"]');
            break;
        case "last_reported_hashrate":
            bind = document.querySelector('div[data-bind="last_reported_hashrate"]');
            break;
    }
    bind.innerHTML = roundTo(data.data, 2) + " ,Mh/s";
}

function updateTabs(){
    "use strict";
    getAndUpdateTabs("workers");
    getAndUpdateTabs("calculator");
}

function getAndUpdateTabs(tab) {
    var url, data;
    switch (tab) {
        case ("workers") :
            url = "http://monopool.io/api/eth/workers";
            // url = "https://api.nanopool.org/v1/eth/workers/" + account;
            data = JSON.stringify([account]);
            break;
        case ("calculator") :
            if (!accountHash) {
                setTimeout(function(){
                    getAndUpdateTabs("calculator");
                }, 100);
                return;
            }
            url = "http://monopool.io/api/eth/approximated_earnings";
            // url = "https://api.nanopool.org/v1/eth/approximated_earnings/" + accountHash;
            data = JSON.stringify([accountHash]);
            break;
    }
    $.ajax({
        type:"POST",
        // type:"GET",
        url: url,
        dataType: "json",
        data: data,
        crossDomain : true
    }).done(function (response) {
        updateTabData(tab, response.data);
    }).fail(function (xhr, status, error) {
        console.log("error:");
        console.log(status);
        console.log(xhr.responseText);
    });
}

function updateTabData(tab, responseData) {
    switch (tab) {
        case "workers":
            var workersTable = $('#workersTable').DataTable();
            workersTable.clear();
            workersTable.rows.add(convertWorkersData(responseData));
            workersTable.draw();
            break;
        case "calculator":
            var calculatorTable = $('#calculatorTable').DataTable();
            calculatorTable.clear();
            calculatorTable.rows.add(convertCalculatorData(responseData));
            calculatorTable.draw();
            break;
    }
}

function convertWorkersData(responseData) {
    "use strict";
    if (!responseData) {
        return [];
    }
    var convertedData = [];
    for (var i = 0; i < responseData.length; i++) {
        var data = responseData[i];
        convertedData.push([data.id, convertToDateCalculated(data.lastShare * 1000), data.rating, data.hashrate]);
    }
    return convertedData;
}

function convertCalculatorData(responseData) {
    "use strict";
    var convertedData = [];

    for (var property in responseData) {
        if (responseData.hasOwnProperty(property)) {
            var dataObject = responseData[property];
            convertedData.push([property, dataObject.coins, dataObject.bitcoins, roundTo(dataObject.dollars, 2)]);
        }
    }
    return convertedData;
}