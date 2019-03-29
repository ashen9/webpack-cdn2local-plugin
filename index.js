var cheerio = require('cheerio');
let url = require('url');
let http = require('http');


function webpack_cdn2local_plugin(options) {
  this.cdnUrlList = []
}

webpack_cdn2local_plugin.prototype.apply = function(compiler) {
  let that = this;
  compiler.plugin('emit', function(compilation,callback) {
    let text = compilation.assets['index.html'].source()
      $ = cheerio.load(text);
    $('[cdn = JSZXtrue]').each((e,i) => {
      let cdnUrl = ''
      let localPath = ''
      if($(i).prop("tagName") === 'SCRIPT') {
        cdnUrl = $(i).attr('src')
      }else if ($(i).prop("tagName") === 'LINK') {
        cdnUrl = $(i).attr('href')
      }
      localPath = url.parse(cdnUrl).pathname.split('/').pop();
      that.cdnUrlList.push({cdnUrl, localPath})
      text = text.toString().replace(cdnUrl, '/cdn/' + localPath);
    })
    compilation.assets['index.html'] = toAsset(text);
    Promise.all(that.cdnUrlList.map(function (cdnUrl) {
        return download(cdnUrl.cdnUrl)
      })).then(res => {
        res.forEach((data,i) => {
          compilation.assets[`cdn/${that.cdnUrlList[i].localPath}`] = toAsset(data);
        })
        callback()
      })
  });
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

function download(url) {
  return new Promise(function (resolve, reject) {
    http.get('http:' + url, function(resp) {
      if (resp.statusCode === 200) {
        resp.on('data', function (data) {
          resolve(data)
        })
      }
      else {
        reject(new Error('[webpack-example-plugin] Unable to download the image'));
      }
    });
  })
}


module.exports = webpack_cdn2local_plugin;
