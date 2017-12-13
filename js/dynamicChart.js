AmCharts.ready(function () {
    getDataAndGenerateChart();
});

setInterval(function () {
    getDataAndGenerateChart();
}, 70000);

function getDataAndGenerateChart() {
    "use strict";
    if (!account) {
        return;
    }
    $.ajax({
        type: "POST",
        // type: "get",
        url: "http://monopool.io/api/eth/hashratechart",
        // url: "https://api.nanopool.org/v1/eth/hashratechart/" + account,
        dataType: "json",
        data: JSON.stringify([account]),
        crossDomain: true
    }).done(function (responseData) {
        if (responseData.data.length === 0) {
            $("#chartRow").addClass("hidden");
        } else {
            $("#chartRow").removeClass("hidden");
            generateChart(convertChartData(responseData.data));
        }
    }).fail(function (xhr, status, error) {
        console.log("error:");
        console.log(status);
        console.log(xhr.responseText);
    });
}

function convertChartData(responseData) {
    "use strict";
    if (!responseData) {
        return [];
    }
    var chartData = [];
    responseData.sort(compare);
    for (var i = 10; i < responseData.length; i++) {
        var datum = responseData[i];
        var newDate = new Date(datum.date * 1000);
        chartData.push({
            date: newDate,
            hashrate: datum.hashrate,
            shares: datum.shares
        });
    }
    return chartData;
}

function compare(a, b) {
    if (a.date < b.date)
        return -1;
    if (a.date > b.date)
        return 1;
    return 0;
}

function generateChart(chartData) {
    "use strict";
    var chart = AmCharts.makeChart("chartDiv", {

            type: "stock",
            theme: "light",
            pathToImages: "https://www.amcharts.com/lib/3/images/",
            glueToTheEnd: true,

            categoryAxesSettings: {
                minPeriod: "mm"
            },

            dataSets: [{
                color: "#4CAF50",
                fieldMappings: [{
                    fromField: "hashrate",
                    toField: "hashrate"
                }, {
                    fromField: "shares",
                    toField: "shares"
                }],
                dataProvider: chartData,
                categoryField: "date"
            }],

            panels: [{
                showCategoryAxis: false,
                title: "Hashrate, Mh/s",
                percentHeight: 70,

                stockGraphs: [{
                    id: "g1",
                    valueField: "hashrate",
                    type: "smoothedLine",
                    lineThickness: 2,
                    bullet: "round",
                    balloonFunction: function (item) {
                        return "<b>" + item.values.value + "</b>";
                    }
                }],

                stockLegend: {
                    valueTextRegular: " ",
                    markerType: "none"
                }
            },

                {
                    title: "Shares",
                    percentHeight: 30,
                    stockGraphs: [{
                        valueField: "shares",
                        type: "column",
                        cornerRadiusTop: 2,
                        fillAlphas: 1,
                        balloonFunction: function (item) {
                            return "<b>" + item.values.value + "</b>";
                        }
                    }],

                    stockLegend: {
                        valueTextRegular: " ",
                        markerType: "none"
                    }
                }
            ],

            chartScrollbarSettings: {
                graph: "g1",
                usePeriod: "10mm",
                position: "bottom"
            },

            chartCursorSettings: {
                valueBalloonsEnabled: true
            },

            periodSelector: {
                position: "bottom",
                dateFormat: "YYYY-MM-DD JJ:NN",
                inputFieldsEnabled: false,
                periods: [{
                    period: "hh",
                    count: 1,
                    label: "1 hour"
                }, {
                    period: "hh",
                    count: 12,
                    label: "12 hours"
                }, {
                    period: "DD",
                    count: 1,
                    label: "1 day",
                    selected: true
                }, {
                    period: "MAX",
                    label: "MAX"
                }]
            },

            panelsSettings: {
                usePrefixes: true
            }
        }
        )
    ;
}