# 冉升车行静态网站

这是一个低成本二手车展示网站，适合免费部署到 Cloudflare Pages。

## 本地预览

在项目目录运行：

```bash
python3 -m http.server 4173
```

然后打开：

```text
http://localhost:4173/
```

## 修改车辆

车辆数据在：

```text
data/cars.json
```

每台车必须有这些字段：

- `id`：车辆唯一编号，只能用英文、数字和短横线，例如 `toyota-camry-2021-001`
- `name`：车辆完整名称
- `brand`：品牌
- `series`：车系
- `type`：车型，例如 `轿车`、`SUV`
- `price`：价格，单位是元
- `year`：年份
- `mileage`：里程，单位是万公里
- `fuel`：能源类型
- `transmission`：变速箱
- `tags`：车辆标签
- `coverImage`：列表封面图
- `images`：详情页图片数组，建议 4 张以上
- `features`：车辆亮点
- `specs`：详情参数
- `description`：车辆说明

## 添加车辆图片

每台车的图片放在：

```text
assets/cars/<车辆id>/
```

示例：

```text
assets/cars/toyota-camry-2021-001/cover.jpg
assets/cars/toyota-camry-2021-001/exterior-1.jpg
assets/cars/toyota-camry-2021-001/interior-1.jpg
assets/cars/toyota-camry-2021-001/detail-1.jpg
```

把真实图片放进去后，记得同步修改 `data/cars.json` 里的 `coverImage` 和 `images` 路径。

## 修改联系方式

联系方式现在写在 `app.js` 顶部的 `CONTACT`：

```js
const CONTACT = {
  phone: '138-0000-8888',
  wechat: 'RanShengCar',
  address: '江苏省苏州市相城区二手车市场示例店铺 A18',
  hours: '周一至周日 09:00-19:00',
  mapUrl: 'https://map.baidu.com/'
};
```

微信二维码图片在：

```text
assets/contact/wechat-qr.svg
```

后续可以替换成真实二维码图片，并在页面里保持同一路径，或者修改 `app.js` 中的图片路径。

## 免费部署到 Cloudflare Pages

1. 把整个目录上传到 GitHub 仓库。
2. 登录 Cloudflare。
3. 进入 Workers & Pages。
4. 创建 Pages 项目。
5. 连接 GitHub 仓库。
6. 构建命令留空。
7. 输出目录留空或填写 `/`。
8. 部署。

以后更新车辆时：

1. 修改 `data/cars.json`。
2. 替换或新增 `assets/cars/<车辆id>/` 里的图片。
3. 提交并推送到 GitHub。
4. Cloudflare Pages 会自动重新部署。

## 验证

运行自动化测试：

```bash
node --test tests/app.test.mjs
```

手动检查：

- 首页能看到推荐车辆。
- 车辆列表筛选和排序正常。
- 点击车辆能进入详情页。
- 详情页缩略图能切换大图。
- 公司介绍和联系方式页面能打开。
- 手机宽度下文字和按钮没有重叠。
