# Demographics Survey - 人口学信息调查问卷模块

## 概述

本SKILL提供了一套完整的人口学信息调查问卷开发解决方案，包括问题设计、数据收集、表单验证、格式转换、后端API和数据库存储。适用于需要收集用户人口学信息的研究项目、用户调查、数据标注平台等场景。

---

## 核心功能

| 功能模块 | 描述 | 关键技术 |
|---------|------|---------|
| **问题设计** | 支持单选、多选、下拉框、滑块、颜色色卡、条件显示、带其他选项的文本输入 | HTML5表单 + CSS样式 |
| **表单验证** | 前端实时验证、顺序验证、条件验证、自定义错误提示 | JavaScript |
| **数据格式转换** | 状态缩写→全称、多选数组→字符串、类型转换（parseInt/null处理） | 前后端映射表 |
| **数据传输** | fetch API POST、JSON序列化、localStorage临时存储 | Fetch API |
| **后端处理** | Express.js路由、数据验证、格式转换、Supabase插入 | Express + Supabase |
| **用户确认** | 提交前确认浮窗、资格验证（年龄/国家）、资格不符提示 | Modal弹窗 |

---

## 快速开始

### 1. 复制模板文件

```bash
# 复制前端表单模板
cp templates/frontend-form.html your-project/frontend/demographics.html

# 复制后端API模板
cp templates/backend-api.js your-project/backend/src/routes/demographics.js

# 复制数据库Schema（在Supabase中执行）
# templates/database-schema.sql

# 复制数据映射表
cp templates/data-maps.js your-project/backend/src/utils/data-maps.js
```

### 2. 后端集成

在 `app.js` 中引入路由：

```javascript
const demographicsRoutes = require('./routes/demographics');
app.use('/api', demographicsRoutes);
```

### 3. 配置环境变量

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 问题类型详解

### 1. 单选题 (Radio Button)

**适用场景**：性别、是否某国出生、政治党派等互斥选项

```html
<div class="question-section">
    <div class="question">1. What is your gender?</div>
    <div class="option-group">
        <div class="option">
            <input type="radio" id="gender-man" name="gender" value="man" required>
            <label for="gender-man">(a) Male</label>
        </div>
        <div class="option">
            <input type="radio" id="gender-woman" name="gender" value="woman">
            <label for="gender-woman">(b) Female</label>
        </div>
    </div>
    <div class="error-message" id="gender-error"></div>
</div>
```

**关键要素**：
- 所有选项 `name` 属性相同
- 第一个选项加 `required` 属性（HTML原生验证）
- 每个问题配独立的 `error-message` 元素

**验证代码**：
```javascript
const genderSelected = document.querySelector('input[name="gender"]:checked');
if (!genderSelected) {
    document.getElementById('gender-error').textContent = 'Please select your gender.';
    document.getElementById('gender-error').style.display = 'block';
    isValid = false;
}
```

---

### 2. 多选题 (Checkbox)

**适用场景**：种族、原因选择等可多选选项

```html
<div class="question-section">
    <div class="question">2. What is your race? (Select all that apply.)</div>
    <div class="option-group">
        <div class="option">
            <input type="checkbox" id="race-asian" name="race" value="asian">
            <label for="race-asian">(a) Asian</label>
        </div>
        <div class="option">
            <input type="checkbox" id="race-white" name="race" value="white">
            <label for="race-white">(b) White</label>
        </div>
    </div>
    <div class="error-message" id="race-error">Please select at least one option.</div>
    
    <!-- 条件问题：多选时要求选最认同的 -->
    <div id="race-primary-section" class="hidden">
        <div class="question">2a. Which race do you identify most with?</div>
        <div class="option-group">
            <!-- 单选题，id和name用"race-primary" -->
        </div>
    </div>
</div>
```

**条件显示逻辑**：
```javascript
function handleRaceChange() {
    const selectedRaces = document.querySelectorAll('input[name="race"]:checked');
    const section = document.getElementById('race-primary-section');
    
    if (selectedRaces.length > 1) {
        section.classList.remove('hidden');
        // 设置条件问题为必填
        document.querySelectorAll('input[name="race-primary"]').forEach(r => {
            r.setAttribute('required', 'required');
        });
    } else {
        section.classList.add('hidden');
        document.querySelectorAll('input[name="race-primary"]').forEach(r => {
            r.removeAttribute('required');
            r.checked = false;
        });
    }
}

// 绑定事件
document.querySelectorAll('input[name="race"]').forEach(cb => {
    cb.addEventListener('change', handleRaceChange);
});
```

