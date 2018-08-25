
function CreateNewAccount(e) {

    var fname = $('#Fname').val();
    var lname = $('#Lname').val();
    var email = $('#email').val();
    var password = $('#signPassword').val();

    if (fname == "" || lname == "" || email == "" || password == "") {
        $('#newaccountmsg').html("Please fill all fields");
        return;
    }

    var data = {
        "email": email,
        "password": password,
        "Fname": fname,
        "Lname": lname
    }

    var req = $.post('api/Login/', data);



    req.done(function (res) {
        if (res != "-1") {
            $('#newaccountmsg').html("Account Created Succefuly!!!");
            setTimeout(ReloadPage, 2000);
        }
        else
            $('#newaccountmsg').html("Email Already Exist!!!")
    });

    

}

function ReloadPage() {
    location.reload();
}


var CurUserMail;

function Logout() {

    if (loaded) {
        $('.loader').show();
        $("#wrapper").fadeTo(100, 0.5);
        loaded = false;
    }

    chart = [];
    chartCreated = false;
    chartData = [];
    chartSymbol = [];

    setTimeout(
        function () {
            var data = {
                "email": "0"
            };

            var req = $.post('api/Login/', data);

            req.done(function (res) {
                if (res != "-1") {
                    $('body').replaceWith(res);
                    location.reload();
                }


            });
        }, 3000);

   

}
var SymbolsDb = [];
var SymbolsDbLoaded = false;

function LoadMain(res) {
    if (res != "-1" && res != "0") {
        if ($('#inputEmail').val() != null)
            CurUserMail = $('#inputEmail').val();


        $('#main').replaceWith(res);

        $('#addStockBtn').popover({
            trigger: 'focus',
            placement: 'left'
        });
        
        $("#wrapper").fadeTo(100, 0.5);

        CreateEmptyChart();
        $('#stockSelect').select2({
            placeholder: "<<< Select A Stock >>>",
            dropdownCssClass: "stockSelect"
        });
        // $('#welcome').hide().fadeIn(6000).delay(2000).fadeOut(6000);
        var userEmail = {
            'email': CurUserMail
        }
        
        var u = $.post('api/Login/', userEmail);
        u.done(function (res) {

            userData = $.parseJSON(res);

            $('#userName').text(userData["Fname"] + " " + userData["Lname"]);
            userstocks = userData["stocks"];

            if (userstocks != null && userstocks.length > 0) {
                StartFollowStocks(userData["stocks"]);
                var msg = {
                    "stockemail": CurUserMail
                }
                var p = $.post('api/Login/', msg);
                p.done(function (resault) {
                    var temp = $.parseJSON(resault);
                    stockbuydata = temp[0]["stocks"];
                });
            }
            else {
                $('.loader').hide();
                $("#wrapper").fadeTo(1000, 1);
                loaded = true;
            }
            
        });

        if (!SymbolsDbLoaded) {

            var r = $.getJSON('api/Login/');
            r.done(function (resault) {
                UpdateSelectView(resault);
                SymbolsDb.push({
                    "type": "comp",
                    "symbols": resault
                });
            });
            
            data = {
                "GetJson": "Currency"
            }
            var g = $.post('api/Login/', data);
            
            g.done(function (res) {

                var jsonObj = $.parseJSON(res);

                var json = jsonObj["Cur"];
                var list = [];

                $.each(json, function (i, value) {
                    list.push(value["name"]);
                    //list.push({
                    //    "Name": value["name"],
                    //    "Symbol": value["symbol"]
                    //});
                   
                });


                var result = [];
                $.each(list, function (i, e) {
                    if ($.inArray(e, result) == -1 && e != "")
                        result.push(e);
                });

                SymbolsDb.push({
                    "type": "Currency",
                    "symbols": result
                });
            });

            data = {
                "GetJson": "Crypto"
            }

            var h = $.post('api/Login/', data);
            
            h.done(function (res) {
                var jsonObj = $.parseJSON(res);

                SymbolsDb.push({
                    "type": "Crypto",
                    "symbols": res
                });
            });
            SymbolsDbLoaded = true;
        }
        else {
            $.each(SymbolsDb, function (i, value) {
                if (value["type"] == "comp") {
                    UpdateSelectView(value["symbols"]);
                }
            
            });
        }

    }
    else {
        $('#error').html("Login Failed! Email/Password Not Valid.");
    }
}


