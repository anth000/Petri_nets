var Logs = [];
var LogsByCase = {};
var LogQueue = [];
var LogTimer = null;

function load_log_file(file) {
    ReadFromFile(file, function (event) {
        parse_log_csv(event.target.result);
    });
}

function parse_log_csv(text) {
    Logs = [];
    LogsByCase = {};
    var lines = text.trim().split(/\r?\n/);
    if (lines.length === 0) {
        return;
    }
    // assume header case_id,timestamp,activity
    lines.shift();
    lines.forEach(function (line) {
        if (!line.trim()) return;
        var cols = line.split(",");
        var item = {
            case_id: cols[0].trim(),
            timestamp: cols[1].trim(),
            activity: cols[2].trim()
        };
        Logs.push(item);
        if (!LogsByCase[item.case_id]) {
            LogsByCase[item.case_id] = [];
        }
        LogsByCase[item.case_id].push(item);
    });
    update_case_filter();
}

function update_case_filter() {
    var sel = document.getElementById("caseFilter");
    if (!sel) return;
    sel.innerHTML = "";
    var optAll = document.createElement("option");
    optAll.value = "*";
    optAll.text = "All";
    sel.appendChild(optAll);
    Object.keys(LogsByCase).forEach(function (id) {
        var opt = document.createElement("option");
        opt.value = id;
        opt.text = id;
        sel.appendChild(opt);
    });
}

function prepare_log_simulation() {
    var sel = document.getElementById("caseFilter");
    var selected = sel ? sel.value : "*";
    var cases = selected === "*" ? Object.keys(LogsByCase) : [selected];
    LogQueue = [];
    cases.forEach(function (id) {
        LogQueue = LogQueue.concat(LogsByCase[id]);
    });
    LogQueue.sort(function (a, b) {
        return new Date(a.timestamp) - new Date(b.timestamp);
    });
    reset_log_tokens(cases.length);
}

function start_log_simulation() {
    prepare_log_simulation();
    if (LogTimer) {
        clearInterval(LogTimer);
    }
    IsRunning = true;
    LogTimer = setInterval(step_log_simulation, AnimateDelay);
}

function step_log_simulation() {
    if (LogQueue.length === 0) {
        stop_log_simulation();
        return;
    }
    var ev = LogQueue.shift();
    fire_transition_name(ev.activity);
}

function stop_log_simulation() {
    if (LogTimer) {
        clearInterval(LogTimer);
        LogTimer = null;
    }
    IsRunning = false;
}

function reset_log_tokens(count) {
    Object.keys(Places).forEach(function (k) {
        remove_tokens(Places[k]);
        Places[k].tokens = [];
    });
    var startPlaces = Object.keys(Places).filter(function (pKey) {
        return !Arcs.some(function (a) { return a.to.key === pKey; });
    });
    if (startPlaces.length === 0) return;
    var start = Places[startPlaces[0]];
    for (var i = 0; i < count; i++) {
        AddToken(start);
    }
}

function fire_transition_name(name) {
    var t = Trans[name];
    if (!t) {
        console.log("Transition " + name + " not found");
        return;
    }
    var arcsIn = get_arcsIn(name);
    for (var i = 0; i < arcsIn.length; i++) {
        if (arcsIn[i].from.tokens.length === 0) {
            return;
        }
    }
    arcsIn.forEach(function (a) {
        RemoveToken(a.from);
    });
    var arcsOut = get_arcsOut(name);
    arcsOut.forEach(function (a) {
        AddToken(a.to);
    });
}