**数据收集**：
```javascript
const selectedRaces = document.querySelectorAll('input[name="race"]:checked');
demographicsData.races = Array.from(selectedRaces).map(cb => cb.value);
```

---

### 3. 下拉框 (Select)

**适用场景**：国家、州/省、出生年月日、移民年份等长列表选择

```html
<!-- 静态选项：美国州 -->
<select id="state" name="state" required>
    <option value="">Please select a state</option>
    <option value="AL">Alabama</option>
    <option value="AK">Alaska</option>
    <!-- ... 更多选项 -->
</select>

<!-- 动态选项：年份 -->
<select id="immigration-year" name="immigration-year">
    <option value="">Please select a year</option>
    <!-- 通过JS生成 -->
</select>
```

**动态生成年份选项**：
```javascript
function generateYearOptions(selectId, startYear, endYear) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Please select</option>';
    for (let year = endYear; year >= startYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
    }
}

// 使用：生成1900-2026年的移民年份
generateYearOptions('immigration-year', 1900, 2026);
```

**动态生成日期（考虑闰年和大小月）**：
```javascript
function generateDayOptions() {
    const year = parseInt(document.getElementById('birthYear').value);
    const month = parseInt(document.getElementById('birthMonth').value);
    const select = document.getElementById('birthDay');
    select.innerHTML = '<option value="">Day</option>';
    
    if (!year || !month) return;
    
    let daysInMonth;
    if (month === 2) {
        const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        daysInMonth = isLeapYear ? 29 : 28;
    } else if ([4, 6, 9, 11].includes(month)) {
        daysInMonth = 30;
    } else {
        daysInMonth = 31;
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day;
        select.appendChild(option);
    }
}

// 绑定：年月变化时重新生成日期
document.getElementById('birthYear').addEventListener('change', generateDayOptions);
document.getElementById('birthMonth').addEventListener('change', generateDayOptions);
```

---

### 4. 滑块 (Range Slider)

**适用场景**：收入等级、满意度评分等连续数值

```html
<div class="slider-container">
    <input type="range" min="1" max="10" class="slider" id="income" name="income">
    <div class="slider-value" id="income-value"></div>
    <div style="display: flex; justify-content: space-between; color: #6c757d;">
        <span>Lowest Group</span>
        <span>Highest Group</span>
    </div>
</div>
```

**滑块实时显示值**：
```javascript
const slider = document.getElementById('income');
const display = document.getElementById('income-value');
display.textContent = ''; // 初始为空，强制用户拖动

slider.addEventListener('input', function() {
    display.textContent = this.value;
});
```

**验证滑块是否已操作**：
```javascript
const incomeDisplay = document.getElementById('income-value').textContent;
if (!incomeDisplay) {
    document.getElementById('income-error').textContent = 'Please select a value.';
    document.getElementById('income-error').style.display = 'block';
    isValid = false;
}
```

---

### 5. 颜色色卡 (Monk Skin Tone Scale)

**适用场景**：肤色选择等视觉化选项

```html
<div class="monk-scale">
    <div class="monk-scale-item">
        <div class="monk-scale-color" style="background-color: #f6ede4;"></div>
        <div class="option">
            <input type="radio" id="skin-1" name="skin" value="1" required>
            <label for="skin-1" class="monk-scale-label">1</label>
        </div>
    </div>
    <!-- ... 2-10号色卡 -->
</div>
```

**Monk Scale 10色调色板**：
| 编号 | Hex颜色 | 描述 |
|-----|---------|------|
| 1 | #f6ede4 | Very light |
| 2 | #f3e7db | Light |
| 3 | #f7ead0 | Light medium |
| 4 | #eadaba | Medium |
| 5 | #d7bd96 | Medium dark |
| 6 | #a07e56 | Dark |
| 7 | #825c43 | Very dark |
| 8 | #604134 | Extremely dark |
| 9 | #3a312a | Almost black |
| 10 | #292420 | Black |

