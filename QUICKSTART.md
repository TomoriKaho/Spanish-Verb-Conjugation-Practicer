# 快速启动指南

## 第一步：安装依赖

在项目根目录下运行：

```powershell
npm install
```

这将安装所有必要的后端依赖包。

## 第二步：启动后端服务

```powershell
npm start
```

成功启动后，你会看到：
```
数据库初始化完成
示例数据初始化完成，共插入 20 个动词
服务器运行在 http://localhost:3000
API文档: http://localhost:3000/api/health
```

**注意**: 首次启动会自动创建数据库文件 `database.db` 并初始化示例数据。

## 第三步：使用 HBuilderX 运行前端

### 方法1：浏览器预览（推荐用于开发测试）

1. 打开 HBuilderX
2. 文件 → 打开目录 → 选择本项目文件夹
3. 运行 → 运行到浏览器 → Chrome（或其他浏览器）
4. 浏览器会自动打开，可以开始测试应用

### 方法2：真机调试

1. 手机开启USB调试模式
2. 连接电脑
3. HBuilderX 中：运行 → 运行到手机或模拟器 → 选择你的设备
4. 等待编译和安装

### 方法3：微信小程序（可选）

1. 先在 `manifest.json` 中填写微信小程序 appid
2. 运行 → 运行到小程序模拟器 → 微信开发者工具
3. 确保已安装微信开发者工具

## 第四步：测试应用

### 注册测试账号

1. 打开应用，点击"注册"
2. 输入用户名和密码
3. 选择"学生"类型（免费使用）
4. 点击注册

### 开始练习

1. 登录后进入首页
2. 点击"开始练习"按钮
3. 选择练习类型（选择题、填空题、变位练习）
4. 设置题目数量（5-30题）
5. 开始答题

### 查看统计

1. 底部导航栏点击"统计"
2. 查看学习数据和掌握的动词
3. 查看最近练习记录

### 排行榜和打卡

1. 首页点击"每日打卡"
2. 查看连续打卡天数
3. 访问排行榜查看排名

## 常见问题

### Q: 前端无法连接后端？

**A**: 检查以下几点：
1. 后端服务是否正常运行（访问 http://localhost:3000/api/health 应返回 "ok"）
2. 如果使用真机调试，需要修改 `utils/api.js` 中的 `BASE_URL` 为电脑的局域网IP
   ```javascript
   const BASE_URL = 'http://192.168.1.xxx:3000/api'  // 替换为你的电脑IP
   ```
3. 确保手机和电脑在同一网络

### Q: 启动后端时报错？

**A**: 可能的原因：
1. 端口3000被占用 → 修改 `server/index.js` 中的端口号
2. 依赖未安装 → 重新运行 `npm install`
3. Node.js版本过低 → 升级到 Node.js 14+

### Q: HBuilderX 打开项目后看不到页面？

**A**: 
1. 确保打开的是项目根目录
2. 检查 `pages.json` 文件是否正确
3. 重启 HBuilderX

### Q: 数据库在哪里？

**A**: 项目根目录下的 `database.db` 文件，可以使用 SQLite 客户端工具打开查看。

## 打包为 APK

### 准备工作

1. 在 HBuilderX 中打开项目
2. 修改 `manifest.json` 中的应用信息：
   - appid（从 DCloud 获取）
   - 应用名称
   - 应用图标
   - 版本号

3. 修改 API 地址为生产环境：
   ```javascript
   // utils/api.js
   const BASE_URL = 'https://your-production-server.com/api'
   ```

### 云打包步骤

1. HBuilderX → 发行 → 原生App-云打包
2. 选择 Android 平台
3. 填写应用信息和证书信息
4. 点击"打包"
5. 等待打包完成，下载 APK

### 本地打包（高级）

需要配置 Android Studio 和相关环境，建议使用云打包。

## 部署后端到服务器

### 使用 Node.js 服务器

1. 上传项目文件到服务器
2. 安装依赖：`npm install --production`
3. 使用 PM2 运行：
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name spanish-verb-app
   pm2 save
   pm2 startup
   ```

### 使用 Docker（推荐）

创建 `Dockerfile`:
```dockerfile
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server/index.js"]
```

构建和运行：
```bash
docker build -t spanish-verb-app .
docker run -d -p 3000:3000 --name spanish-verb-app spanish-verb-app
```

## 添加更多动词数据

编辑 `server/data/initData.js`，参考现有格式添加新的动词：

```javascript
const lesson3Verbs = [
  { infinitive: 'cantar', meaning: '唱歌', conjugationType: 1, lessonNumber: 3 },
  // 添加更多...
]
```

重启服务器或删除 `database.db` 后重新启动以重新初始化数据。

## 技术支持

如遇到问题，请查看：
1. README.md 文件的详细说明
2. GitHub Issues
3. 项目代码注释

祝您使用愉快！
