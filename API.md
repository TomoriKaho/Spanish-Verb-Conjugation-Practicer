# API 接口文档

基础URL: `http://localhost:3000/api`

所有需要认证的接口都需要在请求头中携带 token：
```
Authorization: Bearer <token>
```

## 用户相关接口

### 1. 用户注册

**接口**: `POST /user/register`

**请求体**:
```json
{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com",
  "school": "某某大学",
  "enrollmentYear": 2024,
  "userType": "student"
}
```

**响应**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "school": "某某大学",
    "enrollmentYear": 2024,
    "userType": "student"
  }
}
```

### 2. 用户登录

**接口**: `POST /user/login`

**请求体**:
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**响应**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "school": "某某大学",
    "enrollmentYear": 2024,
    "userType": "student"
  }
}
```

### 3. 获取用户信息

**接口**: `GET /user/info`

**需要认证**: 是

**响应**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "school": "某某大学",
    "enrollmentYear": 2024,
    "userType": "student",
    "subscriptionEndDate": null
  }
}
```

### 4. 更新用户信息

**接口**: `PUT /user/profile`

**需要认证**: 是

**请求体**:
```json
{
  "email": "newemail@example.com",
  "school": "新学校",
  "enrollmentYear": 2023
}
```

**响应**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "newemail@example.com",
    "school": "新学校",
    "enrollmentYear": 2023,
    "userType": "student"
  }
}
```

## 动词相关接口

### 5. 获取动词列表

**接口**: `GET /verb/list`

**需要认证**: 是

**查询参数**:
- `lessonNumber` (可选): 课程编号
- `textbookVolume` (可选): 教材册数
- `conjugationType` (可选): 变位类型 (1/2/3)

**示例**: `/verb/list?lessonNumber=1&textbookVolume=1`

**响应**:
```json
{
  "success": true,
  "verbs": [
    {
      "id": 1,
      "infinitive": "hablar",
      "meaning": "说话",
      "conjugation_type": 1,
      "is_irregular": 0,
      "lesson_number": 1,
      "textbook_volume": 1,
      "frequency_level": 1,
      "created_at": "2024-01-01 12:00:00"
    }
  ]
}
```

### 6. 获取动词详情

**接口**: `GET /verb/:id`

**需要认证**: 是

**响应**:
```json
{
  "success": true,
  "verb": {
    "id": 1,
    "infinitive": "hablar",
    "meaning": "说话",
    "conjugation_type": 1,
    "is_irregular": 0,
    "lesson_number": 1,
    "textbook_volume": 1
  },
  "conjugations": [
    {
      "id": 1,
      "verb_id": 1,
      "tense": "现在时",
      "mood": "陈述式",
      "person": "yo",
      "conjugated_form": "hablo",
      "is_irregular": 0
    }
  ]
}
```

## 练习相关接口

### 7. 生成练习题

**接口**: `POST /exercise/generate`

**需要认证**: 是

**请求体**:
```json
{
  "exerciseType": "choice",
  "count": 10,
  "lessonNumber": 1,
  "textbookVolume": 1
}
```

**参数说明**:
- `exerciseType`: 题型 ("choice" | "fill" | "conjugate" | "sentence")
- `count`: 题目数量 (1-30)
- `lessonNumber` (可选): 限定课程
- `textbookVolume` (可选): 限定教材册数

**响应**:
```json
{
  "success": true,
  "exercises": [
    {
      "id": 1,
      "verbId": 1,
      "infinitive": "hablar",
      "meaning": "说话",
      "tense": "现在时",
      "mood": "陈述式",
      "person": "yo",
      "correctAnswer": "hablo",
      "exerciseType": "choice",
      "options": ["hablo", "hablas", "habla", "hablamos"]
    }
  ]
}
```

### 8. 提交答案

**接口**: `POST /exercise/submit`

**需要认证**: 是

**请求体**:
```json
{
  "verbId": 1,
  "exerciseType": "choice",
  "answer": "hablo",
  "correctAnswer": "hablo",
  "tense": "现在时",
  "mood": "陈述式",
  "person": "yo"
}
```

**响应**:
```json
{
  "success": true,
  "isCorrect": true,
  "correctAnswer": "hablo"
}
```

## 记录和统计接口

### 9. 获取练习记录

**接口**: `GET /record/list`

**需要认证**: 是

**响应**:
```json
{
  "success": true,
  "records": [
    {
      "id": 1,
      "user_id": 1,
      "verb_id": 1,
      "infinitive": "hablar",
      "meaning": "说话",
      "exercise_type": "choice",
      "is_correct": 1,
      "answer": "hablo",
      "correct_answer": "hablo",
      "tense": "现在时",
      "mood": "陈述式",
      "person": "yo",
      "created_at": "2024-01-01 12:00:00"
    }
  ]
}
```