---

### 6. 带"其他"选项的文本输入

**适用场景**：多选题有"Other"选项需要用户填写具体内容

```html
<div class="option">
    <input type="checkbox" id="reason-g" name="reasons" value="g">
    <label for="reason-g">(g) Other</label>
</div>
<input type="text" id="reason-other" class="other-input" 
       placeholder="Please specify" style="display: none;">
```

**显示/隐藏逻辑**：
```javascript
document.getElementById('reason-g').addEventListener('change', function() {
    const otherInput = document.getElementById('reason-other');
    otherInput.style.display = this.checked ? 'block' : 'none';
    if (!this.checked) otherInput.value = '';
});
```

---

## 表单验证最佳实践

### 验证原则

1. **顺序验证**：按问题出现顺序验证，只显示第一个错误
2. **条件验证**：根据前置问题判断是否需要验证后续问题
3. **隐藏所有错误**：每次验证前先隐藏所有错误信息
4. **滚动到错误**：验证失败后自动滚动到第一个错误字段

```javascript
function validateForm() {
    let isValid = true;
    let firstErrorField = null;
    
    // 1. 隐藏所有错误
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
        el.textContent = '';
    });
    
    // 2. 按顺序验证每个字段
    // 验证性别
    if (!document.querySelector('input[name="gender"]:checked')) {
        if (!firstErrorField) {
            document.getElementById('gender-error').textContent = 'Please select...';
            document.getElementById('gender-error').style.display = 'block';
            firstErrorField = 'gender';
        }
        isValid = false;
    }
    
    // ... 验证其他字段
    
    // 3. 滚动到第一个错误
    if (firstErrorField) {
        document.getElementById('general-error').style.display = 'block';
        const errorEl = document.querySelector(`#${firstErrorField}-error`);
        if (errorEl) errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    return isValid;
}
```

---

## 资格验证（Eligibility Check）

**适用场景**：筛选年龄18-64岁、美国居民等资格条件

```javascript
function calculateAge(birthYear, birthMonth, birthDay) {
    const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function validateEligibility() {
    const birthYear = parseInt(document.getElementById('birthYear').value);
    const birthMonth = parseInt(document.getElementById('birthMonth').value);
    const birthDay = parseInt(document.getElementById('birthDay').value);
    const country = document.getElementById('country').value;
    
    const age = calculateAge(birthYear, birthMonth, birthDay);
    const isAgeEligible = age >= 18 && age <= 64;
    const isCountryEligible = country === 'United States';
    
    return {
        eligible: isAgeEligible && isCountryEligible,
        ageEligible: isAgeEligible,
        countryEligible: isCountryEligible,
        age: age
    };
}

// 使用：资格不符时阻止继续
const eligibility = validateEligibility();
if (!eligibility.eligible) {
    showConfirmPopup(
        'Based on the information provided, you are ineligible to participate...',
        null,  // 没有Yes回调
        true   // 只显示关闭按钮
    );
    return false;
}
```

---

## 数据收集与格式转换

### 前端数据收集

```javascript
function collectFormData() {
    const form = document.getElementById('demographicsForm');
    const formData = new FormData(form);
    const data = {};
    
    // 单选和下拉
    data.gender = formData.get('gender');
    data.skin = formData.get('skin');
    data.state = formData.get('state');
    data.education = formData.get('education');
    data.income = formData.get('income');
    data.politics = formData.get('politics');
    data.politicalScale = formData.get('political-scale');
    
    // 可选字段（条件问题）
    if (formData.get('immigration-year')) {
        data.immigrationYear = formData.get('immigration-year');
    }
    
    // 多选：数组
    const selectedRaces = document.querySelectorAll('input[name="race"]:checked');
    data.races = Array.from(selectedRaces).map(cb => cb.value);
    
    // 条件单选
    const racePrimary = formData.get('race-primary');
    if (racePrimary) data.racePrimary = racePrimary;
    
    return data;
}
```

### 前端→后端 数据准备

```javascript
async function prepareBackendData(demographicsData) {
    // 从localStorage获取上下文数据
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const supplementary = JSON.parse(localStorage.getItem('supplementaryData') || '{}');
    const workerId = localStorage.getItem('workerId') || 'unknown';
    const studyId = localStorage.getItem('studyId') || 'unknown';
    const sessionId = localStorage.getItem('sessionId') || 'unknown';
    const group = localStorage.getItem('group') || 1;
    
    // 转换"其他原因"选项为可读文本
    const reasonMap = {
        'a': 'Image quality issue',
        'b': 'Uncertain between categories',
        'c': 'Belonged to multiple categories',
        'g': 'Other'
    };
    const reasonsText = convertReasonsToText(
        supplementary.reasons,
        supplementary.otherText,
        reasonMap
    );
    
    return {
        // 追踪ID
        prolific_id: workerId,
        study_id: studyId,
        session_id: sessionId,
        group: parseInt(group),
        
        // 出生日期
        birthYear: userInfo.birthYear ? parseInt(userInfo.birthYear) : null,
        birthMonth: userInfo.birthMonth ? parseInt(userInfo.birthMonth) : null,
        birthDay: userInfo.birthDay ? parseInt(userInfo.birthDay) : null,
        residenceCountry: userInfo.country || null,
        
        // 人口学数据
        gender: demographicsData.gender,
        race: demographicsData.races.join(', '),  // 数组→逗号分隔字符串
        racePrimary: demographicsData.racePrimary || null,
        skinTone: demographicsData.skin,
        residenceState: demographicsData.state,
        education: demographicsData.education,
        income: parseInt(demographicsData.income),
        bornUs: demographicsData.bornUs,
        immigrationYear: demographicsData.immigrationYear ? parseInt(demographicsData.immigrationYear) : null,
        politics: demographicsData.politics,
        politicalScale: demographicsData.politicalScale,
        
        // 补充数据
        otherReasonsText: reasonsText,
        
        // 时间戳
        timestamp: localStorage.getItem('annotationTimestamp') || new Date().toISOString()
    };
}

// 工具函数：转换原因数组为可读文本
function convertReasonsToText(reasons, otherText, reasonMap) {
    if (!Array.isArray(reasons) || reasons.length === 0) return null;
    return reasons.map(r => {
        const text = reasonMap[r] || r;
        if (r === 'g') return `(${r}) ${text}${otherText ? `: ${otherText}` : ''}`;
        return `(${r}) ${text}`;
    }).join(', ');
}
```

### 数据发送到后端

```javascript
async function submitDemographics() {
    // 1. 验证表单
    if (!validateForm()) return;
    
    // 2. 显示加载状态
    document.getElementById('loadingMessage').style.display = 'block';
    document.getElementById('submitButton').disabled = true;
    
    try {
        // 3. 收集和准备数据
        const formData = collectFormData();
        const backendData = await prepareBackendData(formData);
        
        // 4. 保存到localStorage（备用）
        localStorage.setItem('demographicsData', JSON.stringify(formData));
        
        // 5. 发送API请求
        const response = await fetch('/api/demographics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(backendData)
        });
        
        // 6. 处理响应
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to submit data');
        }
        
        // 7. 跳转下一页
        window.location.href = 'completion.html';
        
    } catch (error) {
        console.error('提交失败:', error);
        alert('Failed to submit. Please try again.');
        document.getElementById('loadingMessage').style.display = 'none';
        document.getElementById('submitButton').disabled = false;
    }
}
```

---

## 后端API实现（Express + Supabase）

### 完整的POST路由

```javascript
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// 引入数据映射表
const { stateMap, educationMap, genderMap, raceMap, skinToneMap, politicalScaleMap } = require('../utils/data-maps');