function LoadCurrency() {

    $('.loader').hide();
    $("#wrapper").fadeTo(1000, 1);
    
    $('#stockSelect').hide();
    $('.select2-container').hide();
    $('#addStockBtn').hide();

    $.each(stockIntervals, function (i, value) {
        clearInterval(value["intervalID"]);
    });

    stockIntervals = [];


    var data = {
        'LoadPage': "Currency"
    }

    var u = $.post('api/Login/', data);
    u.done(function (res) {
        $('#innerpage').replaceWith(res);
        
        CreateEmptyChart();
        //$('#curFrom').select2({
        //    placeholder: "<<< From >>>",
        //    dropdownCssClass: "curFrom"
        //});
        //$('#curTo').select2({
        //    placeholder: "<<< To >>>",
        //    dropdownCssClass: "curTo"
        //});
        $.each(SymbolsDb, function (i, value) {
            if (value["type"] == "Currency") {
                UpdateCurrencyView(value["symbols"]);
            }
        });
    });
    loaded = false;

    
   
   
}

function LoadDashboard() {

    $('#stockSelect').show();
    $('#addStockBtn').show();
    $('.select2-container').show();

    var data = {
        'LoadPage': "dashbored"
    }

    var u = $.post('api/Login/', data);
    u.done(LoadMain);
    //u.done(function (res) {
    //    $('#main').replaceWith(res);
    //});
    loaded = false;

}


var stockbuydata = [];
var userstocks = [];
var stockIntervals = [];

function StartFollowStocks(stocks) {

    for (var i = 0; i < stocks.length; i++) {
        GetData(CurTimeSpan, stocks[i], "1min");
        var id = setInterval(GetData, 60000, CurTimeSpan, stocks[i], "1min");
        stockIntervals.push({
            "name": stocks[i],
            "intervalID": id
        });
    }

}

var userData;

function sortTable(table, order) {
    var asc = order === 'asc',
        tbody = table.find('tbody');

    tbody.find('tr').sort(function (a, b) {
        if (asc) {
            return $('td:first', a).text().localeCompare($('td:first', b).text());
        } else {
            return $('td:first', b).text().localeCompare($('td:first', a).text());
        }
    }).appendTo(tbody);
}

function AddStock() {

    var stock = $('#stockSelect').val();

    if (stock == null) {

        $('#addStockBtn').popover('enable');
        return;
    }
    else
        $('#addStockBtn').popover('disable');


    $('#addStockBtn').text('');
    $('#addStockBtn').append('<i class="fa fa-spinner fa-spin"></i> Pulling Data'); 
    $('#addStockBtn').prop("disabled", true);
    setTimeout(EnableAddStockBtn, 30000);
    
    GetData(CurTimeSpan, stock, "1min");
    var id = setInterval(GetData(CurTimeSpan, stock, "1min"), 60000);
    stockIntervals.push({
        "name": stock,
        "intervalID": id
    });
}

function UpdateSelectView(res) {
    var json = $.parseJSON(res);
    jQuery(json["Comp"]).each(function (i, item) {
        stockSymbolDB.push({
            "Name": item.Cname,
            "Symbol": item.symbol
        });
        $("#stockSelect").append('<option value=' + item.symbol + ' >' + item.Cname + '</option > ');
    })
    $("#stockSelect").val('');
}
var currencySymbolDB = [];

function UpdateCurrencyView(data) {
    

    $.each(data, function (i, value) {
        
        $("#curFrom").append('<option value=' + value + ' >' + value + '</option > ');
        $("#curTo").append('<option value=' + value + ' >' + value + '</option > ');
    });
    
}

var stockSymbolDB = [];

