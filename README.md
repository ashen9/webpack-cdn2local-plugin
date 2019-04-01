# HOW TO USE

## INSTALL
npm install webpack-cdn2local-plugin -S

## Quick Start
```
1.   add 'cdn="JSZXtrue"' in the script you need to Pull down from remote CDN or other location
```

EXAMPLE:
 <script src="//at.alicdn.com/t/font_580979_7zusmqtgkt7.js" cdn="JSZXtrue"></script>
```
```
2.   update your webpack.config.js in the production mode
```

EXAMPLE:
    const Cdn2Local = require('webpack-cdn2local-plugin');
    plugins:[
        ...,
        new Cdn2Local()
     ]
```

## Special Thanks
[HankWangv5](https://github.com/HankWangv5).

[ZhangDongliang123](https://github.com/ZhangDongliang123).

[YueQuanXiaoChe](https://github.com/YueQuanXiaoChe).

[YuMay2009](https://github.com/YuMay2009).
