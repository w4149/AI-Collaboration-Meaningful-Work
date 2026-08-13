/**
 * Demographics Survey - Backend API Route
 * 人口学调查问卷后端API路由
 * 
 * 集成方式：
 * 1. 在 app.js 中： const demographicsRoutes = require('./routes/demographics');
 * 2. 然后： app.use('/api', demographicsRoutes);
 * 
 * 依赖：
 *  - express
 *  - @supabase/supabase-js
 *  - ../utils/data-maps.js (同目录下的映射表)
 */

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// ===== 导入数据映射表 =====
// 如需自定义，修改 ../utils/data-maps.js 中的内容
const {
    stateMap,
    educationMap,
    genderMap,
    raceMap,
    skinToneMap,
    politicalScaleMap,
    politicsMap,
    bornUsMap,
    socialInteractionMap
} = require('../utils/data-maps');

// ===== Supabase 客户端初始化 =====
// 建议在 app.js 中全局初始化后通过参数传入，避免重复创建
let supabase;
function getSupabase() {
    if (!supabase) {
        const url = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
        const anonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
        if (!url || url.includes('your-project')) {
            console.warn('[Demographics] SUPABASE_URL 未正确配置，使用空客户端');
        }
        supabase = createClient(url, anonKey);
    }
    return supabase;
}

// 允许外部注入 supabase 客户端（测试或全局初始化时）
function setSupabase(client) {
    supabase = client;
}

/**
 * 将简写值转换为全称
 * 未匹配到时返回原值（方便调试和自定义扩展）
 */
function expandValue(map, value, fieldName) {
    if (value == null || value === '') return value;
    const expanded = map[value];
    if (!expanded) {
        console.warn(`[Demographics] ${fieldName} 未找到映射值: "${value}"，使用原值`);
        return value;
    }
    return expanded;
}

/**
 * 将逗号分隔的种族字符串拆分后逐个转换再拼回
 * 例："asian, white" -> "Asian, White"
 */
function expandRaceList(raceStr) {
    if (!raceStr) return raceStr;
    return raceStr
        .split(', ')
        .map(r => expandValue(raceMap, r.trim(), 'race'))
        .join(', ');
}

/**
 * POST /api/demographics
 * 提交人口学调查问卷数据
 * 
 * 前端请求体字段（参考 templates/frontend-form.html 的 prepareBackendData）：
 * {
 *   // 追踪ID
 *   prolific_id, study_id, session_id, group,
 *   // 出生日期（来自上一页info-confirm）
 *   birthYear, birthMonth, birthDay, residenceCountry,
 *   // 核心人口学数据
 *   gender, race, racePrimary, skinTone, residenceState,
 *   education, income, bornUs, immigrationYear, politics,
 *   politicalScale, socialInteraction,
 *   // 补充数据（可选）
 *   unsureReasonsText, otherReasonsText,
 *   // 时间戳
 *   timestamp
 * }
 */