/**
 * POST /api/demographics
 * 提交人口学调查问卷数据
 * 
 * 请求体字段（参考 templates/database-schema.sql）
 */
router.post('/demographics', async (req, res) => {
    try {
        const data = req.body;
        
        // ========== 1. 默认值填充 ==========
        data.prolific_id = data.prolific_id || 'unknown';
        data.study_id = data.study_id || 'unknown';
        data.session_id = data.session_id || 'unknown';
        data.group = data.group || 1;
        
        // ========== 2. 缩写→全称转换 ==========
        data.residenceState = stateMap[data.residenceState] || data.residenceState;
        data.education = educationMap[data.education] || data.education;
        data.politicalScale = politicalScaleMap[data.politicalScale] || data.politicalScale;
        data.gender = genderMap[data.gender] || data.gender;
        data.skinTone = skinToneMap[data.skinTone] || data.skinTone;
        
        // 种族（多选，逗号分隔）分别转换
        if (data.race) {
            data.race = data.race.split(', ').map(r => raceMap[r] || r).join(', ');
        }
        if (data.racePrimary) {
            data.racePrimary = raceMap[data.racePrimary] || data.racePrimary;
        }
        
        // ========== 3. 可选字段null处理 ==========
        data.birthYear = data.birthYear || null;
        data.birthMonth = data.birthMonth || null;
        data.birthDay = data.birthDay || null;
        data.residenceCountry = data.residenceCountry || null;
        data.immigrationYear = data.immigrationYear || null;
        data.racePrimary = data.racePrimary || null;
        data.otherReasonsText = data.otherReasonsText || null;
        data.unsureReasonsText = data.unsureReasonsText || null;
        
        // ========== 4. 时间戳 ==========
        if (!data.timestamp) {
            data.timestamp = new Date().toISOString();
        }
        
        // ========== 5. 数据库插入 ==========
        console.log('[Demographics] 准备插入的数据:', JSON.stringify(data, null, 2));
        
        const { error } = await supabase
            .from('face_annotation_demographics')
            .insert(data);
        
        if (error) {
            console.error('[Demographics] 数据库插入错误:', error);
            return res.status(500).json({
                error: '保存人口学数据失败',
                details: error.message || 'Unknown error'
            });
        }
        
        console.log('[Demographics] ✅ 数据保存成功');
        res.status(201).json({ message: '人口学数据保存成功' });
        
    } catch (error) {
        console.error('[Demographics] 服务器异常:', error);
        res.status(500).json({
            error: '服务器内部错误',
            details: error.message || 'Unknown error'
        });
    }
});

