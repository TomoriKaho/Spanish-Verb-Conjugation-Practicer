# 西班牙语动词变位练习APP

一款基于 uni-app 开发的西班牙语动词变位学习应用，帮助学生系统化练习和掌握西班牙语动词变位。

## 项目概述

本项目旨在解决西班牙语学习者在动词变位练习上的困境。西班牙语存在大量的动词变位规则，包括：
- 6个人称（我、你、他/您、我们、你们、他们/诸位）
- 多个时态（现在时、过去时、将来时等）
- 多种语式（陈述式、命令式、虚拟式、条件式）
- 三种变位规则及大量不规则动词

通过本应用，学习者可以：
- 每天定时定量进行变位练习
- 通过多种题型巩固记忆（填空、选择、变位、句子补充）
- 追踪学习进度和掌握情况
- 参与排行榜和打卡活动保持学习动力

## 项目结构

```
Spanish-Verb-Conjugation-Practicer/
├── pages/                      # 前端页面
│   ├── index/                 # 首页
│   │   └── index.vue
│   ├── login/                 # 登录注册页
│   │   └── login.vue
│   ├── practice/              # 练习页面
│   │   └── practice.vue
│   ├── statistics/            # 学习统计页
│   │   └── statistics.vue
│   ├── leaderboard/           # 排行榜页
│   │   └── leaderboard.vue
│   └── profile/               # 个人中心页
│       └── profile.vue
├── server/                     # 后端服务
│   ├── database/              # 数据库
│   │   └── db.js             # 数据库初始化和连接
│   ├── models/                # 数据模型
│   │   ├── User.js           # 用户模型
│   │   ├── Verb.js           # 动词模型
│   │   ├── Conjugation.js    # 变位模型
│   │   ├── PracticeRecord.js # 练习记录模型
│   │   └── CheckIn.js        # 打卡模型
│   ├── routes/                # 路由
│   │   ├── user.js           # 用户相关路由
│   │   ├── verb.js           # 动词相关路由
│   │   ├── exercise.js       # 练习相关路由
│   │   ├── record.js         # 记录相关路由
│   │   ├── checkin.js        # 打卡相关路由
│   │   └── leaderboard.js    # 排行榜相关路由
│   ├── middleware/            # 中间件
│   │   └── auth.js           # 认证中间件
│   ├── data/                  # 数据
│   │   └── initData.js       # 初始化示例数据
│   └── index.js              # 服务器入口
├── utils/                      # 工具类
│   ├── api.js                # API接口封装
│   └── common.js             # 通用工具函数
├── static/                     # 静态资源
│   └── css/
│       └── common.css        # 通用样式
├── App.vue                    # 应用主组件
├── main.js                    # 应用入口
├── pages.json                 # 页面配置
├── manifest.json              # 应用配置
├── package.json               # 项目依赖
└── README.md                  # 项目说明

database.db                    # SQLite 数据库文件（运行后自动生成）
```

## 模块说明

### 前端模块

#### 1. 页面模块 (`pages/`)

- **首页 (`index/`)**
  - 展示用户学习概况
  - 显示今日练习统计、连续打卡天数
  - 提供快速开始练习入口
  - 每日打卡功能

- **登录注册页 (`login/`)**
  - 用户登录和注册
  - 支持学生用户（免费）和社会用户（付费）注册
  - 可选填写学校、入学年份等信息

- **练习页面 (`practice/`)**
  - 支持多种练习类型：选择题、填空题、变位练习
  - 可自定义题目数量（5-30题）
  - 实时反馈答题结果
  - 显示练习进度和正确率
  - 练习完成后展示统计结果

- **学习统计页 (`statistics/`)**
  - 展示总练习题数、正确率、练习天数
  - 显示已掌握的动词列表
  - 最近练习记录
  - 可视化学习进度

- **排行榜页 (`leaderboard/`)**
  - 周榜、月榜、总榜切换
  - 显示连续打卡天数和练习题数
  - 激励用户持续学习

- **个人中心页 (`profile/`)**
  - 查看个人信息
  - 订阅状态管理（社会用户）
  - 退出登录

#### 2. 工具模块 (`utils/`)

- **API封装 (`api.js`)**
  - 统一管理所有API请求
  - 自动添加认证token
  - 统一错误处理

- **通用工具 (`common.js`)**
  - 日期格式化
  - 提示消息封装
  - 数据存储工具
  - 数组打乱等辅助函数

### 后端模块

#### 1. 数据库模块 (`server/database/`)

使用 SQLite 数据库，包含以下数据表：

