---
name: "frontend-development"
description: "提供前端开发的完整指南，包括项目结构、页面流程、表单处理、数据存储、API调用和用户体验优化等。适用于需要进行前端开发的开发场景。"
---

# 前端开发指南

## 1. 简介

### 1.1 前端概述
本项目前端使用Vite构建工具和纯JavaScript开发，包含多个HTML页面，用于实现人脸图像标注系统的用户界面。前端负责展示图像、收集用户标注、处理表单数据，并与后端API进行交互。

### 1.2 为什么选择Vite
- **快速启动**：Vite使用原生ESM，启动速度极快
- **热模块替换**：支持HMR，修改代码后立即更新
- **配置简单**：默认配置合理，开箱即用
- **生态友好**：支持多种前端框架和工具
- **构建优化**：使用Rollup进行构建，输出优化

### 1.3 适用场景
- 构建交互式网页应用
- 实现表单和数据收集
- 处理用户界面和用户体验
- 与后端API进行数据交互

## 2. 项目结构

### 2.1 目录结构
```
face-annotation-frontend/
  ├── api/                    # API调用封装
  │   ├── _lib/              # 共享库
  │   │   └── supabase.js   # Supabase客户端
  │   ├── annotation/        # 标注相关API
  │   │   ├── batch.js      # 批量提交API
  │   │   └── index.js      # 单条提交API
  │   ├── demographics.js    # 人口学数据API
  │   └── task.js           # 获取任务API
  ├── public/                # 静态资源
  │   └── index.html         # 默认入口页面
  ├── src/                   # 源代码
  │   ├── Attention_Check_Image/ # 注意力检查图像
  │   ├── Face_Images/       # 人脸图像
  │   ├── app.css            # 全局样式
  │   ├── app.js             # 主应用逻辑
  │   └── main.js            # 应用入口
  ├── annotation.html        # 标注页面
  ├── completion.html        # 完成页面
  ├── demographics.html      # 人口学信息页面
  ├── index.html             # 主入口页面
  ├── info-confirm.html      # 信息确认页面
  ├── common.js              # 共享功能
  ├── styles.css             # 全局样式
  ├── supplementary-questions.html # 补充问题页面
  ├── vercel.json            # Vercel配置
  ├── vite.config.js         # Vite配置
  ├── welcome-1.html         # 欢迎页面1
  └── welcome-2.html         # 欢迎页面2
```

### 2.2 页面流程
```
index.html → welcome-1.html → welcome-2.html → annotation.html → supplementary-questions.html → demographics.html → completion.html
                                      ↑              ↑
                                      |              |
                                      └──────────────┘
                              根据分组和使用情况决定是否跳过补充问题
```

### 2.3 文件职责
- **index.html**：主入口页面，通过iframe加载其他页面
- **welcome-1.html**：欢迎页面，展示研究信息和同意协议
- **welcome-2.html**：欢迎页面，展示标注说明和示例
- **annotation.html**：标注页面，展示人脸图像并收集标注
- **supplementary-questions.html**：补充问题页面，收集额外信息
- **demographics.html**：人口学信息页面，收集用户背景信息
- **completion.html**：完成页面，展示完成信息和跳转到Prolific
- **info-confirm.html**：信息确认页面，验证用户资格
- **common.js**：共享功能，包括confirm浮窗、用户信息管理等

## 3. 页面开发

### 3.1 HTML页面结构
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面标题</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <!-- 页面内容 -->
    </div>
    
    <script src="common.js" type="module"></script>
    <script>
        // 页面特定逻辑
    </script>
</body>
</html>
```

### 3.2 表单处理

#### 3.2.1 表单验证
```javascript
function validateForm() {
    let isValid = true;
    
    // 验证输入字段
    const input = document.getElementById('inputId').value;
    if (!input) {
        isValid = false;
        showError('inputId', '请填写此字段');
    }
    
    // 验证单选按钮
    const radioSelected = document.querySelector('input[name="radioName"]:checked');
    if (!radioSelected) {
        isValid = false;
        showError('radioError', '请选择一个选项');
    }
    
    return isValid;
}
```

#### 3.2.2 表单提交
```javascript
async function handleSubmit() {
    if (!validateForm()) {
        return;
    }
    
    // 显示加载状态
    showLoading();
    
    try {
        // 收集表单数据
        const formData = collectFormData();
        
        // 发送数据到后端
        const response = await fetch('/api/endpoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('提交失败');
        }
        
        // 跳转到下一个页面
        window.location.href = 'next-page.html';
    } catch (error) {
        console.error('提交失败:', error);
        showError('general', '提交失败，请重试');
    } finally {
        hideLoading();
    }
}
```

### 3.3 用户界面组件

#### 3.3.1 Confirm浮窗
```javascript
// 显示confirm浮窗
function showConfirmPopup(message, callback) {
    // 创建浮窗元素
    const popup = document.createElement('div');
    popup.className = 'confirm-popup';
    popup.innerHTML = `
        <div class="popup-content">
            <p>${message}</p>
            <div class="popup-buttons">
                <button class="popup-confirm">Yes</button>
                <button class="popup-cancel">Cancel</button>
            </div>
        </div>
    `;
    
    // 添加事件监听器
    popup.querySelector('.popup-confirm').addEventListener('click', () => {
        callback();
        popup.remove();
    });
    
    popup.querySelector('.popup-cancel').addEventListener('click', () => {
        popup.remove();
    });
    
    // 添加到页面
    document.body.appendChild(popup);
}
```

#### 3.3.2 加载状态
```javascript
// 显示加载状态
function showLoading() {
    const loading = document.getElementById('loadingMessage');
    if (loading) {
        loading.style.display = 'block';
    }
}

