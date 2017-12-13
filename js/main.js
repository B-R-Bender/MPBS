var account, accountHash;
var HASHRATE = "hashrate",
    AVERAGE_HASHRATE = "average_hashrate",
    LAST_HASHRATE = "last_reported_hashrate",
    BALANCE = "current_balance";

$(document).ready(function(){
    account = getQueryParams(document.location.search).account;
    $('#workersTable').DataTable({
        info: false
    });
    $('#calculatorTable').DataTable({
        info: false,
        paging: false,
        searching: false,
        order: [[1, "asc"]]
    });
    if (account) {
        $("#dataContainer").removeClass("hidden");
        $("#accountSearchContainer").removeClass("page-center");
        $("#accountInput").attr("placeholder", account ? "Current account: " + account : "Search for account");
        updateHashRate();
        updateTabs();
    }
});

setInterval(function() {
    "use strict";
    if (account) {
        updateHashRate();
        updateTabs();
    }
}, 60000);

function updateHashRate() {
    "use strict";
    getAndUpdateRate(HASHRATE);
    getAndUpdateRate(AVERAGE_HASHRATE);
    getAndUpdateRate(LAST_HASHRATE);
    getAndUpdateRate(BALANCE);
}

function getAndUpdateRate(hashType) {
    var url, data;
    switch (hashType) {
        case (HASHRATE) :
            url = "http://monopool.io/api/eth/hashrate";
            // url = "https://api.nanopool.org/v1/eth/hashrate/" + account;
            data = JSON.stringify([account]);
            break;
        case (AVERAGE_HASHRATE) :
            url = "http://monopool.io/api/eth/avghashratelimited";
            // url = "https://api.nanopool.org/v1/eth/avghashratelimited/" + account + "/6";
            data = JSON.stringify([account, "6"]);
            break;
        case (LAST_HASHRATE) :
            url = "http://monopool.io/api/eth/reportedhashrate";
            // url = "https://api.nanopool.org/v1/eth/reportedhashrate/" + account;
            data = JSON.stringify([account]);
            break;
        case (BALANCE) :
            url = "http://monopool.io/api/eth/balance";
            // url = "https://api.nanopool.org/v1/eth/balance/" + account;
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
        case HASHRATE:
            bind = document.querySelector(getSelector(HASHRATE));
            accountHash = data.data;
            break;
        case AVERAGE_HASHRATE:
            bind = document.querySelector(getSelector(AVERAGE_HASHRATE));
            break;
        case LAST_HASHRATE:
            bind = document.querySelector(getSelector(LAST_HASHRATE));
            break;
        case BALANCE:
            var roundedBalanceValue = roundTo(data.data, 8);
            document.querySelector(getSelector(BALANCE)).innerHTML
                = isNaN(roundedBalanceValue) ? "No data available" : roundedBalanceValue + " ETH";
            return;
    }
    var roundedValue = roundTo(data.data, 2);
    bind.innerHTML = isNaN(roundedValue) ? "No data available" : roundedValue + " Mh/s";
}

function getSelector(dataBind) {
    return "div[data-bind=\"" + dataBind + "\"]";
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