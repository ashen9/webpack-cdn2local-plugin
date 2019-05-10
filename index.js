var cheerio = require('cheerio');
let url = require('url');
let http = require('http');


function webpack_cdn2local_plugin(options) {
	this.cdnUrlList = [];
	this.prefixPath = options.prefixPath || '/';
}

webpack_cdn2local_plugin.prototype.apply = function(compiler) {
	let that = this;
	var emit = function emit(compilation, callback) {
		let text = compilation.assets['index.html'].source()
		$ = cheerio.load(text);
		$('[cdn2local]').each((e,i) => {
			let cdnUrl = ''
			let localPath = ''
			if($(i).prop("tagName") === 'SCRIPT') {
				cdnUrl = $(i).attr('src')
			}else if ($(i).prop("tagName") === 'LINK') {
				cdnUrl = $(i).attr('href')
			}
			localPath = url.parse(cdnUrl).pathname.split('/').pop();
			that.cdnUrlList.push({cdnUrl, localPath})
			text = text.toString().replace(cdnUrl, `${that.prefixPath}cdn/`  + localPath);
		})
		console.log(`您的字库完整路径前缀是：${that.prefixPath}cdn/`);
		compilation.assets['index.html'] = toAsset(text);
		Promise.all(that.cdnUrlList.map(function (cdnUrl) {
			return download(cdnUrl.cdnUrl)
		})).then(res => {
			res.forEach((data,i) => {
				compilation.assets[`cdn/${that.cdnUrlList[i].localPath}`] = toAsset(data);
			})
			callback()
		})
	};

	if (compiler.hooks) {
		var plugin = { name: 'Cdn2LocalPlugin' };
		compiler.hooks.emit.tapAsync(plugin, emit);
	} else {
		compiler.plugin('emit', emit);
	}
};

function toAsset(resp) {
	return {
		source: function() {
			return resp;
		},
		size: function() {
			return resp.length;
		}
	}
}

function download(url, compilation, cdnUrl) {
	return new Promise(function (resolve, reject) {
		http.get('http:' + url, function(resp) {
			if (resp.statusCode === 200) {
				let str = '';
				resp.on('data', function (data) {
					str += data.toString();
				})
				resp.on('end', function (data) {
					resolve(str)
				})
			}
			else {
				reject(new Error('[webpack-example-plugin] Unable to download the image'));
			}
		});
	})
}

module.exports = webpack_cdn2local_plugin;