function CreateEmptyChart() {



    var d = new Date();
    chartData.push({
        "date": d,
        "value": 0
    });

    chart = AmCharts.makeChart("chartdiv", {
        "type": "serial",
        "dataProvider": chartData,
        "theme": "dark",
        "marginRight": 40,
        "marginLeft": 40,
        "autoMarginOffset": 20,
        "mouseWheelZoomEnabled": true,
        "dataDateFormat": "YYYY-MM-DD",
        "titles": [{
            "text": "Chart Has No Data"
        }],
        "valueAxes": [{
            "id": "v1",
            "axisAlpha": 0,
            "position": "left",
            "title": "Stock Price"
            //"title": "",
            //"ignoreAxisWidth": true
        }],
        "balloon": {
            "borderThickness": 1,
            "shadowAlpha": 0
        },
        "graphs": [{
            "id": "g1",
            "balloon": {
                "drop": true,
                "adjustBorderColor": false,
                "color": "#ffffff"
            },
            "bullet": "round",
            "bulletBorderAlpha": 1,
            "bulletColor": "#FFFFFF",
            "bulletSize": 5,
            "hideBulletsCount": 50,
            "lineThickness": 2,
            "title": "red line",
            "useLineColorForBulletBorder": true,
            "valueField": "value",
            "balloonText": "<span style='font-size:18px;'>[[value]]</span>"
        }],
        "chartScrollbar": {
            "graph": "g1",
            "oppositeAxis": false,
            "offset": 30,
            "scrollbarHeight": 80,
            "backgroundAlpha": 0,
            "selectedBackgroundAlpha": 0.1,
            "selectedBackgroundColor": "#888888",
            "graphFillAlpha": 0,
            "graphLineAlpha": 0.5,
            "selectedGraphFillAlpha": 0,
            "selectedGraphLineAlpha": 1,
            "autoGridCount": true,
            "color": "#AAAAAA"
        },
        "chartCursor": {
            "pan": true,
            "valueLineEnabled": true,
            "valueLineBalloonEnabled": true,
            "cursorAlpha": 1,
            "cursorColor": "#258cbb",
            "limitToGraph": "g1",
            "valueLineAlpha": 0.2,
            "valueZoomable": true
        },
        //"valueScrollbar": {
        //    "oppositeAxis": false,
        //    "offset": 50,
        //    "scrollbarHeight": 10
        //},
        "categoryField": "date",
        "categoryAxis": {
            "minPeriod": "mm",
            "parseDates": true
            //"parseDates": true,
            //"dashLength": 1,
            //"minorGridEnabled": true
        }


    });

    chartCreated = false;
    chart.validateData();
}

var rowDeleted = false;

function DeleteRow(row) {

    var s;

    if (row.currentTarget != null)
        s = $.text($(row.currentTarget).closest("tr")[0].firstChild);
    else
        s = row;

    for (var i = 0; i < stocksDB.length; i++) {
        var value = stocksDB[i];

        var meta = value["Meta Data"];
        if (meta["2. Symbol"] == s) {
            stocksDB.splice(i, 1);
            if (s == chartSymbol) {
                chartData = [];

                var d = new Date();
                chartData.push({
                    "date": d,
                    "value": 0
                });
                chart.titles[0].text = "";
                chart.dataProvider = chartData;
                chart.validateData();
                
            }
            break;
        }
    }

    if (row.currentTarget != null)
        $(row.currentTarget).closest("tr").remove();
    //else

        //$(row).closest("tr").remove();
    rowDeleted = true;
  
    for (var i = 0; i < stockIntervals.length; i++) {
        if (stockIntervals[i].name == s) {
            clearInterval(stockIntervals[i].intervalID);
            stockIntervals.splice(i, 1);
        }
    }

    var data = {
        "email": CurUserMail,
        "stockstodelete": s
    }

    var req = $.post('api/Login/', data);
    req.done(function () {

    });
}


function AddRow(row) {

    if ($.inArray(row[0], userstocks) == -1) {
        userstocks.push(row[0]);

        stockbuydata.push({
            "Purchase Date": new Date(),
            "Purchase Value": row[4],
            "symbol": row[0]
        });

        data = {
            "email": CurUserMail,
            "symbol": row[0],
            "Purchase Date": new Date(),
            "Purchase Value": row[4]
        }

        req = $.post('api/Login/', data)
        req.done(function () {

        });

    }
    

     var newRow = $("<tr id=\"" + row[0] + "\" onclick=\"ChangeTableData(this)\">");
     var cols = "";
    
     $.each(row, function (index, value) {
         cols += "<td id=\"" + row[0] + index + "\">" + value + "</td>";
     });

     for (var i = 0; i < stockbuydata.length; i++) {
         if (stockbuydata[i]["symbol"] == row[0]) {
             

                 var value = stockbuydata[i];

                 var Original = parseFloat(value["Purchase Value"]);
                 var Increase = parseFloat(row[4]) - Original;

                 var valPer = Increase / (Original * 100);
                 var valDif = Increase;

                 var dateObj = new Date(value["Purchase Date"]);
                 var month = dateObj.getUTCMonth() + 1; //months from 1-12
                 var day = dateObj.getUTCDate();
                 var year = dateObj.getUTCFullYear();

                 newdate = day + "." + month + "." + year;

                 
                 cols += "<td id=\"" + row[0] + "6" + "\">" + newdate + "</td>";
                 //cols += "<td id=\"" + row[0] + "6" + "\">" + value["Purchase Date"] + "</td>";
                 cols += "<td id=\"" + row[0] + "7" + "\">" + value["Purchase Value"] + "</td>";
                 cols += "<td id=\"" + row[0] + "8" + "\">" + valPer.toPrecision(2) + "%" + "</td>";
                 cols += "<td id=\"" + row[0] + "9" + "\">" + valDif.toPrecision(4) + "</td>";
             
         }
     }

     cols += '<td><input type="button" class="ibtnDel btn btn-md btn-danger " value="Delete" onclick=\"DeleteRow(event)\"></td>';
     newRow.append(cols);
     $("#dataTable").append(newRow);
     sortTable($('#dataTable'), 'asc');
     EnableAddStockBtn();
     if (!loaded) {
         $('.loader').hide();
         $("#wrapper").fadeTo(1000, 1);
         loaded = true;
     }
    var data = {
        "email": CurUserMail,
        "stocktoadd": row[0]
    };

    

     var req = $.post('api/Login/', data);
      req.done(function () {

     });

     

     PaintPerDif(row[0]);
     
}