router.post('/demographics', async (req, res) => {
    try {
        const data = req.body;

        // ========== 1. 追踪ID默认值 ==========
        // 允许为空，使用 'unknown' 作为默认，避免数据库非空约束报错
        data.prolific_id = data.prolific_id || 'unknown';
        data.study_id = data.study_id || 'unknown';
        data.session_id = data.session_id || 'unknown';
        data.group = data.group || 1;

        // ========== 2. 字段类型规范化（防止前端传字符串数字） ==========
        // parseInt 无法解析时返回 NaN，需 || null
        data.group = typeof data.group === 'string' ? parseInt(data.group) || 1 : data.group;
        data.birthYear = data.birthYear ? parseInt(data.birthYear) : null;
        data.birthMonth = data.birthMonth ? parseInt(data.birthMonth) : null;
        data.birthDay = data.birthDay ? parseInt(data.birthDay) : null;
        data.income = data.income ? parseInt(data.income) : null;
        data.immigrationYear = data.immigrationYear ? parseInt(data.immigrationYear) : null;

        // ========== 3. 可选字段 null 处理 ==========
        // 注意：空字符串 '' 会触发 not-null 约束，必须转为 null
        const nullableFields = [
            'birthYear', 'birthMonth', 'birthDay', 'residenceCountry',
            'racePrimary', 'immigrationYear',
            'unsureReasonsText', 'otherReasonsText', 'socialInteraction'
        ];
        nullableFields.forEach(field => {
            if (data[field] === '' || data[field] === undefined) {
                data[field] = null;
            }
        });

        // ========== 4. 缩写→全称转换 ==========
        data.residenceState = expandValue(stateMap, data.residenceState, 'residenceState');
        data.education = expandValue(educationMap, data.education, 'education');
        data.politicalScale = expandValue(politicalScaleMap, data.politicalScale, 'politicalScale');
        data.gender = expandValue(genderMap, data.gender, 'gender');
        data.skinTone = expandValue(skinToneMap, data.skinTone, 'skinTone');
        data.politics = expandValue(politicsMap, data.politics, 'politics');
        data.bornUs = expandValue(bornUsMap, data.bornUs, 'bornUs');
        data.socialInteraction = expandValue(socialInteractionMap, data.socialInteraction, 'socialInteraction');

        // 种族（多选逗号分隔）逐个转换
        if (data.race) {
            data.race = expandRaceList(data.race);
        }
        // 最认同的种族（单选）
        if (data.racePrimary) {
            data.racePrimary = expandValue(raceMap, data.racePrimary, 'racePrimary');
        }

        // ========== 5. 时间戳兜底 ==========
        if (!data.timestamp) {
            data.timestamp = new Date().toISOString();
        }

        // ========== 6. 调试日志（可关闭） ==========
        console.log('[Demographics] =============== 收到请求 ===============');
        console.log('[Demographics] 追踪ID:', data.prolific_id, '| Group:', data.group);
        console.log('[Demographics] 人口学数据: gender=%s, race=%s, skin=%s, state=%s, edu=%s, income=%s',
            data.gender, data.race, data.skinTone, data.residenceState, data.education, data.income);
        console.log('[Demographics] 政治/社会: politics=%s, scale=%s, social=%s',
            data.politics, data.politicalScale, data.socialInteraction);

        // ========== 7. 写入数据库 ==========
        // 如需自定义表名，修改此处
        const TABLE_NAME = 'face_annotation_demographics';

        const sb = getSupabase();
        const { error } = await sb
            .from(TABLE_NAME)
            .insert(data);

        if (error) {
            console.error('[Demographics] ❌ 数据库插入错误:', JSON.stringify(error, null, 2));
            // 区分常见错误类型
            if (error.code === '42P01') { // PostgreSQL undefined_table
                return res.status(500).json({
                    error: `数据库表 "${TABLE_NAME}" 不存在，请先执行建表SQL`,
                    hint: '参考 templates/database-schema.sql 创建表'
                });
            }
            if (error.code === '23502') { // not_null_violation
                return res.status(400).json({
                    error: `字段不能为空约束违反: ${error.column || '未知字段'}`,
                    details: error.message
                });
            }
            if (error.code === '42703') { // undefined_column
                return res.status(400).json({
                    error: `数据库缺少字段: ${error.column || '未知字段'}`,
                    details: error.message,
                    hint: '请检查表结构与请求体字段是否一致'
                });
            }
            return res.status(500).json({
                error: '保存人口学数据失败',
                details: error.message || 'Unknown database error'
            });
        }

        console.log('[Demographics] ✅ 数据保存成功');
        return res.status(201).json({
            message: '人口学数据保存成功',
            received: {
                prolific_id: data.prolific_id,
                group: data.group
            }
        });

    } catch (error) {
        // 兜底异常捕获（如JSON解析失败等）
        console.error('[Demographics] ❌ 服务器异常:', error);
        return res.status(500).json({
            error: '服务器内部错误',
            details: error.message || 'Unknown server error'
        });
    }
});

/**
 * GET /api/demographics/stats
 * 可选：简单统计接口（如需后台查看填写情况）
 * 建议在生产环境加上简单的鉴权，如 API Key
 */
router.get('/demographics/stats', async (req, res) => {
    try {
        // 简单的 API Key 鉴权
        const apiKey = req.headers['x-api-key'];
        if (process.env.DEMOGRAPHICS_API_KEY && apiKey !== process.env.DEMOGRAPHICS_API_KEY) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const sb = getSupabase();
        const { data, count, error } = await sb
            .from('face_annotation_demographics')
            .select('*', { count: 'exact', head: false })
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        res.json({
            total: count,
            recent: data
        });
    } catch (error) {
        console.error('[Demographics Stats] Error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;
module.exports.setSupabase = setSupabase;