// 隐藏加载状态
function hideLoading() {
    const loading = document.getElementById('loadingMessage');
    if (loading) {
        loading.style.display = 'none';
    }
}
```

## 4. 数据存储

### 4.1 localStorage使用

#### 4.1.1 存储数据
```javascript
// 存储用户信息
localStorage.setItem('userInfo', JSON.stringify({
    birthYear: 1990,
    birthMonth: 1,
    birthDay: 1,
    country: 'United States'
}));

// 存储标注数据
localStorage.setItem('annotationTimestamp', new Date().toISOString());

// 存储分组信息
localStorage.setItem('group', '1');
```

#### 4.1.2 获取数据
```javascript
// 获取用户信息
const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

// 获取时间戳
const timestamp = localStorage.getItem('annotationTimestamp');

// 获取分组信息
const group = localStorage.getItem('group');
```

#### 4.1.3 删除数据
```javascript
// 删除用户信息
localStorage.removeItem('userInfo');

// 清空所有数据
localStorage.clear();
```

### 4.2 URL参数处理

#### 4.2.1 获取URL参数
```javascript
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        PROLIFIC_PID: params.get('PROLIFIC_PID'),
        STUDY_ID: params.get('STUDY_ID'),
        SESSION_ID: params.get('SESSION_ID')
    };
}
```

#### 4.2.2 保存URL参数到localStorage
```javascript
function saveUrlParamsToLocalStorage() {
    const params = getUrlParams();
    
    if (params.PROLIFIC_PID) {
        localStorage.setItem('prolificId', params.PROLIFIC_PID);
    }
    if (params.STUDY_ID) {
        localStorage.setItem('studyId', params.STUDY_ID);
    }
    if (params.SESSION_ID) {
        localStorage.setItem('sessionId', params.SESSION_ID);
    }
}
```

## 5. API调用

### 5.1 发送数据到后端

#### 5.1.1 单条提交
```javascript
async function submitAnnotation(data) {
    const response = await fetch('/api/annotation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '提交失败');
    }
    
    return await response.json();
}
```

#### 5.1.2 批量提交
```javascript
async function submitBatchAnnotations(batchData) {
    const response = await fetch('/api/annotation/batch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(batchData)
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '批量提交失败');
    }
    
    return await response.json();
}
```

#### 5.1.3 提交人口学数据
```javascript
async function submitDemographics(data) {
    const response = await fetch('/api/demographics', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '提交人口学数据失败');
    }
    
    return await response.json();
}
```

### 5.2 错误处理
```javascript
try {
    const result = await submitAnnotation(data);
    console.log('提交成功:', result);
} catch (error) {
    console.error('提交失败:', error);
    alert('提交失败，请重试');
}
```

## 6. 图像处理

### 6.1 图像加载
```javascript
function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('图像加载失败'));
        img.src = url;
    });
}
```

### 6.2 图像显示
```javascript
async function displayImage(url) {
    try {
        const img = await loadImage(url);
        const container = document.getElementById('imageContainer');
        container.innerHTML = '';
        container.appendChild(img);
    } catch (error) {
        console.error('图像显示失败:', error);
        document.getElementById('imageContainer').innerHTML = '<p>图像加载失败</p>';
    }
}
```

### 6.3 图像标注
```javascript
// 收集标注结果
const annotationResult = {
    image_url: currentImageUrl,
    gender: selectedGender,
    race: selectedRace,
    skin: selectedSkin,
    duration: timeSpent
};

// 保存到结果数组
imageResults.push(annotationResult);
```

## 7. 用户体验优化

### 7.1 表单验证反馈
```javascript
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        element.classList.add('show');
    }
}

function hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = '';
        element.style.display = 'none';
        element.classList.remove('show');
    }
}
```

### 7.2 加载状态提示
```html
<div class="loading" id="loadingMessage">Processing your submission...</div>
```

```css
.loading {
    text-align: center;
    font-size: 18px;
    color: #666;
    margin-top: 20px;
    display: none;
}
```

### 7.3 页面过渡动画
```css
.container {
    transition: opacity 0.3s ease;
}

.container.fade-out {
    opacity: 0;
}