function PaintPerDif(symbol) {
    if ($('#' + symbol + "9").html() < 0) {
        $('#' + symbol + "8").css("color", "red");
        $('#' + symbol + "9").css("color", "red");
    }
    else {
        $('#' + symbol + "8").css("color", "lightgreen");
        $('#' + symbol + "9").css("color", "lightgreen");
    }
}

var loaded = false;

function Toggle(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
    if (!$("#wrapper").hasClass("toggled") && $(document).width() > 1285) {
        $("#web-header").show();
        $("#logo").show();
    } else {
        $("#web-header").hide();
        $("#logo").hide();
    }
    
}

var stocksDB = [];

function GetData(func, symbol, interval) {

    var url = "https://www.alphavantage.co/query?function=" + func + "&symbol=" + symbol;

    if (func == "TIME_SERIES_INTRADAY")
        url += "&interval=" + interval;
    url += "&apikey=6MCXN56S1S7IJCDC";

    //var url = "https://www.alphavantage.co/query?function=" + func + "&symbol=" + symbol + "&interval=" + interval + "&apikey=6MCXN56S1S7IJCDC";
    $.getJSON(url, function (data) {
        var error = data["Meta Data"];

        if (error == null) {
            // Display error msg
            return;
        }
        var q = error["2. Symbol"];

        //var exist = $("#table-view:contains(" + q + ")").length;
        //if (exist == 0)
        var exist = false;
        for (var i = 0; i < stocksDB.length; i++) {
            var z = stocksDB[i];
            var r = z["Meta Data"];
            var l = r["2. Symbol"];
            if (l == q)
                exist = true;
        }

        if (!exist)
            stocksDB.push(data);

        if (!chartCreated) {
            CreateChart(data);
            //UpdateTableView(data);
            chartCreated = true;
        }
        else {
            UpdateTableView(data);
        }
        }).fail(function (a) {
            //alert("Request Failed!");
            EnableAddStockBtn();
        });
}

function EnableAddStockBtn() {
    $('#addStockBtn').remove('i');
    $('#addStockBtn').prop("disabled", false);
    $('#addStockBtn').text('Add Stock');
   
    $("#stockSelect").val('').trigger('change');
    
}



