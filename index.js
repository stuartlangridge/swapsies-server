var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 3000));


function MemoryCodeHandler() {
    var codes = {};
    this.registerForCode = function(identifier, sendfn) {
        var code;
        while (true) {
            code = Math.round(Math.random() * 8999) + 1000;
            if (!codes[code]) { break; }
        }
        codes[code] = {sendfn: sendfn, identifier: identifier};
        return code;
    };

    this.deregisterForCode = function(identifier, code) {
        if (codes[code] && codes[code].identifier == identifier) {
            delete codes[code];
        }
    };

    this.callCode = function(code, identifier) {
        if (codes[code]) {
            codes[code].sendfn("Pair:" + identifier);
            return codes[code].identifier;
        }
        return false;
    };
}

var mch = new MemoryCodeHandler();

app.get('/', function(req, res) {
    res.send('I don\'t know much, but I know I\'m the swapsies server. And that may be all I need to know.');
});

app.post('/getcode', function(req, res) {
    if (!req.query.id) {
        res.send({status: "noid"});
        res.end();
        return;
    }
    res.set({
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    function sendit(data) { res.write(data + "\n"); }
    var counter = 20;
    var iv = setInterval(function() {
        sendit("Seconds:" + counter);
        counter -= 1;
        if (counter === 0) {
            clearInterval(iv);
            mch.deregisterForCode(req.query.id, code);
            res.end();
        }
    }, 1000);
    var code = mch.registerForCode(req.query.id, sendit);
    sendit("Code:" + code);
});

app.post('/sendcode', function(req, res) {
    if (!req.query.id) {
        res.send({status: "noid"});
        res.end();
        return;
    }
    if (!req.query.code) {
        res.send({status: "nocode"});
        res.end();
        return;
    }
    var result = mch.callCode(req.query.code, req.query.id);
    res.send(result ? {status: "ok", "identifier": result} : {status: "badcode"});
});

var server = app.listen(app.get('port'), function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Swapsies server listening at http://%s:%s', host, port);
});
