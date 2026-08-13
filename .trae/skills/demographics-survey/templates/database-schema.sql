-- ====================================================================
-- Demographics Survey - Database Schema
-- 人口学调查问卷 数据库建表脚本（PostgreSQL / Supabase）
--
-- 使用方式：
--  1. 登录 Supabase Dashboard → SQL Editor
--  2. 新建 Query，粘贴以下内容执行
--  3. 如需修改表名，请同步修改 backend-api.js 中的 TABLE_NAME 常量
--
-- 字段命名说明：
--  - 使用驼峰命名（如 birthYear）以与前后端 JSON 字段保持一致
--  - Supabase 的 JSON 列名匹配时大小写敏感，务必保证前后端一致
-- ====================================================================

-- 如果表已存在可跳过（开发/测试环境调试用）
-- DROP TABLE IF EXISTS public.face_annotation_demographics CASCADE;

-- ====================================================================
-- 表：人口学调查问卷主表
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.face_annotation_demographics (
    -- 自增主键
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- 行创建时间（由数据库自动设置，前端不需要传）
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW()),

    -- ============================================================
    -- 追踪ID字段（与标注任务表关联）
    -- 来自 URL 参数 PROLIFIC_PID / STUDY_ID / SESSION_ID
    -- ============================================================
    prolific_id TEXT NOT NULL DEFAULT 'unknown'::TEXT,
    study_id    TEXT NOT NULL DEFAULT 'unknown'::TEXT,
    session_id  TEXT NOT NULL DEFAULT 'unknown'::TEXT,
    "group"     SMALLINT NOT NULL DEFAULT 1, -- 实验分组（1/2/3...）

    -- ============================================================
    -- 基础信息字段（来自 info-confirm.html 信息确认页）
    -- ============================================================
    "birthYear"        SMALLINT,        -- 出生年份（1900-2026）
    "birthMonth"       SMALLINT,        -- 出生月份（1-12）
    "birthDay"         SMALLINT,        -- 出生日期（1-31）
    "residenceCountry" TEXT,            -- 居住国家（如 "United States"）

    -- ============================================================
    -- 人口学核心字段（来自 demographics.html 调查问卷）
    -- ============================================================
    gender                TEXT,          -- 性别（Man / Woman / Nonbinary ...）
    race                  TEXT,          -- 种族（多选逗号分隔，如 "Asian, White"）
    "racePrimary"         TEXT,          -- 多选时最认同的种族（单个）
    "skinTone"            TEXT,          -- 肤色 Monk Scale（"1 - Very light" ... "10 - Black"）
    "residenceState"      TEXT,          -- 美国州全称（"California" 等）
    education             TEXT,          -- 教育程度全称
    income                SMALLINT,      -- 收入等级（1-10）
    "bornUs"              TEXT,          -- 是否美国出生（Yes / No / Don't know）
    "immigrationYear"     SMALLINT,      -- 移民年份（bornUs=No 时必填，否则NULL）
    politics              TEXT,          -- 政治党派全称（Republican / Democrat ...）
    "politicalScale"      TEXT,          -- 政治倾向7点量表（"1 - Extremely liberal"...）
    "socialInteraction"   TEXT,          -- 跨种族社会互动频率

    -- ============================================================
    -- 补充问题字段（来自 supplementary-questions.html）
    -- 可根据项目需求增删
    -- ============================================================
    "otherReasonsText"  TEXT,  -- 选择"Other"原因的可读文本
    "unsureReasonsText" TEXT,  -- 选择"Unsure"原因的可读文本

    -- ============================================================
    -- 时间戳（前端生成的 ISO8601 字符串，如 2026-01-15T10:30:00.000Z）
    -- 用于与标注记录对齐（created_at 是数据库写入时间，可能有延迟）
    -- ============================================================
    "timestamp" TEXT
);

-- ====================================================================
-- 索引：加速按用户/会话查询
-- 如果表数据量很大，建议在 Supabase Dashboard 确认执行
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_demographics_prolific_id
    ON public.face_annotation_demographics(prolific_id);

CREATE INDEX IF NOT EXISTS idx_demographics_study_id
    ON public.face_annotation_demographics(study_id);

CREATE INDEX IF NOT EXISTS idx_demographics_session_id
    ON public.face_annotation_demographics(session_id);

CREATE INDEX IF NOT EXISTS idx_demographics_group
    ON public.face_annotation_demographics("group");

CREATE INDEX IF NOT EXISTS idx_demographics_created_at
    ON public.face_annotation_demographics(created_at DESC);

-- ====================================================================
-- 行级安全策略（RLS）- 可选
-- 如果需要匿名角色也能写入（前端直接调用Supabase client），请启用：
--   1) 启用 RLS：
--      ALTER TABLE public.face_annotation_demographics ENABLE ROW LEVEL SECURITY;
--   2) 允许匿名插入：
--      CREATE POLICY "Allow anonymous insert" ON public.face_annotation_demographics
--      FOR INSERT WITH CHECK (true);
--   3) 禁止匿名读取（避免数据泄露）：
--      CREATE POLICY "Disable anonymous select" ON public.face_annotation_demographics
--      FOR SELECT USING (false);
-- 推荐做法：通过后端API写入（即本SKILL提供的方式），不启用RLS也安全
-- ====================================================================

-- ====================================================================
-- 验证：查看表结构是否创建成功
-- 执行以下查询进行检查：
--   SELECT column_name, data_type, is_nullable, column_default
--   FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'face_annotation_demographics'
--   ORDER BY ordinal_position;
--
-- 验证统计：
--   SELECT COUNT(*) FROM public.face_annotation_demographics;
--   SELECT "group", COUNT(*) FROM public.face_annotation_demographics GROUP BY "group";
-- ====================================================================

-- ====================================================================
-- 可选：标注数据表（与人口学表通过 prolific_id / study_id / session_id 关联）
-- 如果项目还没有标注表，可以用下面的建表脚本：
--
-- CREATE TABLE IF NOT EXISTS public.face_annotation_from_fairface (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW()),
--     prolific_id TEXT NOT NULL DEFAULT 'unknown',
--     study_id    TEXT NOT NULL DEFAULT 'unknown',
--     session_id  TEXT NOT NULL DEFAULT 'unknown',
--     "group"     SMALLINT NOT NULL DEFAULT 1,
--     face_id     INTEGER,
--     gender_annotation      TEXT,
--     race_annotation        TEXT,
--     skin_color_annotation  TEXT,
--     duration    INTEGER,            -- 单张标注耗时(ms)
--     "timestamp" TEXT
-- );
--
-- 关联查询示例：
--   SELECT d.gender, d.race, d.education, a.face_id, a.gender_annotation
--   FROM public.face_annotation_demographics d
--   JOIN public.face_annotation_from_fairface a
--     ON d.prolific_id = a.prolific_id
--    AND d.study_id = a.study_id
--    AND d.session_id = a.session_id
--   LIMIT 100;
-- ====================================================================
