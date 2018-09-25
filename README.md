
解析apk文件获取相关信息，正在完善中
## Installation

## Syntax
```
const PkgReader = require("app-reader")
const reader = new PkgReader("./apk/QQ.apk", "apk", {
  searchResource: true,
  iconType: 'base64',
  iconPath: '../output/icon.png',
});

reader.parse((err, pkgInfo) => {
  if (err) {
    console.log(err);
  }
  console.log(pkgInfo);
});
```