### 10. 获取学习统计

**接口**: `GET /record/statistics`

**需要认证**: 是

**响应**:
```json
{
  "success": true,
  "statistics": {
    "total": {
      "total_exercises": 100,
      "correct_exercises": 85,
      "practiced_verbs": 20,
      "practice_days": 15
    },
    "today": {
      "total_exercises": 10,
      "correct_exercises": 8
    },
    "masteredVerbsCount": 5,
    "masteredVerbs": [
      {
        "id": 1,
        "infinitive": "hablar",
        "meaning": "说话",
        "mastery_level": 5,
        "practice_count": 12,
        "correct_count": 11
      }
    ]
  }
}
```

## 打卡相关接口

### 11. 每日打卡

**接口**: `POST /checkin`

**需要认证**: 是

**请求体**: 无

**响应**:
```json
{
  "success": true,
  "message": "打卡成功",
  "streakDays": 7
}
```

如果今天已打卡：
```json
{
  "success": true,
  "message": "今天已经打卡过了",
  "alreadyCheckedIn": true
}
```

### 12. 获取打卡历史

**接口**: `GET /checkin/history`

**需要认证**: 是

**响应**:
```json
{
  "success": true,
  "history": [
    {
      "id": 1,
      "user_id": 1,
      "check_in_date": "2024-01-01",
      "exercise_count": 10,
      "correct_count": 8,
      "created_at": "2024-01-01 08:00:00"
    }
  ],
  "streakDays": 7,
  "hasCheckedInToday": true
}
```

## 排行榜接口

### 13. 获取排行榜

**接口**: `GET /leaderboard/:type`

**需要认证**: 是

**路径参数**:
- `type`: 排行榜类型 ("week" | "month" | "all")

**查询参数**:
- `limit` (可选): 返回数量，默认50

**示例**: `/leaderboard/week?limit=20`

**响应**:
```json
{
  "success": true,
  "type": "week",
  "leaderboard": [
    {
      "id": 1,
      "username": "topuser",
      "school": "某某大学",
      "check_in_days": 7,
      "total_exercises": 150,
      "total_correct": 135
    }
  ]
}
```

## 错误响应

所有接口在出错时返回统一的错误格式：

```json
{
  "error": "错误信息描述"
}
```

常见HTTP状态码：
- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权（未登录或token过期）
- `404`: 资源不存在
- `500`: 服务器内部错误

## 认证说明

### 获取Token

通过登录或注册接口获取token。

### 使用Token

在所有需要认证的接口请求头中添加：
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Token过期

Token有效期为30天。过期后需要重新登录获取新token。

## 数据模型

### 用户类型

- `student`: 学生用户（免费）
- `public`: 社会用户（需订阅）

### 变位类型

- `1`: 第一变位（-ar结尾）
- `2`: 第二变位（-er结尾）
- `3`: 第三变位（-ir结尾）

### 练习类型

- `choice`: 选择题
- `fill`: 填空题
- `conjugate`: 变位练习
- `sentence`: 句子补充

### 时态和语式

当前支持：
- 陈述式：现在时、简单过去时、将来时
- 可扩展：命令式、虚拟式、条件式等

### 人称

- `yo`: 我
- `tú`: 你
- `él/ella/usted`: 他/她/您
- `nosotros`: 我们
- `vosotros`: 你们
- `ellos/ellas/ustedes`: 他们/她们/诸位

### 掌握度级别

- `1`: 入门（刚开始练习）
- `2`: 初步掌握（正确率≥60%）
- `3`: 基本掌握（正确率≥70%且练习≥5次）
- `4`: 熟练掌握（正确率≥80%且练习≥8次）
- `5`: 完全掌握（正确率≥90%且练习≥10次）

## 测试建议

### 使用 Postman 测试

1. 导入接口到 Postman
2. 先调用注册/登录接口获取token
3. 在Collection中设置全局变量 `token`
4. 在需要认证的接口Header中使用 `{{token}}`

### 使用 cURL 测试

```bash
# 注册
curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456","userType":"student"}'

# 登录
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'

# 获取动词列表（需要token）
curl -X GET http://localhost:3000/api/verb/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 健康检查

**接口**: `GET /api/health`

**无需认证**

**响应**:
```json
{
  "status": "ok",
  "message": "服务运行正常"
}
```

用于检查服务器是否正常运行。