- **users** - 用户表
  - 存储用户基本信息、学校、入学年份
  - 用户类型（学生/社会人士）
  - 订阅状态

- **verbs** - 动词表
  - 动词原形、中文释义
  - 变位类型（第一、第二、第三变位）
  - 是否不规则
  - 所属课程和教材册数

- **conjugations** - 变位表
  - 每个动词在不同时态、语式、人称下的变位形式
  - 标记不规则变位

- **practice_records** - 练习记录表
  - 记录每次练习的详细信息
  - 答题是否正确
  - 用于统计和分析

- **check_ins** - 打卡记录表
  - 每日打卡记录
  - 当日练习统计

- **user_progress** - 用户进度表
  - 每个动词的掌握程度（1-5级）
  - 练习次数和正确次数
  - 用于智能推荐薄弱动词

#### 2. 模型模块 (`server/models/`)

- **User.js** - 用户模型
  - 用户注册、登录验证
  - 密码加密（bcrypt）
  - 订阅状态管理

- **Verb.js** - 动词模型
  - 动词查询（按课程、变位类型）
  - 随机获取动词
  - 获取用户薄弱动词

- **Conjugation.js** - 变位模型
  - 查询动词的所有变位
  - 获取特定时态和人称的变位

- **PracticeRecord.js** - 练习记录模型
  - 记录练习结果
  - 自动更新用户进度和掌握度
  - 统计分析

- **CheckIn.js** - 打卡模型
  - 每日打卡
  - 计算连续打卡天数
  - 排行榜数据

#### 3. 路由模块 (`server/routes/`)

- **user.js** - 用户相关
  - POST `/api/user/register` - 用户注册
  - POST `/api/user/login` - 用户登录
  - GET `/api/user/info` - 获取用户信息
  - PUT `/api/user/profile` - 更新用户信息

- **verb.js** - 动词相关
  - GET `/api/verb/list` - 获取动词列表
  - GET `/api/verb/:id` - 获取动词详情

- **exercise.js** - 练习相关
  - POST `/api/exercise/generate` - 生成练习题
  - POST `/api/exercise/submit` - 提交答案

- **record.js** - 记录相关
  - GET `/api/record/list` - 获取练习记录
  - GET `/api/record/statistics` - 获取统计数据

- **checkin.js** - 打卡相关
  - POST `/api/checkin` - 每日打卡
  - GET `/api/checkin/history` - 获取打卡历史

- **leaderboard.js** - 排行榜
  - GET `/api/leaderboard/:type` - 获取排行榜（week/month/all）

#### 4. 中间件模块 (`server/middleware/`)

- **auth.js** - 认证中间件
  - JWT token 验证
  - 保护需要登录的API接口

#### 5. 数据模块 (`server/data/`)

- **initData.js** - 初始化示例数据
  - 预置第一、二课的动词
  - 自动生成现在时、过去时、将来时变位
  - 支持规则动词和常见不规则动词

## 模块间关系

```
┌─────────────────────────────────────────────────────────┐
│                        前端 (uni-app)                    │
├─────────────────────────────────────────────────────────┤
│  Pages (页面层)                                          │
│  ├─ index.vue          首页                              │
│  ├─ login.vue          登录注册                          │
│  ├─ practice.vue       练习                              │
│  ├─ statistics.vue     统计                              │
│  ├─ leaderboard.vue    排行榜                            │
│  └─ profile.vue        个人中心                          │
├─────────────────────────────────────────────────────────┤
│  Utils (工具层)                                          │
│  ├─ api.js            API接口封装                        │
│  └─ common.js         通用工具函数                       │
└────────────┬────────────────────────────────────────────┘
             │ HTTP Requests (RESTful API)
             ↓
┌─────────────────────────────────────────────────────────┐
│                    后端 (Express.js)                     │
├─────────────────────────────────────────────────────────┤
│  Routes (路由层)                                         │
│  ├─ user.js           用户管理                           │
│  ├─ verb.js           动词管理                           │
│  ├─ exercise.js       练习管理                           │
│  ├─ record.js         记录管理                           │
│  ├─ checkin.js        打卡管理                           │
│  └─ leaderboard.js    排行榜                             │
├─────────────────────────────────────────────────────────┤
│  Middleware (中间件层)                                   │
│  └─ auth.js           JWT认证                            │
├─────────────────────────────────────────────────────────┤
│  Models (业务逻辑层)                                     │
│  ├─ User.js           用户业务逻辑                       │
│  ├─ Verb.js           动词业务逻辑                       │
│  ├─ Conjugation.js    变位业务逻辑                       │
│  ├─ PracticeRecord.js 练习记录业务逻辑                   │
│  └─ CheckIn.js        打卡业务逻辑                       │
├─────────────────────────────────────────────────────────┤
│  Database (数据层)                                       │
│  └─ db.js             SQLite数据库                       │
└─────────────────────────────────────────────────────────┘
```

