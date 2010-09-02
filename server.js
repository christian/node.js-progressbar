HOST = "127.0.0.1"
PORT = 8124

var http = require('http');
var sys = require('sys');
var formidable = require('./formidable')
var readFile = require("fs").readFile;

var progress_text = "Sending file ..."

// handler for the requrests. 
// serves both static files and dynamic requests

var request_handler = function(req, res) {
  sys.puts(req.url);
  if (req.url.match(/^\/getProgress/)) {
    getProgress(req, res);
    return;
  } else {
    switch (req.url) {
      case '/home':
        loadStaticFile(req, res, "index.html");
        break;
      case '/jquery.js':
        loadStaticFile(req, res, "jquery.js");
        break;
      case '/jquery.iframe-post-form.js':
        loadStaticFile(req, res, "jquery.iframe-post-form.js");
        break;
      case '/upload':
        upload_file(req, res);
        break;
      default:
        show_404(req, res);
        break;
    }
  }
};

// create the server object and make it listen to HOST and PORT
// attaching the request handler
var server = http.createServer()
                 .addListener('request', request_handler)
                 .listen(PORT, HOST);

function loadStaticFile(req, res, file) {
  var headers;
  
  readFile(file, encoding='utf8', function (err, data) {
    if (err) {
      sys.puts("Error loading " + file);
    } else {
      body = data;
      headers = { "Content-Type": 'text/html'
                , "Content-Length": body.length
                };
      sys.puts("static file index.html loaded");
      res.writeHead(200, headers);
      res.end(req.method === "HEAD" ? "" : body);
    }
  });
}

function displayJquery(req, res) {
  var headers;
  
  readFile('jquery.js', encoding='utf8', function (err, data) {
    if (err) {
      sys.puts("Error loading jquery");
    } else {
      body = data;
      headers = { "Content-Type": 'text/javascript'
                , "Content-Length": body.length
                };
      sys.puts("static file " + file + " loaded");
      res.writeHead(200, headers);
      res.end(req.method === "HEAD" ? "" : body);
    }
  });
}

var done = false
function getProgress(req, res) {
  if (!done) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    if (file_path == "") {
      setTimeout(function() {
        sys.puts("sending progress " + progress_text);

        res.write(progress_text);
        res.end();
      }, "1000");
    } else {
      sys.puts("file path " + file_path);

      res.write(file_path);
      res.end();
    }
  }
}

// handle file upload
var file_path = ""
function upload_file(req, res) {
  // parse a file upload 
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    res.writeHead(200, {'content-type': 'text/html'});
    // res.end(files[0].path);
  });
  
  form.addListener('progress', function(bytesReceived, bytesExpected) {
    var progress = (bytesReceived / bytesExpected * 100).toFixed(1);
    var mb = (bytesExpected / 1024 / 1024).toFixed(1);
    
    progress_text = "Uploading "+mb+"mb ("+progress+"%)";
    sys.print("Uploading "+mb+"mb ("+progress+"%)\015");
  });
  form.addListener('file', function(name, file) {
    // filename saved to file.path file.filename file.mime
    file_path = file.path + " " + file.filename
  })
  form.addListener('error', function(error) {
    sys.puts("wrror");
  })
  form.addListener('end', function() {
    done = true
    res.end("File saved at " + file_path);
  })
}

// handle 404's
function show_404(req, res) {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('Not found. Try: http://127.0.0.1:8124/home');
}