.container.fade-in {
    opacity: 1;
}
```

### 7.4 响应式设计
```css
@media (max-width: 768px) {
    .container {
        padding: 20px;
    }
    
    h1 {
        font-size: 1.8rem;
    }
}
```

## 8. 测试和调试

### 8.1 控制台调试
```javascript
// 添加调试日志
console.log('用户信息:', userInfo);
console.log('标注结果:', annotationResult);
console.log('URL参数:', getUrlParams());

// 使用debugger语句
debugger;
```

### 8.2 网络请求调试
1. 打开浏览器开发者工具（F12）
2. 切换到Network面板
3. 观察API请求和响应
4. 检查请求参数和响应数据

### 8.3 单元测试
```javascript
// 使用Jest编写测试用例
test('validateForm 应该验证必填字段', () => {
    // 模拟表单数据
    document.getElementById('inputId').value = '';
    
    // 调用验证函数
    const result = validateForm();
    
    // 验证结果
    expect(result).toBe(false);
});
```

## 9. 最佳实践

### 9.1 代码组织
- 将共享功能提取到common.js
- 使用模块化方式组织代码
- 添加适当的注释
- 遵循代码规范

### 9.2 性能优化
- 使用批量提交减少API请求
- 优化图像加载和显示
- 减少DOM操作
- 使用事件委托

### 9.3 安全配置
- 验证所有输入数据
- 避免使用eval()
- 使用HTTPS（部署时）
- 保护敏感信息

### 9.4 用户体验
- 添加表单验证反馈
- 显示加载状态
- 提供清晰的错误提示
- 确保页面响应式

### 9.5 可维护性
- 使用一致的命名规范
- 编写清晰的注释
- 保持代码简洁
- 定期清理无用代码

## 10. 项目案例

### 10.1 标注页面表单处理
```javascript
// 处理标注提交
async function submitResults() {
    try {
        // 更新浮窗消息
        updateConfirmPopupMessage('Please do not leave this page...', true, true);
        
        // 显示加载状态
        document.getElementById('loadingMessage').style.display = 'block';
        
        // 构建批量提交数据
        const batchData = [];
        for (const result of imageResults) {
            const url = result.image_url;
            const match = url.match(/(\d+)\.jpg/i);
            const face_id = match ? parseInt(match[1]) : 0;
            
            const annotationData = {
                prolific_id: workerId || 'unknown',
                study_id: studyId,
                session_id: sessionId,
                face_id: face_id,
                gender_annotation: result.gender,
                race_annotation: result.race,
                skin_color_annotation: result.skin,
                duration: result.duration,
                group: group,
                timestamp: localStorage.getItem('annotationTimestamp')
            };
            
            batchData.push(annotationData);
        }
        
        // 发送批量数据
        const response = await fetch('/api/annotation/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batchData)
        });
        
        if (!response.ok) {
            throw new Error('批量提交失败');
        }
        
        // 保存数据到localStorage
        localStorage.setItem('imageResults', JSON.stringify(imageResults));
        
        // 延迟跳转
        setTimeout(() => {
            hideConfirmPopup();
            window.location.href = 'demographics.html';
        }, 2000);
        
    } catch (error) {
        console.error('提交失败:', error);
        alert('数据提交失败，请重试');
    }
}
```

### 10.2 人口学信息页面数据收集
```javascript
async function handleSubmit() {
    if (!validateForm()) {
        return;
    }
    
    document.getElementById('loadingMessage').style.display = 'block';
    
    try {
        // 收集表单数据
        const formData = new FormData(document.getElementById('demographicsForm'));
        const demographicsData = {};
        
        // 处理表单字段
        demographicsData.gender = formData.get('gender');
        demographicsData.skin = formData.get('skin');
        demographicsData.state = formData.get('state');
        demographicsData.education = formData.get('education');
        
        // 获取用户信息
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        
        // 构建后端数据
        const backendData = {
            prolific_id: localStorage.getItem('workerId'),
            study_id: localStorage.getItem('studyId'),
            session_id: localStorage.getItem('sessionId'),
            group: parseInt(localStorage.getItem('group')),
            birthYear: userInfo.birthYear,
            birthMonth: userInfo.birthMonth,
            birthDay: userInfo.birthDay,
            residenceCountry: userInfo.country,
            ...demographicsData
        };
        
        // 发送数据
        const response = await fetch('/api/demographics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(backendData)
        });
        
        if (!response.ok) {
            throw new Error('提交失败');
        }
        
        // 跳转到完成页面
        window.location.href = 'completion.html';
        
    } catch (error) {
        console.error('提交失败:', error);
        alert('Failed to submit demographic information. Please try again.');
    } finally {
        document.getElementById('loadingMessage').style.display = 'none';
    }
}
```

## 11. 总结

通过本文档的指南，您应该能够：
- 理解前端项目的结构和页面流程
- 掌握表单处理和数据收集方法
- 实现数据存储和API调用
- 优化用户体验和界面设计
- 应用最佳实践提升开发效率

希望这些指南能够帮助您在后续项目中更顺利、更高效地进行前端开发。