module.exports = router;
```

---

## 数据库Schema（Supabase PostgreSQL）

```sql
-- 人口学调查问卷表
create table if not exists public.face_annotation_demographics (
    id bigint generated always as identity primary key,
    created_at timestamptz not null default timezone('utc'::text, now()),
    
    -- 追踪ID（与标注表关联）
    prolific_id text not null default 'unknown'::text,
    study_id text not null default 'unknown'::text,
    session_id text not null default 'unknown'::text,
    "group" smallint not null default 1,
    
    -- 基础信息（来自info-confirm）
    "birthYear" smallint,
    "birthMonth" smallint,
    "birthDay" smallint,
    "residenceCountry" text,
    
    -- 人口学核心数据
    gender text,
    race text,
    "racePrimary" text,
    "skinTone" text,
    "residenceState" text,
    education text,
    income smallint,
    "bornUs" text,
    "immigrationYear" smallint,
    politics text,
    "politicalScale" text,
    "socialInteraction" text,
    
    -- 补充问题数据（来自supplementary-questions）
    "otherReasonsText" text,
    "unsureReasonsText" text,
    
    -- 时间戳
    "timestamp" text
);

-- 创建索引加速查询
create index if not exists idx_demographics_prolific_id on public.face_annotation_demographics(prolific_id);
create index if not exists idx_demographics_study_id on public.face_annotation_demographics(study_id);
create index if not exists idx_demographics_session_id on public.face_annotation_demographics(session_id);

-- 启用行级安全（可选）
-- alter table public.face_annotation_demographics enable row level security;
```

---

## CSS样式模板

```css
/* 容器 */
.container {
    max-width: 800px;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 40px;
}

/* 问题区块 */
.question-section {
    margin-bottom: 30px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 6px;
    border-left: 4px solid #3498db;
}

.question {
    font-weight: 600;
    margin-bottom: 15px;
    color: #2c3e50;
    font-size: 1.1rem;
}

/* 选项组 */
.option-group {
    margin-left: 20px;
}

.option {
    margin-bottom: 12px;
    display: flex;
    align-items: center;
}

.option input[type="radio"],
.option input[type="checkbox"] {
    margin-right: 10px;
    transform: scale(1.2);
}

/* 下拉框 */
select {
    width: 100%;
    padding: 10px;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #fff;
    margin-top: 10px;
}