function UpdateTableView(data) {

    var a;

    if (CurTimeSpan == "TIME_SERIES_INTRADAY")
        a = data["Time Series (1min)"];
    else if (CurTimeSpan == "TIME_SERIES_DAILY")
        a = data["Time Series (Daily)"];
    else if (CurTimeSpan == "TIME_SERIES_WEEKLY")
        a = data["Weekly Time Series"];
    else if (CurTimeSpan == "TIME_SERIES_MONTHLY")
        a = data["Monthly Time Series"];

    
    var b = data["Meta Data"];
    var row = [];
    if (a != null && b != null) {
        var sym = b["2. Symbol"];
        $.each(a, function (index, value) {
            if (value != null) {
                row.push(value["1. open"]);
                row.push(value["2. high"]);
                row.push(value["3. low"]);
                row.push(value["4. close"]);
                row.push(value["5. volume"]);
            }
        });
       

        var exist = $("#table-view:contains(" + sym + ")");
        var realTimeRow = [];
        realTimeRow.push(sym);
        for (var i = 499; i > 499 - 6; i--) {
            realTimeRow.push(row[i]);
        }

        if (exist.length == 0) {
            AddRow(realTimeRow);
        }
        else {
            generateChartData(data);
            chart.validateData();
            zoomChart();

            if (!loaded) {
                $('.loader').hide();
                $("#wrapper").fadeTo(1000, 1);
                loaded = true;
            }

            for (var i = 1; i < 6; i++) {
                var curVal = $("#" + sym + i).html();
                if (curVal != realTimeRow[i]) {
                    
                    $("#" + sym + i).hide();
                    $("#" + sym + i).fadeIn(3000);
                    $("#" + sym + i).html(realTimeRow[i]);
                    
                }
               // $("#" + sym + j).html("<td id=\"" + realTimeRow[0] + j + "\">" + row[i] + "</td>");
            }

            UpdatePerDif(sym, realTimeRow[4]);
            PaintPerDif(sym);
        }
      
    }
   
}

function UpdatePerDif(symbol, newval) {


    for (var i = 0; i < stockbuydata.length; i++) {
        if (stockbuydata[i]["symbol"] == symbol) {
            

                var value = stockbuydata[i];

                var Original = parseFloat(value["Purchase Value"]);
                var Increase = parseFloat(newval) - Original;

            var valPer = Increase / Original;
            valPer = valPer * 100;
                var valDif = Increase;

                if ($("#" + symbol + "8").html() != valPer) {
                    $("#" + symbol + "8").hide();
                    $("#" + symbol + "8").fadeIn(3000);
                    $("#" + symbol + "8").html(valPer.toPrecision(2) + "%");
                }

                if ($("#" + symbol + "9").html() != valDif) {
                    $("#" + symbol + "9").hide();
                    $("#" + symbol + "9").fadeIn(3000);
                    $("#" + symbol + "9").html(valDif.toPrecision(4));
                }
                
            
        }
    }

}

var timeout;
var cnt = 0;

function exchangeCurrency() {


    if ($('#curAmount').val() == "") {
        $('.results').html("Please enter amount to convert");
        return;
    }
    var sym;
    var from = String($('#curFrom').val());
    var to = String($('#curTo').val());
    //var from = $("#curFrom option:selected").text();
    //var to = $("#curTo option:selected").text();
    if (from == "--Select--" || to == "--Select--") {
        $('.results').html("Please select currency symbol");
        return;
    }

    $.each(SymbolsDb, function (i, value) {
        if (value["type"] == "Crypto") {
            sym = $.parseJSON(value["symbols"]);
        }
    });

    $.each(sym, function (i, value) {
        if (value == from) {
            from = i;
            return -1;
        }
        else if (value == to) {
            to = i;
            return -1;
        }
    });

    
    var exRate = 0;
    
    var url = "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=" + from + "&to_currency=" + to + "&apikey=6MCXN56S1S7IJCDC"
    

    $.getJSON(url, function (data) {


        if (data["Realtime Currency Exchange Rate"] != null) {

            exRate = parseFloat(data["Realtime Currency Exchange Rate"]["5. Exchange Rate"]);

            var amount = $('#curAmount').val();

            var res = amount * exRate;

            $('.results').html(res);

            if (timeout != null) {
                clearInterval(timeout);
                timeout = null;
            }

            succed = true;
        }
        else {
            cnt++;
            var dots = "";
            for (var i = 0; i < cnt; i++)
                dots += ".";
            $('.results').html("Getting Latest Currency" + dots);
            if (timeout == null) {
                timeout = setInterval(exchangeCurrency, 2000);
            }
            

            if (cnt == 7) {
                clearInterval(timeout);
                timeout = null;
                cnt = 0;
                $('.results').html("Failed To Get Latest Currency!");
            }


        }

    });
        

}

