# 西班牙语动词变位练习系统

> 一款基于 uni-app + Express.js + SQLite + AI 的智能西班牙语动词变位学习应用

## 📋 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [系统架构](#系统架构)
- [核心功能模块](#核心功能模块)
- [数据库设计](#数据库设计)
- [数据流转机制](#数据流转机制)
- [AI智能生成系统](#ai智能生成系统)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [API文档](#api文档)

---

## 项目简介

本项目是一个专为西班牙语学习者设计的动词变位练习系统，融合了传统练习模式与 AI 智能生成技术，提供多样化的练习题型和个性化学习路径。系统通过三层数据库架构、智能题库管理和定时清理机制，实现高效的学习体验。

### 核心特色

- 🎯 **四种题型**：选择题、填空题、变位题、例句填空
- 🤖 **AI双模验证**：生成模型 + 验证模型确保题目质量
- 📊 **智能题库**：公共题库 + 私人题库，置信度动态调整
- 🔄 **自动清理**：定时清理30天以上低质题目
- 📈 **学习追踪**：打卡系统、学习进度、错题本、收藏夹
- 🏆 **排行榜**：多维度排名激励学习

---

## 技术栈

### 前端
- **uni-app** (Vue 2) - 跨平台应用框架
- **Vue.js** - 渐进式 JavaScript 框架
- **uni-ui** - UI 组件库

### 后端
- **Node.js** + **Express.js** - 服务端框架
- **better-sqlite3** - 高性能嵌入式数据库
- **JWT** - 用户认证
- **bcryptjs** - 密码加密
- **node-cron** - 定时任务调度

### AI 服务
- **DeepSeek API** - AI 题目生成与验证

---

## 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层 (uni-app)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  首页    │  │  练习页  │  │ 单词本   │  │  个人中心 │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                        ↓ API 请求                            │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                    中间件层 (Express)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 路由层   │  │ 认证中间件│  │ 错误处理 │  │ CORS     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                      服务层 (Services)                        │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ ExerciseGenerator│  │ QuestionValidator│                │
│  │  (题目生成器)     │  │   (题目验证器)    │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  DeepSeek Service│  │  Scheduler Service│               │
│  │   (AI服务)        │  │   (定时任务)      │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                      模型层 (Models)                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ User    │ │ Verb    │ │Question │ │CheckIn  │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │Practice │ │Favorite │ │WrongVerb│ │Conjugate│          │
│  │ Record  │ │ Verb    │ │         │ │         │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                   数据库层 (SQLite × 3)                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ user_data.db │ │vocabulary.db │ │questions.db  │        │
│  │  (用户数据)   │ │  (词库数据)   │ │  (题库数据)   │        │
│  │              │ │              │ │              │        │
│  │ • users      │ │ • verbs      │ │ • public_    │        │
│  │ • practice_  │ │ • conjugations│ │   questions  │        │
│  │   records    │ │              │ │              │        │
│  │ • check_ins  │ │              │ │              │        │
│  │ • favorite_  │ │              │ │              │        │
│  │   verbs      │ │              │ │              │        │
│  │ • wrong_verbs│ │              │ │              │        │
│  │ • private_   │ │              │ │              │        │
│  │   questions  │ │              │ │              │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 核心功能模块

### 1. 用户认证模块 (User Module)

**位置**: `server/models/User.js` + `server/routes/user.js`

**功能**:
- 用户注册与登录（JWT Token 认证）
- 用户信息管理（学校、入学年份、订阅状态）
- 密码加密存储（bcrypt）

**数据流**:
```
前端登录表单 → /api/user/login → User.authenticate() 
→ 验证密码 → 生成 JWT Token → 返回 userInfo + token
→ 前端存储 token → 后续请求携带 Authorization header
```

---

### 2. 练习生成模块 (Exercise Generator)

**位置**: `server/services/exerciseGenerator.js`

**核心机制**: 混合生成策略

#### 2.1 题型分类

| 题型 | 生成方式 | 来源 |
|------|---------|------|
| **选择题** (choice) | 固定算法 | 数据库动词表 |
| **变位题** (conjugate) | 固定算法 | 数据库变位表 |
| **填空题** (fill) | 85%题库 + 15%AI | 公共/私人题库 + DeepSeek |
| **例句填空** (sentence) | 85%题库 + 15%AI | 公共/私人题库 + DeepSeek |

#### 2.2 生成流程

```
用户请求练习
    ↓
判断题型
    ↓
┌──────────────┬──────────────┐
│ 选择题/变位题 │ 填空/例句填空 │
└──────────────┴──────────────┘
        ↓               ↓
   固定算法生成      随机决策(85/15)
                       ↓
              ┌────────┴────────┐
              │                 │
          题库获取           AI生成
              │                 │
              │         ┌───────┴────────┐
              │         │ 数据完整性检查  │
              │         │ (validateAIData)│
              │         └───────┬────────┘
              │                 │
              │         ┌───────┴────────┐
              │         │ AI质量验证      │
              │         │ (Validator)    │
              │         └───────┬────────┘
              │                 │
              │            通过?  失败
              │             ↓      ↓
              │         保存题库  重试(最多3次)
              │             ↓      ↓
              │         返回题目  降级算法
              │                   ↓
              └───────────────────┘
                      ↓
                  返回题目
```

#### 2.3 AI生成重试机制

```javascript
for (let attempt = 1; attempt <= 3; attempt++) {
  // 1. 调用 DeepSeek 生成题目
  aiResult = await DeepSeekService.generate()
  
  // 2. 数据完整性检查
  if (!validateAIResultData(aiResult)) {
    continue // 重试
  }
  
  // 3. AI 质量验证
  validation = await QuestionValidator.validate(aiResult)
  
  if (validation.passed) {
    // 保存到公共题库（置信度=50）
    Question.addToPublic(aiResult)
    break
  }
  
  // 延迟后重试
  await sleep(500)
}

// 3次失败后降级到传统算法
if (!validation.passed) {
  return generateTraditionalExercise()
}
```

---

### 3. AI 智能生成系统

#### 3.1 DeepSeek 生成服务

**位置**: `server/services/deepseek.js`

**职责**: 调用 DeepSeek API 生成高质量题目

**生成 Prompt 示例** (例句填空):
```
请为西班牙语动词 "estar" (意思: 是/在) 生成一道例句填空题。

要求:
1. 句子必须使用 陈述式 简单过去时 的 第一人称单数 形式
2. 正确答案必须是: estuve
3. 句子的语境要确保只有这个变位形式是唯一正确的答案
4. 句子要自然、地道，符合日常使用场景
5. 难度适中，适合初学者

返回格式:
{
  "sentence": "Ayer _____ en la biblioteca.",
  "answer": "estuve",
  "translation": "昨天我在图书馆。",
  "hint": "简单过去时第一人称"
}
```

#### 3.2 题目验证服务

**位置**: `server/services/questionValidator.js`

**职责**: 第二个 AI 实例验证题目质量

**验证维度**:
1. ✅ 语法正确性
2. ✅ 答案唯一性
3. ✅ 句子自然度
4. ✅ 翻译准确性
5. ✅ 提示合理性（不暴露答案）

**验证流程**:
```
生成的题目
    ↓
QuestionValidator.quickValidate()
    ↓
调用 DeepSeek API (temperature=0.3, 降低随机性)
    ↓
返回验证结果:
{
  "isValid": true/false,
  "hasUniqueAnswer": true/false,
  "reason": "验证失败原因"
}
    ↓
passed = isValid && hasUniqueAnswer
```

---

### 4. 题库管理模块 (Question Bank)

**位置**: `server/models/Question.js`

#### 4.1 双题库架构

| 题库类型 | 数据库 | 表名 | 用途 |
|---------|--------|------|------|
| **公共题库** | questions.db | public_questions | AI生成的共享题目 |
| **私人题库** | user_data.db | private_questions | 用户收藏的题目 |

#### 4.2 置信度系统

```javascript
// 初始置信度
新生成题目: confidenceScore = 50

// 动态调整
用户答对: confidenceScore += 5 (最高100)
用户答错: confidenceScore -= 3 (最低0)

// 题库清理
定时任务: 删除 created_at > 30天 的题目
同时删除: 关联的 user_question_records
```

#### 4.3 题目获取策略

```javascript
// 从题库获取题目
getRandomFromPublic({
  questionType,    // 'fill' 或 'sentence'
  tenses,          // 时态过滤
  conjugationTypes,// 变位类型过滤
  includeIrregular,// 是否包含不规则动词
  limit: 1
})

// 优先级: 高置信度 > 新题目 > 随机
ORDER BY confidence_score DESC, created_at DESC
```

---

### 5. 学习追踪模块

#### 5.1 练习记录 (PracticeRecord)

**位置**: `server/models/PracticeRecord.js`

**记录内容**:
```javascript
{
  user_id,          // 用户ID
  verb_id,          // 动词ID
  exercise_type,    // 题型
  is_correct,       // 是否正确
  answer,           // 用户答案
  correct_answer,   // 正确答案
  tense, mood, person, // 变位信息
  created_at        // 答题时间
}
```

**统计功能**:
- 今日练习数 / 答对数
- 总练习数 / 总答对数
- 已掌握动词数量 (mastery_level >= 5)
- 按时态/题型分组统计

#### 5.2 打卡系统 (CheckIn)

**位置**: `server/models/CheckIn.js`

**打卡逻辑**:
```javascript
// 前端验证
if (todayStats.total === 0) {
  showToast('你今天还没练习哦！')
  return
}

// 后端记录
CheckIn.create({
  user_id,
  check_in_date: '2025-11-20',
  exercise_count: todayStats.total,
  correct_count: todayStats.correct
})

// 连续打卡计算
streakDays = 连续日期差 + 1
```

#### 5.3 收藏与错题

**收藏单词** (FavoriteVerb):
```
用户点击收藏 → /api/vocabulary/favorite/add
→ FavoriteVerb.add(user_id, verb_id)
→ INSERT INTO favorite_verbs
```

**错题本** (WrongVerb):
```
用户答错 → 自动添加到错题本
→ WrongVerb.add(user_id, verb_id)
→ wrong_count++, last_wrong_at = NOW()
```

**题目收藏**:
```
用户点击📌 → /api/question/favorite
→ 复制到 private_questions (user_id, question_data)
→ 用户私人题库 +1
```

---

### 6. 定时任务模块 (Scheduler)

**位置**: `server/services/scheduler.js`

**任务调度**:
```javascript
// 每天凌晨 00:00 执行
cron.schedule('0 0 * * *', () => {
  cleanOldQuestions()
}, {
  timezone: 'Asia/Shanghai'
})
```

**清理逻辑**:
```sql
-- 1. 删除答题记录
DELETE FROM user_question_records
WHERE question_id IN (
  SELECT id FROM public_questions
  WHERE datetime(created_at) < datetime('now', '-30 days')
)

-- 2. 删除题目本身
DELETE FROM public_questions
WHERE datetime(created_at) < datetime('now', '-30 days')
```

---

## 数据库设计

### 三库分离架构

```
user_data.db (88 KB)
├── users                    # 用户表
├── practice_records         # 练习记录
├── check_ins               # 打卡记录
├── user_progress           # 学习进度
├── favorite_verbs          # 收藏单词
├── wrong_verbs             # 错题本
├── private_questions       # 私人题库
└── user_question_records   # 答题记录

vocabulary.db (60 KB)
├── verbs                   # 动词表
└── conjugations            # 变位表

questions.db (28 KB)
└── public_questions        # 公共题库
```

### 关键表结构

#### users (用户表)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,      -- bcrypt加密
  email TEXT,
  school TEXT,
  enrollment_year INTEGER,
  user_type TEXT DEFAULT 'student',
  subscription_end_date TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
)
```

#### verbs (动词表)
```sql
CREATE TABLE verbs (
  id INTEGER PRIMARY KEY,
  infinitive TEXT NOT NULL,           -- 原形
  meaning TEXT NOT NULL,              -- 中文意思
  conjugation_type INTEGER NOT NULL,  -- 1/2/3变位
  is_irregular INTEGER DEFAULT 0,     -- 是否不规则
  lesson_number INTEGER,              -- 课程编号
  textbook_volume INTEGER DEFAULT 1,
  frequency_level INTEGER DEFAULT 1
)
```

#### conjugations (变位表)
```sql
CREATE TABLE conjugations (
  id INTEGER PRIMARY KEY,
  verb_id INTEGER NOT NULL,
  tense TEXT NOT NULL,           -- 现在时/简单过去时/将来时
  mood TEXT NOT NULL,            -- 陈述式/虚拟式
  person TEXT NOT NULL,          -- 第一人称单数/复数...
  conjugated_form TEXT NOT NULL, -- 变位后的形式
  is_irregular INTEGER DEFAULT 0,
  FOREIGN KEY (verb_id) REFERENCES verbs(id)
)
```

#### public_questions (公共题库)
```sql
CREATE TABLE public_questions (
  id INTEGER PRIMARY KEY,
  verb_id INTEGER NOT NULL,
  question_type TEXT CHECK(question_type IN ('fill', 'sentence')),
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  example_sentence TEXT,
  translation TEXT,
  hint TEXT,
  tense TEXT NOT NULL,
  mood TEXT NOT NULL,
  person TEXT NOT NULL,
  confidence_score INTEGER DEFAULT 50 CHECK(confidence_score >= 0 AND confidence_score <= 100),
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
)
```

---

## 数据流转机制

### 完整练习流程

```
【前端】用户进入练习页
    ↓
pages/practice/practice.vue
    ↓ 
调用 api.getExercise({ exerciseType, count, tenses, ... })
    ↓
【后端】/api/exercise/generate (POST)
    ↓
routes/exercise.js → ExerciseGenerator.generateOne()
    ↓
┌──────────────────────────────────────┐
│ 1. 判断题型                           │
│    - choice/conjugate → 固定算法      │
│    - fill/sentence → 题库(85%) + AI(15%)│
└──────────────────────────────────────┘
    ↓
┌──────────────────────────────────────┐
│ 2. 题库获取流程                       │
│    a. Question.getRandomFromPublic()  │
│       - 从 questions.db 查询         │
│       - 按置信度排序                  │
│    b. 如果题库无合适题目 → AI生成     │
└──────────────────────────────────────┘
    ↓
┌──────────────────────────────────────┐
│ 3. AI生成流程 (如果触发)              │
│    a. 从 vocabulary.db 随机选动词     │
│    b. DeepSeek.generateSentence()    │
│    c. validateAIResultData()         │
│    d. QuestionValidator.validate()   │
│    e. 通过 → 保存到 questions.db      │
│       失败 → 重试(最多3次)            │
└──────────────────────────────────────┘
    ↓
【返回】格式化的题目对象
    ↓
【前端】渲染题目 → 用户答题
    ↓
调用 api.submitAnswer({ verbId, isCorrect, ... })
    ↓
【后端】/api/exercise/submit (POST)
    ↓
┌──────────────────────────────────────┐
│ 4. 提交处理                           │
│    a. PracticeRecord.create()        │
│       → INSERT INTO practice_records │
│    b. 更新 user_progress             │
│       - practice_count++             │
│       - mastery_level 调整           │
│    c. 如果答错 → WrongVerb.add()     │
│    d. 如果是题库题目                  │
│       → Question.updateConfidence()  │
│          - 答对: confidence += 5     │
│          - 答错: confidence -= 3     │
└──────────────────────────────────────┘
    ↓
【返回】{ success: true }
    ↓
【前端】显示答案反馈 → 下一题
```

### 跨数据库查询处理

由于 SQLite 不支持跨库 JOIN，采用**分步查询 + 应用层合并**：

```javascript
// ❌ 不支持的写法
SELECT v.infinitive, p.is_correct
FROM practice_records p
JOIN verbs v ON p.verb_id = v.id  -- 跨库JOIN失败

// ✅ 正确的写法
// Step 1: 从 user_data.db 查询记录
const records = userDb.prepare(`
  SELECT verb_id, is_correct FROM practice_records
  WHERE user_id = ?
`).all(userId)

// Step 2: 提取 verb_ids
const verbIds = records.map(r => r.verb_id)

// Step 3: 从 vocabulary.db 查询动词信息
const verbs = vocabularyDb.prepare(`
  SELECT id, infinitive, meaning FROM verbs
  WHERE id IN (${verbIds.join(',')})
`).all()

// Step 4: 应用层合并
const result = records.map(record => ({
  ...record,
  verb: verbs.find(v => v.id === record.verb_id)
}))
```

---

## 项目结构

```
Spanish-Verb-Conjugation-Practicer/
├── server/                          # 后端服务
│   ├── index.js                     # 服务器入口
│   ├── database/
│   │   └── db.js                    # 数据库初始化（三库连接）
│   ├── models/                      # 数据模型层
│   │   ├── User.js                  # 用户模型
│   │   ├── Verb.js                  # 动词模型
│   │   ├── Conjugation.js           # 变位模型
│   │   ├── Question.js              # 题库模型
│   │   ├── PracticeRecord.js        # 练习记录模型
│   │   ├── CheckIn.js               # 打卡模型
│   │   ├── FavoriteVerb.js          # 收藏模型
│   │   └── WrongVerb.js             # 错题模型
│   ├── routes/                      # 路由层
│   │   ├── user.js                  # 用户路由
│   │   ├── exercise.js              # 练习路由
│   │   ├── record.js                # 记录路由
│   │   ├── checkin.js               # 打卡路由
│   │   ├── vocabulary.js            # 单词本路由
│   │   └── question.js              # 题库路由
│   ├── services/                    # 服务层
│   │   ├── exerciseGenerator.js     # 题目生成服务
│   │   ├── deepseek.js              # AI生成服务
│   │   ├── questionValidator.js     # 题目验证服务
│   │   └── scheduler.js             # 定时任务服务
│   ├── data/
│   │   └── initData.js              # 初始化示例数据
│   ├── user_data.db                 # 用户数据库
│   ├── vocabulary.db                # 词库数据库
│   └── questions.db                 # 题库数据库
│
├── pages/                           # 前端页面
│   ├── index/                       # 首页
│   │   └── index.vue
│   ├── practice/                    # 练习页
│   │   └── practice.vue
│   ├── vocabulary/                  # 单词本
│   │   └── vocabulary.vue
│   ├── question-bank/               # 题库管理
│   │   └── question-bank.vue
│   ├── statistics/                  # 统计页
│   │   └── statistics.vue
│   ├── profile/                     # 个人中心
│   │   └── profile.vue
│   └── login/                       # 登录页
│       └── login.vue
│
├── utils/                           # 工具函数
│   ├── api.js                       # API封装
│   └── common.js                    # 通用函数
│
├── static/                          # 静态资源
├── .env                             # 环境变量
├── .env.example                     # 环境变量示例
├── package.json                     # 依赖配置
└── README.md                        # 项目文档
```

---

## 快速开始

### 1. 环境要求
- Node.js >= 14
- npm >= 6

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
PORT=3000
JWT_SECRET=your_jwt_secret_key
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

### 4. 启动服务器
```bash
npm start
```

服务器将运行在 `http://localhost:3000`

### 5. 前端配置

修改 `utils/api.js` 中的 BASE_URL：
```javascript
const BASE_URL = 'http://localhost:3000/api'
```

### 6. 运行前端

使用 HBuilderX 或 uni-app CLI 运行到浏览器/小程序/APP

---

## API 文档

### 基础配置
```
BASE_URL: http://362ff83b.r39.cpolar.top/api
Authorization: Bearer {JWT_TOKEN}
```

### 主要接口

#### 用户相关
```
POST   /api/user/register      # 注册
POST   /api/user/login         # 登录
GET    /api/user/info          # 获取用户信息
PUT    /api/user/profile       # 更新个人资料
```

#### 练习相关
```
POST   /api/exercise/generate       # 批量生成题目
POST   /api/exercise/generate-one   # 生成单题
POST   /api/exercise/submit         # 提交答案
```

#### 学习记录
```
GET    /api/record/list         # 练习记录列表
GET    /api/record/statistics   # 学习统计
```

#### 打卡相关
```
POST   /api/checkin            # 每日打卡
GET    /api/checkin/history    # 打卡历史
```

#### 单词本
```
POST   /api/vocabulary/favorite/add       # 添加收藏
POST   /api/vocabulary/favorite/remove    # 取消收藏
GET    /api/vocabulary/favorite/check/:id # 检查收藏状态
GET    /api/vocabulary/favorite/list      # 收藏列表

POST   /api/vocabulary/wrong/add          # 添加错题
GET    /api/vocabulary/wrong/list         # 错题列表
```

#### 题库管理
```
POST   /api/question/favorite      # 收藏题目到私人题库
POST   /api/question/unfavorite    # 取消收藏题目
GET    /api/question/my-questions  # 我的题库
GET    /api/question/stats         # 题库统计
```

---

## 核心算法详解

### 1. 置信度调整算法
```javascript
// 用户答对
confidenceScore = Math.min(confidenceScore + 5, 100)

// 用户答错
confidenceScore = Math.max(confidenceScore - 3, 0)

// 题库获取优先级
ORDER BY confidence_score DESC, created_at DESC
```

### 2. 掌握度计算
```javascript
mastery_level = (correct_count / practice_count) * 10

// 已掌握判定
if (mastery_level >= 5 && practice_count >= 3) {
  status = 'mastered'
}
```

### 3. 连续打卡计算
```javascript
// 获取最近打卡记录
const recentCheckIns = CheckIn.getRecent(userId, 100)

// 倒序遍历计算连续天数
let streakDays = 0
let expectedDate = today

for (const checkIn of recentCheckIns) {
  if (checkIn.check_in_date === expectedDate) {
    streakDays++
    expectedDate = getPreviousDate(expectedDate)
  } else {
    break
  }
}
```

---

## 常见问题

### Q: 为什么要分三个数据库？
A: 
1. **独立访问**：避免 DB Browser 锁定问题
2. **职责分离**：用户数据、词库、题库各司其职
3. **性能优化**：减小单库体积，提升查询速度

### Q: AI生成的题目会被一直保留吗？
A: 不会。定时任务每天凌晨0点清理创建超过30天的公共题目，节省存储空间。

### Q: 如何确保AI生成的题目质量？
A: 
1. 数据完整性检查（防止 undefined）
2. 第二个AI实例验证（语法、唯一性、自然度）
3. 重试机制（最多3次）
4. 置信度动态调整（答对+5，答错-3）

### Q: 私人题库和公共题库的区别？
A: 
- **公共题库**: AI生成的共享题目，所有用户可见，会被定时清理
- **私人题库**: 用户主动收藏的题目，永久保存，不受清理影响

---

## 更新日志

### v1.0.0 (2025-11-20)
- ✅ 完成三库分离架构
- ✅ 实现 AI 生成与验证双模机制
- ✅ 添加题目重试机制（最多3次）
- ✅ 实现置信度系统
- ✅ 添加定时清理任务
- ✅ 修复打卡逻辑（需完成练习才能打卡）
- ✅ 修复跨数据库查询问题

---

## 致谢

感谢以下开源项目和服务：
- [uni-app](https://uniapp.dcloud.io/)
- [Express.js](https://expressjs.com/)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [DeepSeek AI](https://www.deepseek.com/)

---

**Happy Learning Spanish! 🎉**