/* 滑块 */
.slider-container { margin-top: 20px; }
.slider {
    width: 100%;
    height: 15px;
    border-radius: 5px;
    background: #ddd;
    outline: none;
}
.slider::-webkit-slider-thumb {
    appearance: none;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #3498db;
    cursor: pointer;
}
.slider-value {
    text-align: center;
    margin-top: 10px;
    font-weight: bold;
    font-size: 1.2rem;
    color: #3498db;
}

/* 颜色色卡 */
.monk-scale {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-top: 15px;
}
.monk-scale-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
}
.monk-scale-color {
    width: 40px;
    height: 60px;
    border-radius: 4px;
    border: 2px solid #333;
}

/* 错误提示 */
.error-message {
    color: #e74c3c;
    font-size: 0.9rem;
    margin-top: 10px;
    display: none;
}

/* 其他输入框 */
.other-input {
    margin-left: 30px;
    margin-top: 10px;
    padding: 8px 12px;
    width: 100%;
    max-width: 500px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
}

/* 隐藏类 */
.hidden { display: none; }

/* 加载 */
.loading {
    text-align: center;
    font-size: 18px;
    color: #666;
    margin-top: 20px;
    display: none;
}

/* 响应式 */
@media (max-width: 768px) {
    .container { padding: 20px; }
    .monk-scale { justify-content: center; }
    .option-group { margin-left: 10px; }
}
```

---

## 常用问题模板库

### 标准人口学问题（可直接复制）

| 编号 | 问题 | 类型 |
|-----|------|------|
| Q1 | What is your gender? | 单选：Man/Woman/Nonbinary/Transgender |
| Q2 | What is your race? (Select all) | 多选 + 条件单选（最认同的） |
| Q3 | What is your skin tone? | Monk Scale色卡10选1 |
| Q4 | Country of residence | 下拉框 |
| Q5 | U.S. state of residence | 下拉框（50州+DC+PR） |
| Q6 | Highest education level | 单选：7级教育程度 |
| Q7 | Household income group | 滑块1-10 |
| Q8 | Born in the U.S.? | 单选 + 条件（移民年份） |
| Q9 | Political party affiliation | 单选：6种党派 |
| Q10 | Political orientation (1-7) | 单选：7点自由-保守量表 |
| Q11 | Cross-race social interaction frequency | 单选：6种频率 |

---

## 常见错误排查

| 错误现象 | 原因 | 解决方案 |
|---------|------|---------|
| 提交后数据都是unknown | localStorage中的追踪ID未正确设置 | 检查前一页是否保存了workerId/studyId/sessionId |
| 多选的race数据库里是object而不是string | 前端忘记join数组 | `race: data.races.join(', ')` |
| 条件问题（移民年份）保存了空值 | 前端未判断条件，直接传空字符串 | 后端 `data.immigrationYear = data.immigrationYear \|\| null` |
| 日期显示Invalid Date | parseInt空字符串是NaN，Supabase不接受 | 前端判断后传null：`birthYear: year ? parseInt(year) : null` |
| 滑块未操作也能提交 | 初始value有值 | 初始设为空，通过input事件赋值：`display.textContent = ''` |
| 数据库插入失败：null violates not-null | 表有必填约束但数据为null | 要么在schema设default，要么后端设默认值 |
| "缺少必要字段" 400错误 | 后端验证和前端字段名不一致 | 检查前后端字段名拼写（驼峰vs下划线） |

---

## 模板文件索引

| 文件 | 路径 | 描述 |
|------|------|------|
| 前端表单模板 | `templates/frontend-form.html` | 包含所有10种问题类型的完整可运行HTML |
| 后端API模板 | `templates/backend-api.js` | Express路由 + 数据验证转换 + Supabase插入 |
| 数据映射表 | `templates/data-maps.js` | 所有缩写→全称的完整映射表 |
| 数据库Schema | `templates/database-schema.sql` | 建表SQL + 索引 + 注释 |
| CSS样式 | `templates/styles.css` | 问题区块、选项、滑块、色卡等样式 |

在其他项目中使用时，按以下步骤：
1. 复制5个模板文件
2. 在问题模板库的基础上增删问题
3. 修改数据库表名和字段名（如有需要）
4. 修改数据映射表（如自定义选项值）
5. 测试表单验证→数据收集→API请求→数据库插入 全链路