var chartCreated = false;
var chartData = [];
var chart;
var chartSymbol = "";
function CreateChart(stockData) {


    UpdateTableView(stockData);
    chartData = generateChartData(stockData);

    chart = AmCharts.makeChart("chartdiv", {
        "type": "serial",
        "dataProvider": chartData,
        "theme": "dark",
        "marginRight": 40,
        "marginLeft": 40,
        "autoMarginOffset": 20,
        "mouseWheelZoomEnabled": true,
        "dataDateFormat": "YYYY-MM-DD",
        "titles": [{
            "text": chartSymbol + " (" + CurTimeSpan + ")"
        }],
        "valueAxes": [{
            "id": "v1",
            "axisAlpha": 0,
            "position": "left",
            "title": "Stock Price"
            //"title": "",
            //"ignoreAxisWidth": true
        }],
        "balloon": {
            "borderThickness": 1,
            "shadowAlpha": 0
        },
        "graphs": [{
            "id": "g1",
            "balloon": {
                "drop": true,
                "adjustBorderColor": false,
                "color": "#ffffff"
            },
            "bullet": "round",
            "bulletBorderAlpha": 1,
            "bulletColor": "#FFFFFF",
            "bulletSize": 5,
            "hideBulletsCount": 50,
            "lineThickness": 2,
            "title": "red line",
            "useLineColorForBulletBorder": true,
            "valueField": "value",
            "balloonText": "<span style='font-size:18px;'>[[value]]</span>"
        }],
        "chartScrollbar": {
            "graph": "g1",
            "oppositeAxis": false,
            "offset": 30,
            "scrollbarHeight": 80,
            "backgroundAlpha": 0,
            "selectedBackgroundAlpha": 0.1,
            "selectedBackgroundColor": "#888888",
            "graphFillAlpha": 0,
            "graphLineAlpha": 0.5,
            "selectedGraphFillAlpha": 0,
            "selectedGraphLineAlpha": 1,
            "autoGridCount": true,
            "color": "#AAAAAA"
        },
        "chartCursor": {
            "pan": true,
            "valueLineEnabled": true,
            "valueLineBalloonEnabled": true,
            "cursorAlpha": 1,
            "cursorColor": "#258cbb",
            "limitToGraph": "g1",
            "valueLineAlpha": 0.2,
            "valueZoomable": true
        },
       
        "categoryField": "date",
        "categoryAxis": {
            "minPeriod": "mm",
            "parseDates": true
            
        },
        "export": {
            "enabled": true
        }


    });

    $('#chartdiv').css({ opacity: 0.8 });

    chart.addListener("rendered", zoomChart);

    chart.validateData();

    //setInterval(ValidateChartData, 60000);

    zoomChart();

}

//function ValidateChartData() {
//    chart.validateData();
//    zoomChart();
//}

function zoomChart() {
    chart.zoomToIndexes(chart.dataProvider.length - 40, chart.dataProvider.length - 1);
}

function generateChartData(stockData) {
    chartData = [];
    var s;

    var a;

    if (CurTimeSpan == "TIME_SERIES_INTRADAY")
        a = stockData["Time Series (1min)"];
    else if (CurTimeSpan == "TIME_SERIES_DAILY")
        a = stockData["Time Series (Daily)"];
    else if (CurTimeSpan == "TIME_SERIES_WEEKLY")
        a = stockData["Weekly Time Series"];
    else if (CurTimeSpan == "TIME_SERIES_MONTHLY")
        a = stockData["Monthly Time Series"];


    //var a = stockData["Time Series (1min)"];
    var b = stockData["Meta Data"];

    if (a != null) {
        s = a;
        chartSymbol = b["2. Symbol"];
    }
    else {
        s = stockData;
    }


    $.each(s, function (key, value) {

        if (value != null) {
            
            var d = AmCharts.stringToDate(key, "YYYY-MM-DD HH:NN:SS");
            chartData.push({
                "date": d,
                "value": value["4. close"],
                //"high": value["2. high"]
                //"low": value["3. low"],
                //"close": value["4. close"]
                //"volume": value["5. volume"]
            });
            
        }
    });
    var temp = [];
    for (var i = chartData.length - 1; i >= 0; i--) {
        temp.push(chartData[i]);
    }
    chartData = temp;
    return temp;
}

function ChangeTableData(e) {

    if (rowDeleted) {
        rowDeleted = false;
        return;
    }

    chartSymbol = $.text(e.cells[0]);
    $.each(stocksDB, function (index, value) {
        if (!$.isEmptyObject(value)) {

            var a;
            if (CurTimeSpan == "TIME_SERIES_INTRADAY")
                a = value["Time Series (1min)"];
            else if (CurTimeSpan == "TIME_SERIES_DAILY")
                a = value["Time Series (Daily)"];
            else if (CurTimeSpan == "TIME_SERIES_WEEKLY")
                a = value["Weekly Time Series"];
            else if (CurTimeSpan == "TIME_SERIES_MONTHLY")
                a = value["Monthly Time Series"];

            //var a = value["Time Series (1min)"];
            var b = value["Meta Data"];
            if (b["2. Symbol"] == chartSymbol) {
                //chartData = [];
                chartData = generateChartData(a);
                chart.validateData();
                zoomChart();
                return false;
            }
        }
       
    });

    chart.titles[0].text = chartSymbol + " (" + CurTimeSpan + ")";
    chart.dataProvider = chartData;
   
    chart.validateData();
    
    zoomChart();
}

