# 西班牙语动词变位练习系统

> 一款基于 uni-app + Express.js + SQLite + DeepSeek AI 的智能西班牙语学习应用

## 📋 目录

- [项目简介](#项目简介)
- [核心特色](#核心特色)
- [技术栈](#技术栈)
- [系统架构](#系统架构)
- [核心功能](#核心功能)
- [数据库设计](#数据库设计)
- [AI智能系统](#ai智能系统)
- [性能优化](#性能优化)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [更新日志](#更新日志)

---

## 项目简介

这是一个面向西班牙语学习者的智能练习系统，集成了传统题库与 AI 生成技术，提供个性化学习体验。系统采用三库分离架构，结合智能题库管理、实时反馈和学习进度追踪，让动词变位学习更高效、更有趣。

### 核心特色

- 🎯 **四种题型**：选择题、填空题、变位题、例句填空
- 🤖 **AI 智能生成**：DeepSeek 双模型验证，确保题目质量
- 📊 **双题库系统**：公共题库（智能推荐）+ 私人题库（个人收藏）
- ⚡ **异步生成优化**：题库题目立即返回，AI 题目后台生成
- 🔄 **错题重做机制**：自动收集错题，练习完成后立即巩固
- 📈 **完整学习追踪**：打卡系统、学习天数、练习统计、掌握度计算
- 💾 **智能题库管理**：置信度动态调整、定时清理、去重生成
- 🎨 **内嵌式反馈**：无弹窗干扰，答题后即时显示反馈与操作
- 📌 **双收藏系统**：单词收藏 + 题目收藏，支持一键取消
- 🏆 **多维度排行**：练习量、正确率、连续打卡、掌握动词数

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
- **DeepSeek API** - 题目生成与质量验证
- **异步生成策略** - 后台智能生成，不阻塞用户体验

### 定时任务
- **node-cron** - 定时清理过期题目（每天凌晨 0 点）

---

## 系统架构

### 整体架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    前端层 (uni-app + Vue 2)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  首页    │  │  练习    │  │ 单词本   │  │ 题库管理  │   │
│  │  打卡    │  │  四题型  │  │ 错题本   │  │ 个人中心  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│           ↓ RESTful API (JWT 认证)                          │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                  服务层 (Express.js + 中间件)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 路由层   │  │ JWT认证  │  │ API日志  │  │ CORS     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                      业务逻辑层 (Services)                     │
│  ┌───────────────────┐  ┌───────────────────┐              │
│  │ExerciseGenerator  │  │QuestionValidator  │              │
│  │ • 题目生成器       │  │ • AI质量验证      │              │
│  │ • 异步生成策略     │  │ • 双模型检查      │              │
│  │ • 去重机制        │  └───────────────────┘              │
│  └───────────────────┘                                      │
│  ┌───────────────────┐  ┌───────────────────┐              │
│  │DeepSeek Service   │  │Scheduler Service  │              │
│  │ • AI题目生成      │  │ • 定时清理任务    │              │
│  │ • 题目验证        │  │ • 日志美化        │              │
│  └───────────────────┘  └───────────────────┘              │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                       数据模型层 (Models)                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ User    │ │ Verb    │ │Question │ │CheckIn  │          │
│  │ 用户管理 │ │ 动词库  │ │ 题库    │ │ 打卡    │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                      │
│  │Practice │ │Favorite │ │WrongVerb│                      │
│  │ 练习记录 │ │ 收藏    │ │ 错题本  │                      │
│  └─────────┘ └─────────┘ └─────────┘                      │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│              数据库层 (SQLite 三库分离架构)                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ user_data.db │ │vocabulary.db │ │questions.db  │        │
│  │  (用户数据)   │ │  (词库数据)   │ │  (题库数据)   │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 核心功能

### 1. 智能练习系统

#### 1.1 四种题型

| 题型 | 生成方式 | 特点 |
|------|---------|------|
| **选择题** | 固定算法 | 从动词变位表随机生成选项，支持去重 |
| **变位题** | 固定算法 | 手动输入变位形式，支持去重 |
| **填空题** | 85%题库 + 15%AI | 智能推荐 + 后台异步生成 |
| **例句填空** | 85%题库 + 15%AI | 真实语境 + AI验证质量 |

#### 1.2 异步生成优化（性能提升关键）

**问题**：用户点击"开始练习"后需等待 5-10 秒（AI 生成阻塞）

**解决方案**：
```
用户点击开始 → 立即返回题库题目 → 用户立即开始答题
                         ↓
                   后台异步生成 AI 题目
                         ↓
                   生成完成后插入题目队列
                         ↓
                   用户无感知过渡到 AI 题目
```

**技术实现**：
- 前端：立即渲染题库题目，异步调用 AI 生成接口
- 后端：`generateBatch()` 分离题库查询和 AI 生成
- 缓冲区机制：保持 2-3 题的缓冲，避免用户等待

#### 1.3 错题重做机制

```
答题过程中答错 → 自动添加到错题队列
                      ↓
              标记为 isRetry: true
                      ↓
          完成所有初始题目后
                      ↓
        立即进入错题重做环节
                      ↓
        错题答对后才算真正完成
```

**视觉标识**：错题右上角显示"错题重做"标签

### 2. 双题库系统

#### 2.1 公共题库（questions.db）

- **来源**：AI 智能生成
- **共享**：所有用户可访问
- **置信度系统**：
  ```javascript
  初始置信度: 50
  用户答对: +5 (最高 100)
  用户答错: -3 (最低 0)
  ```
- **智能推荐**：优先返回高置信度题目
  ```sql
  ORDER BY confidence_score DESC, created_at DESC
  ```
- **自动清理**：每天凌晨 0 点删除创建超过 30 天的题目

#### 2.2 私人题库（user_data.db）

- **来源**：用户主动收藏的题目
- **独享**：仅用户本人可见
- **永久保存**：不受定时清理影响
- **关联公共题库**：
  - 保存 `public_question_id` 字段
  - 取消收藏时自动更新公共题库置信度 -2

#### 2.3 题目收藏与取消

**收藏流程**：
```
用户点击 📌 → 复制题目到 private_questions
              → 返回 privateQuestionId
              → 前端保存 ID（用于后续取消）
              → 如果来自公共题库，置信度 +2
```

**取消收藏流程**：
```
用户再次点击 📌 → 根据 privateQuestionId 删除
                  → 如果有关联公共题库，置信度 -2
                  → 前端清除 privateQuestionId
```

### 3. 学习追踪与统计

#### 3.1 学习天数计算

**修复时区问题**：
```javascript
// ❌ 错误：UTC 时间解析导致偏差
const date = new Date('2025-11-20')  // 被解析为 UTC 00:00

// ✅ 正确：手动解析为本地时间
const [year, month, day] = '2025-11-20'.split('-').map(Number)
const date = new Date(year, month - 1, day)  // 本地时间
```

**计算逻辑**：
```javascript
学习天数 = Math.floor((当前时间 - 注册时间) / (1000 * 60 * 60 * 24)) + 1
// 注册当天显示 1 天
```

#### 3.2 连续打卡系统

**修复时区问题**：
```javascript
// 修复前：checkInDate 解析为 UTC，导致连续打卡判断错误
// 修复后：手动解析为本地时间
const [year, month, day] = dateStr.split('-').map(Number)
const checkInDate = new Date(year, month - 1, day)
```

**打卡逻辑**：
- 必须当天有练习记录才能打卡
- 自动计算连续打卡天数
- 中断后从 1 天重新开始

#### 3.3 统计数据

- **今日练习**：总题数、答对数
- **总体数据**：总练习数、总答对数、练习天数、已掌握动词数
- **掌握度计算**：
  ```javascript
  mastery_level = (correct_count / practice_count) * 10
  已掌握标准: mastery_level >= 5 && practice_count >= 3
  ```

### 4. AI 智能生成系统

#### 4.1 双模型验证机制

```
DeepSeek 生成模型 (temperature=0.7)
         ↓
    生成题目
         ↓
  数据完整性检查
         ↓
DeepSeek 验证模型 (temperature=0.3)
         ↓
    质量验证
         ↓
  ┌──────┴──────┐
  ↓             ↓
通过           失败
  ↓             ↓
保存题库    重试(最多3次)
  ↓             ↓
返回题目   降级传统算法
```

#### 4.2 生成 Prompt 示例

**填空题生成**：
```
为动词 "hablar" (说话) 生成填空题
时态：陈述式现在时
人称：第一人称单数

要求：
1. 正确答案必须是：hablo
2. 题干要自然、符合日常场景
3. 提供例句、提示、翻译
4. 提示不能暴露答案

返回JSON格式
```

#### 4.3 验证维度

- ✅ 语法正确性
- ✅ 答案唯一性（关键）
- ✅ 句子自然度
- ✅ 翻译准确性
- ✅ 提示合理性（不暴露答案）

### 5. 用户体验优化

#### 5.1 内嵌式答案反馈

**优化前**：弹窗遮挡题目和答案，用户无法回看

**优化后**：
```
┌─────────────────────────┐
│  题目卡片                │
│  • 动词信息              │
│  • 题干                  │
│  • 用户输入框(禁用)      │
│  ┌─────────────────┐    │
│  │ ✓ 回答正确！     │    │ ← 内嵌反馈区
│  │ 正确答案：xxx    │    │
│  │ [👍好题] [👎坏题]│    │
│  └─────────────────┘    │
│  [下一题] 按钮           │
└─────────────────────────┘
```

**优势**：
- 用户可以回看题目和自己的答案
- 支持原地收藏单词/题目
- 支持题目评价（好题/坏题）
- 无弹窗打断，体验更流畅

#### 5.2 专项练习界面优化

**配色统一**：
- 修改前：橙黄色系（#ff9500、#ffe7d6）
- 修改后：紫色系（#667eea、#764ba2）
- 设计风格：与整体 UI 保持一致

**复选框优化**：
- 选中背景：渐变紫色
- 边框颜色：紫色
- 图标颜色：紫色
- 快捷按钮：紫色渐变

#### 5.3 去重机制

**选择题/变位题去重**：
```javascript
const generatedKeys = new Set()
while (exercises.length < count) {
  const exercise = generateTraditionalExercise()
  const key = `${verbId}-${tense}-${mood}-${person}`
  
  if (!generatedKeys.has(key)) {
    generatedKeys.add(key)
    exercises.push(exercise)
  }
}
```

**避免重复**：同一批次不会出现相同的"动词-时态-人称"组合

### 6. 后端日志系统

#### 6.1 API 日志中间件

```
[15:07:23.456] GET /api/verb/list | 获取动词列表
  ↳ 200 | 45ms

[15:08:10.123] POST /api/exercise/submit | 提交答案
  ↳ 200 | 12ms
```

**特点**：
- 彩色输出（GET绿色、POST黄色、DELETE红色）
- 中文 API 名称映射（30+ 个接口）
- 执行时间统计
- 状态码显示

#### 6.2 定时任务日志

```
============================================================
⏰ 定时任务触发 | 2025/11/20 00:00:00
============================================================
🧹 开始清理超过30天的旧题目...
📊 步骤1: 清理答题记录...
   ✓ 已删除 15 条超期题目的答题记录
📝 步骤2: 清理公共题库题目...
   ✓ 已删除 8 道超过30天的公共题库题目
✓ 清理完成 | 记录: 15 条 | 题目: 8 道
============================================================
```

---

## 数据库设计

### 三库分离架构

```
user_data.db (用户数据库)
├── users                    # 用户表（JWT认证）
├── practice_records         # 练习记录
├── check_ins               # 打卡记录
├── user_progress           # 学习进度
├── favorite_verbs          # 收藏单词
├── wrong_verbs             # 错题本
├── private_questions       # 私人题库（★新增public_question_id字段）
└── user_question_records   # 答题记录

vocabulary.db (词库数据库)
├── verbs                   # 动词表（200+个）
└── conjugations            # 变位表（2000+条）

questions.db (题库数据库)
└── public_questions        # 公共题库（AI生成）
```

### 关键表结构

#### users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT,
  school TEXT,
  enrollment_year INTEGER,
  user_type TEXT DEFAULT 'student',
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
)
```

#### private_questions（私人题库）
```sql
CREATE TABLE private_questions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
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
  public_question_id INTEGER,  -- ★关联公共题库（用于置信度更新）
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

#### public_questions（公共题库）
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
  confidence_score INTEGER DEFAULT 50,  -- 置信度（0-100）
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (verb_id) REFERENCES verbs(id)
)
```

---

## AI 智能系统

## AI 智能系统

### DeepSeek 双模型验证

**模型 1：生成器** (temperature=0.7)
- 生成填空题和例句填空
- 保持创造性和多样性

**模型 2：验证器** (temperature=0.3)
- 验证题目质量
- 降低随机性，提高一致性

### 生成流程

```
1. 随机选择动词 → Verb.getRandom()
2. 构建生成 Prompt → DeepSeek 生成
3. 数据完整性检查 → 验证必填字段
4. AI 质量验证 → 第二个模型验证
5. 通过 → 保存到 public_questions (置信度=50)
   失败 → 重试(最多3次) → 降级传统算法
```

### 验证标准

- ✅ 正确答案格式正确
- ✅ 句子语法无误
- ✅ 答案在句子语境中唯一
- ✅ 翻译准确
- ✅ 提示有帮助但不暴露答案

---

## 性能优化

### 1. 异步生成策略

**问题**：同步等待 AI 生成导致 5-10 秒延迟

**解决方案**：
```javascript
// 后端分离生成
generateBatch() {
  // 1. 立即返回题库题目
  const bankQuestions = Question.getSmartFromPublic(...)
  
  // 2. 计算需要 AI 生成的数量
  const aiCount = totalCount - bankQuestions.length
  
  // 3. 立即返回题库题 + 告知前端需异步生成多少题
  return {
    questionPool: bankQuestions,  // 立即可用
    needAI: aiCount,               // 需要异步生成
    aiOptions: {...}               // 生成参数
  }
}

// 前端异步生成
async loadExercises() {
  const result = await api.getExercise(...)
  
  // 立即显示题库题
  this.exercises = result.questionPool
  
  // 后台异步生成 AI 题
  if (result.needAI > 0) {
    this.generateAIInBackground(result.needAI, result.aiOptions)
  }
}
```

**效果**：用户等待时间从 5-10 秒 → 0 秒

### 2. 题目去重机制

**选择题/变位题去重**：
```javascript
const generatedKeys = new Set()
const maxAttempts = count * 10

while (exercises.length < count && attempts < maxAttempts) {
  const exercise = generateTraditionalExercise()
  const key = `${verbId}-${tense}-${mood}-${person}`
  
  if (!generatedKeys.has(key)) {
    generatedKeys.add(key)
    exercises.push(exercise)
  }
  attempts++
}
```

**避免**：同批次出现完全相同的题目

### 3. 时区问题修复

**日期解析**：
```javascript
// ❌ 错误：UTC 时间
new Date('2025-11-20')  // 解析为 UTC 00:00

// ✅ 正确：本地时间
const [year, month, day] = '2025-11-20'.split('-').map(Number)
new Date(year, month - 1, day)
```

**影响**：
- 学习天数计算
- 连续打卡计算
- 时区差异导致偏差 8 小时

---

## 项目结构

```
Spanish-Verb-Conjugation-Practicer/
├── server/                          # 后端服务
│   ├── index.js                     # 入口文件
│   ├── database/
│   │   └── db.js                    # 三库初始化
│   ├── models/                      # 数据模型
│   │   ├── User.js
│   │   ├── Verb.js
│   │   ├── Conjugation.js
│   │   ├── Question.js              # ★题库管理（双库）
│   │   ├── PracticeRecord.js
│   │   ├── CheckIn.js               # ★打卡系统
│   │   ├── FavoriteVerb.js
│   │   └── WrongVerb.js
│   ├── routes/                      # API 路由
│   │   ├── user.js
│   │   ├── exercise.js
│   │   ├── record.js
│   │   ├── checkin.js
│   │   ├── vocabulary.js
│   │   └── question.js              # ★题库路由
│   ├── services/                    # 业务逻辑
│   │   ├── exerciseGenerator.js     # ★异步生成优化
│   │   ├── deepseek.js              # AI 生成
│   │   ├── questionValidator.js     # AI 验证
│   │   └── scheduler.js             # ★定时清理
│   ├── middleware/
│   │   ├── auth.js                  # JWT 认证
│   │   └── logger.js                # ★API 日志中间件
│   ├── data/
│   │   └── initData.js              # 初始数据
│   ├── user_data.db                 # 用户数据库
│   ├── vocabulary.db                # 词库数据库
│   └── questions.db                 # 题库数据库
│
├── pages/                           # 前端页面
│   ├── index/                       # ★首页（学习天数优化）
│   │   └── index.vue
│   ├── practice/                    # ★练习页（核心）
│   │   └── practice.vue             # 异步生成、内嵌反馈、错题重做
│   ├── vocabulary/                  # 单词本
│   │   └── vocabulary.vue
│   ├── question-bank/               # ★题库管理
│   │   └── question-bank.vue        # 私人题库、收藏取消
│   ├── statistics/                  # 统计页
│   │   └── statistics.vue
│   ├── leaderboard/                 # 排行榜
│   │   └── leaderboard.vue
│   ├── profile/                     # 个人中心
│   │   └── profile.vue
│   └── login/                       # 登录注册
│       └── login.vue
│
├── utils/                           # 工具函数
│   ├── api.js                       # API 封装
│   └── common.js                    # 通用函数
│
├── static/                          # 静态资源
├── .env                             # 环境变量
├── .env.example
├── package.json
└── README.md
```

---

## 快速开始

### 1. 环境要求
- Node.js >= 14.0
- npm >= 6.0
- HBuilderX (推荐) 或 uni-app CLI

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
cp .env.example .env
```

编辑 `.env`：
```env
PORT=3000
JWT_SECRET=your_super_secret_key_change_this
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

### 4. 启动后端服务
```bash
cd server
npm start
```

服务器启动信息：
```
💾 数据库初始化...
   • 用户数据库: user_data.db
   • 词库数据库: vocabulary.db
   • 题库数据库: questions.db
   ✓ 数据库初始化完成

✓ 定时任务调度器已启动 (每天凌晨0点清理超过30天的题目)

============================================================
  🚀 西班牙语动词变位练习系统
============================================================
  📡 服务器地址: http://localhost:3000
  📋 健康检查: http://localhost:3000/api/health
  ⏰ 启动时间: 2025/11/20 15:30:00
============================================================
```

### 5. 配置前端
修改 `utils/api.js` 的 BASE_URL：
```javascript
const BASE_URL = 'http://localhost:3000/api'
```

### 6. 运行前端
使用 HBuilderX 运行到：
- 浏览器（推荐 Chrome）
- 微信小程序
- APP（需配置证书）

---

## 更新日志

### v2.0.0 (2025-11-20)

#### 🚀 性能优化
- ✅ **异步题目生成**：题库题立即返回，AI 题后台生成，用户等待时间 ≈ 0
- ✅ **题目去重机制**：选择题/变位题批量生成时避免重复
- ✅ **时区问题修复**：学习天数和连续打卡计算修复 UTC/本地时间偏差

#### 🎨 用户体验
- ✅ **内嵌式答案反馈**：移除弹窗，答题后即时显示反馈（可回看题目）
- ✅ **错题重做机制**：答错题目自动加入队列，完成后立即重做
- ✅ **专项练习界面优化**：配色统一为紫色系，符合整体风格
- ✅ **学习天数优化**：注册当天显示 1 天（原为 0 天）

#### 📚 题库系统
- ✅ **题目收藏与取消**：支持收藏填空题到私人题库，支持一键取消收藏
- ✅ **双题库关联**：`private_questions` 新增 `public_question_id` 字段
- ✅ **置信度容错**：取消收藏时检查公共题库是否存在，避免错误

#### 🔧 后端优化
- ✅ **API 日志中间件**：彩色输出、中文名称映射、执行时间统计
- ✅ **定时任务日志美化**：清晰的步骤提示和执行结果展示
- ✅ **启动信息优化**：美化控制台输出，显示服务器信息

#### 🐛 Bug 修复
- ✅ 修复退出登录后重新登录数据归零问题（`getUserInfo` 实时同步）
- ✅ 修复新注册用户显示"已学习 -1 天"（`created_at` 字段返回）
- ✅ 修复连续打卡天数计算错误（时区解析问题）
- ✅ 修复题目收藏后无法取消的问题（`privateQuestionId` 保存）
- ✅ 删除内嵌反馈区域的重复"错题重做"标记

---

### v1.0.0 (2025-11-15)
- ✅ 完成三库分离架构
- ✅ 实现 AI 生成与验证双模机制
- ✅ 添加题目重试机制（最多3次）
- ✅ 实现置信度系统
- ✅ 添加定时清理任务
- ✅ 修复打卡逻辑（需完成练习才能打卡）

---

## 技术亮点

### 1. 三库分离架构
- 避免 DB Browser 锁定问题
- 职责分离，便于维护
- 提升查询性能

### 2. AI 双模型验证
- 生成模型保持创造性
- 验证模型确保质量
- 重试机制提高成功率

### 3. 异步生成优化
- 题库题立即返回
- AI 题后台生成
- 用户无感知体验

### 4. 置信度动态调整
- 答对 +5，答错 -3
- 优先推荐高质量题目
- 自动淘汰低质题目

### 5. 定时清理机制
- 每天凌晨 0 点执行
- 删除 30 天以上题目
- 节省存储空间

### 6. 错题重做系统
- 自动收集错题
- 练习完成后立即巩固
- 提高学习效率

---

## 常见问题

### Q: 为什么要分三个数据库？
**A**: 
1. **避免锁定**：DB Browser 打开词库时不影响用户数据写入
2. **职责分离**：用户数据、词库、题库各司其职
3. **性能优化**：减小单库体积，提升查询速度
4. **独立维护**：词库可单独导出更新

### Q: AI 生成的题目会被永久保留吗？
**A**: 不会。定时任务每天凌晨 0 点清理创建超过 30 天的公共题目，但用户收藏到私人题库的题目会永久保存。

### Q: 如何确保 AI 生成的题目质量？
**A**: 
1. **数据完整性检查**：验证必填字段是否存在
2. **AI 质量验证**：第二个模型验证语法、唯一性、自然度
3. **重试机制**：最多重试 3 次
4. **置信度调整**：答对 +5，答错 -3，动态淘汰低质题目
5. **降级策略**：3 次失败后使用传统算法

### Q: 私人题库和公共题库的区别？
**A**: 
| 特性 | 公共题库 | 私人题库 |
|------|---------|---------|
| 来源 | AI 生成 | 用户收藏 |
| 可见性 | 所有用户 | 仅用户本人 |
| 生命周期 | 30 天自动清理 | 永久保存 |
| 置信度 | 动态调整 | 不参与调整 |
| 数据库 | questions.db | user_data.db |

### Q: 为什么要使用异步生成？
**A**: 
- **传统方式**：用户点击"开始练习" → 等待 5-10 秒 AI 生成 → 显示题目
- **异步方式**：用户点击"开始练习" → 立即显示题库题目 → 后台生成 AI 题
- **用户体验**：等待时间从 5-10 秒降至 0 秒

### Q: 如何计算连续打卡天数？
**A**: 
```javascript
// 从今天开始倒序检查
let streak = 0
let expectedDate = today

for (checkIn of checkIns) {
  if (checkIn.date === expectedDate) {
    streak++
    expectedDate = yesterday(expectedDate)
  } else {
    break  // 中断了
  }
}
```

---

## 致谢

感谢以下开源项目和服务：
- [uni-app](https://uniapp.dcloud.io/) - 跨平台应用框架
- [Express.js](https://expressjs.com/) - Node.js Web 框架
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - 高性能 SQLite
- [DeepSeek AI](https://www.deepseek.com/) - AI 生成与验证
- [node-cron](https://github.com/node-cron/node-cron) - 定时任务调度

---

## 开源协议

MIT License

---

## 联系方式

- 作者：kuiningzzzz
- 仓库：[GitHub](https://github.com/kuiningzzzz/Spanish-Verb-Conjugation-Practicer)

---

**¡Vamos a aprender español! 🎉**
