// this function overrides the one from the nouhardidy:ssl package
SSL = function(ca, key, cert, port) {
	var httpProxy = require('http-proxy'),
		fs        = require('fs'),
		proxy     = '';

	if (!port) {
		port = 443;
	}

	proxy = httpProxy.createServer({
		target: { 
			host : 'localhost',
			port : 3000
		},
		ssl: {
			ca 	 : fs.readFileSync(ca,  'utf8'),
			key  : fs.readFileSync(key,  'utf8'),
			cert : fs.readFileSync(cert, 'utf8')
		},
		ws   : true,
		xfwd : true
	}).listen(port);

	// we silently fail these
	proxy.on("error", function(err) {
		console.log("HTTP-PROXY-SSL ERROR: " + err);
		return;
	});
};

if(Meteor.settings && Meteor.settings.private && Meteor.settings.private.dazl.ssl) {
	SSL(Meteor.settings.private.dazl.ca,Meteor.settings.private.dazl.key,Meteor.settings.private.dazl.crt, 10000);
}