var CurTimeSpan = "TIME_SERIES_INTRADAY";


function SwitchCurrencyFrom(e) {
    var data;
    $('#curFrom').html('');
    if ($(e.target).val() == "cur") {
        $.each(SymbolsDb, function (i, value) {
            if (value["type"] == "Currency") {
                data = value["symbols"];
            }
            });
        $.each(data, function (i, value) {

            $("#curFrom").append('<option value=' + value + ' >' + value + '</option > ');
            //$("#curTo").append('<option value=' + value + ' >' + value + '</option > ');
        });
     }

    else {
        $.each(SymbolsDb, function (i, value) {
            if (value["type"] == "Crypto") {
                data = $.parseJSON(value["symbols"]);
            }
        });
            $.each(data, function (i, value) {

                $("#curFrom").append('<option value=' + value + ' >' + value + '</option > ');
                //$("#curTo").append('<option value=' + value + ' >' + value + '</option > ');
            });
      
        
    }
}

function SwitchCurrencyTo(e) {
    var data;
    $('#curTo').html('');
    if ($(e.target).val() == "cur") {
        $.each(SymbolsDb, function (i, value) {
            if (value["type"] == "Currency") {
                data = value["symbols"];
            }
        });
        $.each(data, function (i, value) {

            //$("#curFrom").append('<option value=' + value + ' >' + value + '</option > ');
            $("#curTo").append('<option value=' + value + ' >' + value + '</option > ');
        });
    }

    else {
        $.each(SymbolsDb, function (i, value) {
            if (value["type"] == "Crypto") {
                data = $.parseJSON(value["symbols"]);
            }
        });
            $.each(data, function (i, value) {

               // $("#curFrom").append('<option value=' + value + ' >' + value + '</option > ');
                $("#curTo").append('<option value=' + value + ' >' + value + '</option > ');
            
        });

    }
}


function ChangeTimeSpan(e) {

    if (loaded) {
        $('.loader').show();
        $("#wrapper").fadeTo(100, 0.5);
        loaded = false;
    }


    var timespan = $.text(e.currentTarget);

    if (timespan == "Intraday")
        CurTimeSpan = "TIME_SERIES_INTRADAY";
    else if (timespan == "Daily")
        CurTimeSpan = "TIME_SERIES_DAILY";
    else if (timespan == "Weekly")
        CurTimeSpan = "TIME_SERIES_WEEKLY";
    else if (timespan == "Monthly")
        CurTimeSpan = "TIME_SERIES_MONTHLY";

    //var rows = $("#dataTable")[0].children[1].children;
    //for (var i = 0; i < rows.length; i++) {
    //    $(rows[i]).closest("tr").remove();
    //    clearInterval(stockIntervals[i].intervalID);
    //}


    var userEmail = {
        'email': CurUserMail
    }

    var req = $.post('api/Login/', userEmail);

    req.done(function (res) {

        userData = $.parseJSON(res);

        //$('#userName').text(userData["Fname"] + " " + userData["Lname"]);
        var stocks = userData["stocks"];

        
        CreateEmptyChart();
        if (stocks != null && stocks.length > 0) {
            for (var i = 0; i < stocks.length; i++) {
                //var rowCount = $('#dataTable tr').length;
                //if (rowCount > 1)
                //    document.getElementById("dataTable").deleteRow(i + 1);
                stocksDB = [];
                stockData = [];
                for (var j = 0; j < stockIntervals.length; j++) {
                    
                    clearInterval(stockIntervals[j].intervalID);
                    stockIntervals.splice(j, 1);
                }
                
                //$('#dataTable').de
                //DeleteRow(stocks[i]);
            }
            StartFollowStocks(userData["stocks"]);
        }
        else {
            $('.loader').hide();
            $("#wrapper").fadeTo(1000, 1);
            loaded = true;
        }

    });

}

