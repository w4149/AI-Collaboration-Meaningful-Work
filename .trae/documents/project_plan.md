# AI协作工作平台 - 项目规划

## 1. 项目概述

这是一个用于心理学实验或研究的AI协作工作平台，用户通过Prolific平台参与任务，与AI进行交互，完成指定的任务。

## 2. 技术架构

### 2.1 技术栈选择

**前端**
- 框架：Next.js 14 (App Router)
- UI组件：Tailwind CSS + shadcn/ui
- 状态管理：React Context API / Zustand
- HTTP客户端：Axios

**后端**
- 框架：Next.js API Routes
- 部署：Vercel
- AI接口：OpenAI GPT API

**数据库**
- Supabase PostgreSQL (免费方案)

### 2.2 架构图

```
用户浏览器
    ↓
Vercel (Next.js前端 + API后端)
    ↓
Supabase (PostgreSQL数据库)
    ↓
OpenAI API
```

## 3. 功能模块设计

### 3.1 用户流程

1. **入口页面** (Prolific跳转)
   - 显示任务说明 (instruction)
   - 显示示例
   - 同意勾选框
   - 开始任务按钮
   - 系统自动分配四种任务类型之一

2. **主任务界面**
   - 顶部导航栏：计时器 + instruction链接 + 任务类型标识
   - 左侧面板：
     - 上：信息显示框（滚动窗口，复制权限控制）- 展示该任务类型对应的文本资料
     - 下：任务提交框（文本输入，实时本地保存，粘贴权限控制）- 用户处理和写作结果
   - 右侧面板：
     - AI对话窗口（可缩回/展开）
     - 历史消息滑动窗口
     - 输入窗口与AI交互
   - 任务提交按钮

3. **任务结束页面**
   - 人口学问卷
   - 任务熟悉程度评分
   - 提交问卷

### 3.2 核心功能详细设计

#### 3.2.1 导航栏
- 实时计时器
- Instruction链接/弹窗
- 任务类型标识
- 任务状态显示

#### 3.2.6 任务类型管理
- 支持四种任务类型，每种类型有独立的：
  - 文本资料内容
  - 任务说明
  - 权限配置（复制/粘贴）
  - 提示词模板（预留）
- 用户进入时随机分配一种任务类型
- 系统记录用户分配到的任务类型，用于数据分析

#### 3.2.2 左侧信息显示框
- 滚动显示待处理文本
- 权限控制：
  - 开放复制：允许复制和截图
  - 拒绝复制：禁用复制、禁用右键菜单、禁用截图检测
- 支持Markdown渲染

#### 3.2.3 左侧任务提交框
- 多行文本输入
- 实时自动保存到LocalStorage（本地存储）
- 用户刷新或关闭窗口时弹出确认提示，警告内容会丢失
- 权限控制：
  - 开放粘贴：允许粘贴文本
  - 拒绝粘贴：拦截粘贴事件
- 字符计数显示

#### 3.2.4 右侧AI对话窗口
- 可缩回/展开的侧边栏
- 历史消息滚动窗口
- 消息带时间戳
- 输入框支持发送消息
- 支持提示词工程（预留接口）
- 打字机效果显示AI回复

#### 3.2.5 问卷系统
- 人口学信息：年龄、性别、教育程度等
- 任务熟悉程度评分（1-5分）
- 其他自定义问题
- 表单验证

## 4. 数据库设计 (Supabase)

### 4.1 表结构

#### users 表
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prolific_id VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    session_id VARCHAR(100)
);
```

#### task_types 表
```sql
CREATE TABLE task_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### tasks 表
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    task_type_id UUID REFERENCES task_types(id),
    instruction TEXT,
    content_to_display TEXT,
    allow_copy BOOLEAN DEFAULT true,
    allow_paste BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### task_submissions 表
```sql
CREATE TABLE task_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    task_id UUID REFERENCES tasks(id),
    content TEXT,
    submitted_at TIMESTAMP DEFAULT NOW()
);
```

#### chat_messages 表
```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    task_id UUID REFERENCES tasks(id),
    role VARCHAR(20) CHECK (role IN ('user', 'assistant')),
    content TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

#### survey_responses 表
```sql
CREATE TABLE survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    age INTEGER,
    gender VARCHAR(50),
    education VARCHAR(100),
    task_familiarity INTEGER CHECK (task_familiarity BETWEEN 1 AND 5),
    additional_comments TEXT,
    submitted_at TIMESTAMP DEFAULT NOW()
);
```

#### sessions 表
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    start_time TIMESTAMP DEFAULT NOW(),
    end_time TIMESTAMP,
    task_completed BOOLEAN DEFAULT false
);
```

## 5. 项目结构

```
AICollaborationMeaningfulWork/
├── .trae/
│   └── documents/
│       └── project_plan.md
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── route.ts
│   │   ├── chat/
│   │   │   └── route.ts
│   │   ├── tasks/
│   │   │   └── route.ts
│   │   ├── submissions/
│   │   │   └── route.ts
│   │   └── survey/
│   │       └── route.ts
│   ├── components/
│   │   ├── Navigation.tsx
│   │   ├── InfoDisplay.tsx
│   │   ├── TaskInput.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── InstructionModal.tsx
│   │   └── SurveyForm.tsx
│   ├── context/
│   │   └── AppContext.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── openai.ts
│   │   └── utils.ts
│   ├── entry/
│   │   └── page.tsx
│   ├── task/
│   │   └── [taskId]/
│   │       └── page.tsx
│   ├── survey/
│   │   └── page.tsx
│   ├── thank-you/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── public/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── supabase/
│   └── migrations/
│       └── 001_init.sql
└── README.md
```

## 6. 安全考虑

### 6.1 数据库安全
- 使用Supabase Row Level Security (RLS)
- API密钥存储在服务器端环境变量
- 输入验证和SQL注入防护

### 6.2 前端安全
- XSS防护
- 敏感操作需要用户确认
- Prolific ID验证

### 6.3 API安全
- API路由验证用户身份
- 速率限制
- CORS配置

## 7. 实施步骤

1. 初始化Next.js项目，配置Tailwind CSS和shadcn/ui
2. 设置Supabase项目和数据库表
3. 配置环境变量
4. 实现入口页面（Instruction和同意流程）
5. 实现主任务界面布局
6. 实现信息显示框（含权限控制）
7. 实现任务提交框（含权限控制和实时保存）
8. 实现AI对话窗口（含缩回/展开功能）
9. 实现后端API路由
10. 实现GPT API集成
11. 实现问卷系统
12. 数据库集成和数据持久化
13. 部署到Vercel
14. 测试和优化

## 8. 部署计划

- 前端/后端：Vercel
- 数据库：Supabase
- 环境变量配置：Vercel dashboard
- 域名配置：可选

## 9. 后续扩展

- 提示词工程模块
- 多任务支持
- 数据分析面板
- A/B测试功能