### 数据流向

1. **用户操作** → 前端页面触发事件
2. **API调用** → utils/api.js 发送HTTP请求
3. **路由处理** → server/routes/*.js 接收请求
4. **中间件验证** → server/middleware/auth.js 验证token
5. **业务处理** → server/models/*.js 执行业务逻辑
6. **数据操作** → server/database/db.js 操作SQLite数据库
7. **返回结果** → 层层返回至前端页面
8. **页面更新** → 前端页面渲染新数据

## 安装和运行

### 环境要求

- Node.js 14+
- HBuilderX（用于打包APK）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/kuiningzzzz/Spanish-Verb-Conjugation-Practicer.git
cd Spanish-Verb-Conjugation-Practicer
```

2. **安装依赖**
```bash
npm install
```

3. **启动后端服务**
```bash
npm start
# 或
npm run dev
```
后端服务将运行在 `http://localhost:3000`

4. **使用 HBuilderX 打开项目**
   - 打开 HBuilderX
   - 文件 → 打开目录 → 选择本项目文件夹
   - 运行 → 运行到手机或模拟器 → 运行到浏览器（开发测试）

5. **打包APK**
   - 在 HBuilderX 中：发行 → 原生App-云打包
   - 选择 Android 平台
   - 填写应用信息
   - 使用云端证书或自有证书
   - 点击打包

### 开发调试

- **前端开发**: 使用 HBuilderX 内置的浏览器或手机模拟器
- **后端开发**: 修改 `server/` 目录下的文件后，重启 `npm start`
- **API测试**: 可使用 Postman 或其他工具测试 `http://localhost:3000/api/*` 接口

### 配置说明

1. **修改API地址**
   - 打包前需将 `utils/api.js` 中的 `BASE_URL` 改为实际服务器地址
   ```javascript
   const BASE_URL = 'https://your-server.com/api'  // 生产环境
   ```

2. **修改JWT密钥**
   - 生产环境请修改 `server/middleware/auth.js` 中的 `JWT_SECRET`
   ```javascript
   const JWT_SECRET = 'your-production-secret-key'
   ```

## 功能特点

### 已实现功能

✅ 用户注册登录系统  
✅ 学生用户免费使用  
✅ 多种练习模式（选择、填空、变位）  
✅ 实时答题反馈  
✅ 学习进度追踪  
✅ 动词掌握度评级（1-5级）  
✅ 每日打卡系统  
✅ 连续打卡统计  
✅ 周榜/月榜/总榜排行  
✅ 学习统计可视化  
✅ 练习记录查询  
✅ 第一、二课示例动词数据  

### 待扩展功能

🔲 句子补充完整题型  
🔲 更多课程动词数据（第3-16课）  
🔲 四八级词汇库  
🔲 单词语音播放  
🔲 社交分享功能  
🔲 小班学习组  
🔲 付费订阅支付集成  
🔲 商务、旅游等场景词汇  
🔲 葡萄牙语、意大利语、法语扩展  

## 数据模型

### 用户掌握度计算规则

系统会根据用户的练习情况自动计算每个动词的掌握度（1-5级）：

- **1级**: 刚开始练习或正确率低于60%
- **2级**: 正确率 ≥ 60%
- **3级**: 正确率 ≥ 70% 且练习次数 ≥ 5次
- **4级**: 正确率 ≥ 80% 且练习次数 ≥ 8次
- **5级**: 正确率 ≥ 90% 且练习次数 ≥ 10次

### 变位类型

- **第一变位**: -ar结尾动词（如 hablar）
- **第二变位**: -er结尾动词（如 comer）
- **第三变位**: -ir结尾动词（如 vivir）

### 时态和语式

当前支持的时态：
- 现在时 (陈述式)
- 简单过去时 (陈述式)
- 将来时 (陈述式)

可扩展：
- 现在完成时、过去完成时
- 命令式
- 虚拟式（现在时、过去时）
- 条件式

## 技术栈

- **前端框架**: uni-app (Vue 2/3)
- **后端框架**: Express.js
- **数据库**: SQLite (better-sqlite3)
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **跨域**: cors

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题或建议，请通过 GitHub Issues 联系。