---
name: "clean-pro-ui"
description: "提供简洁专业的前端UI风格配置，基于Next.js + shadcn/ui + Tailwind CSS。适用于研究平台和通用Web项目。"
---

# Clean Pro UI 风格指南

基于 AI Collaboration Meaningful Work 项目的前端风格沉淀，提供一套简洁、专业的 UI 设计规范和实现方案。

## 技术栈

- **框架**: Next.js 14.2+ (App Router)
- **语言**: TypeScript 5.x
- **样式**: Tailwind CSS 3.4+
- **组件库**: shadcn/ui
- **图标**: Lucide React
- **状态管理**: Zustand (可选)

## 设计规范

### 色彩系统

使用 CSS 变量定义主题色彩，支持明暗模式切换：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  
  --radius: 0.5rem;
}
```

### 字体

使用 Google Fonts 的 Inter 字体：

```tsx
const inter = Inter({ subsets: ["latin"] });
```

### 间距与布局

- 容器最大宽度：1400px (2xl)
- 默认容器内边距：2rem
- 圆角：使用 `--radius` 变量统一控制

## 核心组件

### 导航栏 (Navigation)

简洁的顶部导航，包含标题、任务标签和计时器：

```tsx
<nav className="bg-white border-b border-gray-200 px-6 py-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <h1 className="text-xl font-bold text-gray-900">Title</h1>
      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
        Tag
      </span>
    </div>
    <div className="flex items-center gap-4">
      {/* 右侧元素 */}
    </div>
  </div>
</nav>
```

### 卡片布局 (Card)

使用 shadcn/ui 的 Card 组件构建内容区域：

```tsx
<Card className="h-full flex flex-col">
  <CardHeader className="pb-3 flex-shrink-0">
    <CardTitle className="text-lg font-semibold">Title</CardTitle>
  </CardHeader>
  <CardContent className="flex-1 overflow-y-auto">
    {/* 内容 */}
  </CardContent>
</Card>
```

### 按钮变体 (Button)

支持多种变体和尺寸：

```tsx
// 主要按钮
<Button variant="default">Primary</Button>

// 次要按钮
<Button variant="secondary">Secondary</Button>

// 幽灵按钮
<Button variant="ghost">Ghost</Button>

// 轮廓按钮
<Button variant="outline">Outline</Button>

// 图标按钮
<Button size="icon"><Icon className="h-4 w-4" /></Button>
```

### 输入组件 (Input/Textarea)

统一的输入样式：

```tsx
<Input placeholder="Enter text..." />
<Textarea placeholder="Enter longer text..." className="min-h-[200px] resize-none" />
```

## 布局模式

### 三栏布局

适用于任务页面，包含信息展示、输入区域和侧边栏：

```tsx
<div className="flex h-[calc(100vh-65px)]">
  {/* 左侧信息区 - 40% */}
  <div className="w-[40%] p-4 border-r border-gray-200 overflow-hidden">
    <InfoDisplay content={taskContent} allowCopy={allowCopy} />
  </div>
  
  {/* 中间输入区 - 40% */}
  <div className="w-[40%] p-4 border-r border-gray-200 overflow-hidden">
    <TaskInput allowPaste={allowPaste} />
  </div>
  
  {/* 右侧聊天区 - 20% */}
  <div className="w-[20%] p-4 overflow-hidden">
    <ChatWindow />
  </div>
</div>
```

### 单栏居中布局

适用于表单、调查等页面：

```tsx
<div className="min-h-screen flex items-center justify-center p-4">
  <div className="w-full max-w-2xl">
    <Card>
      <CardHeader>
        <CardTitle>Form Title</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 表单内容 */}
      </CardContent>
    </Card>
  </div>
</div>
```

## 动画效果

- 平滑滚动：`scroll-smooth`
- 渐入动画：使用 Tailwind CSS Animate 插件
- 消息加载动画：`animate-spin`

## 代码规范

### 文件结构

```
src/
├── app/              # 页面路由
├── components/
│   ├── ui/           # shadcn/ui 组件
│   └── business/     # 业务组件
├── lib/              # 工具函数和状态管理
└── utils/            # 工具类
```

### 命名约定

- 组件：PascalCase
- 文件：kebab-case
- 变量：camelCase
- 常量：UPPER_CASE

### 状态管理

使用 Zustand 进行全局状态管理：

```tsx
import { create } from 'zustand'

interface AppStore {
  value: string
  setValue: (value: string) => void
}

const useAppStore = create<AppStore>((set) => ({
  value: '',
  setValue: (value) => set({ value }),
}))
```

## 快速开始

### 1. 初始化 Next.js 项目

```bash
npx create-next-app@14.2.3 . --typescript
```

### 2. 安装依赖

```bash
npm install tailwindcss @tailwindcss/vite lucide-react zustand
npm install -D @types/node
```

### 3. 配置 Tailwind CSS

参考项目的 `tailwind.config.ts` 和 `globals.css`

### 4. 初始化 shadcn/ui

```bash
npx shadcn@latest init -y -b slate
```

### 5. 添加组件

```bash
npx shadcn@latest add button card input textarea dialog label checkbox radio-group badge
```

## 适用场景

- 学术研究平台
- 用户实验系统
- 数据收集工具
- 通用 Web 应用
- AI 协作界面

## 最佳实践

1. 使用 CSS 变量定义主题，便于全局调整
2. 优先使用 shadcn/ui 组件，保持风格一致
3. 使用 `cn()` 工具函数组合类名
4. 保持组件职责单一，便于复用
5. 使用 TypeScript 确保类型安全
6. 响应式设计优先考虑移动端体验

## 参考资源

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev/icons)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
