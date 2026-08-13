/**
 * Demographics Survey - Data Maps
 * 人口学调查问卷数据映射表
 * 
 * 用途：
 *  - 将前端的简写值（如 'CA', 'bachelor'）转换为数据库可读的全称
 *  - 统一后端格式转换逻辑，避免代码重复
 *  - 便于后续新增/修改选项时只改此文件
 * 
 * 新增自定义映射的方式：
 *  const yourCustomMap = {
 *      'key': 'Display Text',
 *      ...
 *  };
 *  module.exports = { ...原有导出, yourCustomMap };
 */

// ========================================================
// 美国州缩写 → 全称
// ========================================================
const stateMap = {
    'AL': 'Alabama',
    'AK': 'Alaska',
    'AZ': 'Arizona',
    'AR': 'Arkansas',
    'CA': 'California',
    'CO': 'Colorado',
    'CT': 'Connecticut',
    'DE': 'Delaware',
    'FL': 'Florida',
    'GA': 'Georgia',
    'HI': 'Hawaii',
    'ID': 'Idaho',
    'IL': 'Illinois',
    'IN': 'Indiana',
    'IA': 'Iowa',
    'KS': 'Kansas',
    'KY': 'Kentucky',
    'LA': 'Louisiana',
    'ME': 'Maine',
    'MD': 'Maryland',
    'MA': 'Massachusetts',
    'MI': 'Michigan',
    'MN': 'Minnesota',
    'MS': 'Mississippi',
    'MO': 'Missouri',
    'MT': 'Montana',
    'NE': 'Nebraska',
    'NV': 'Nevada',
    'NH': 'New Hampshire',
    'NJ': 'New Jersey',
    'NM': 'New Mexico',
    'NY': 'New York',
    'NC': 'North Carolina',
    'ND': 'North Dakota',
    'OH': 'Ohio',
    'OK': 'Oklahoma',
    'OR': 'Oregon',
    'PA': 'Pennsylvania',
    'RI': 'Rhode Island',
    'SC': 'South Carolina',
    'SD': 'South Dakota',
    'TN': 'Tennessee',
    'TX': 'Texas',
    'UT': 'Utah',
    'VT': 'Vermont',
    'VA': 'Virginia',
    'WA': 'Washington',
    'WV': 'West Virginia',
    'WI': 'Wisconsin',
    'WY': 'Wyoming',
    'DC': 'District of Columbia',
    'PR': 'Puerto Rico'
};

// ========================================================
// 教育程度缩写 → 全称
// ========================================================
const educationMap = {
    'less-than-high': 'Less than high school',
    'high-school': 'High school diploma or equivalent (e.g., GED)',
    'some-college': 'Some college but no degree',
    'associate': 'Associate degree',
    'bachelor': "Bachelor's degree",
    'master': "Master's degree",
    'doctoral': 'Doctoral or professional degree (PhD, JD, MD, etc.)'
};

// ========================================================
// 性别缩写 → 全称
// ========================================================
const genderMap = {
    'man': 'Man',
    'woman': 'Woman',
    'nonbinary': 'Nonbinary / Something else',
    'transgender': 'Transgender'
};

// ========================================================
// 种族缩写 → 全称（对应多选选项）
// ========================================================
const raceMap = {
    'american-indian': 'American Indian or Alaska Native',
    'asian': 'Asian',
    'black': 'Black or African American',
    'hispanic': 'Hispanic or Latino',
    'middle-eastern': 'Middle Eastern or North African',
    'native-hawaiian': 'Native Hawaiian or Pacific Islander',
    'white': 'White'
};

// ========================================================
// 肤色 Monk Scale 编号 → 带描述的文本
// 来源: Monk Skin Tone Scale (Google)
// ========================================================
const skinToneMap = {
    '1': '1 - Very light',
    '2': '2 - Light',
    '3': '3 - Light medium',
    '4': '4 - Medium',
    '5': '5 - Medium dark',
    '6': '6 - Dark',
    '7': '7 - Very dark',
    '8': '8 - Extremely dark',
    '9': '9 - Almost black',
    '10': '10 - Black'
};

// ========================================================
// 政治倾向 7点量表编号 → 带描述的文本
// ========================================================
const politicalScaleMap = {
    '1': '1 - Extremely liberal',
    '2': '2 - Liberal',
    '3': '3 - Slightly liberal',
    '4': '4 - Moderate, middle of the road',
    '5': '5 - Slightly conservative',
    '6': '6 - Conservative',
    '7': '7 - Extremely conservative',
    '8': "8 - Don't know"
};

// ========================================================
// 政治党派缩写 → 全称
// ========================================================
const politicsMap = {
    'republican': 'Republican',
    'democrat': 'Democrat',
    'independent': 'Independent',
    'other': 'Other',
    'no-preference': 'No Preference',
    'unsure': "Don't know"
};

// ========================================================
// 是否美国出生缩写 → 全称
// ========================================================
const bornUsMap = {
    'yes': 'Yes',
    'no': 'No',
    'unsure': "Don't know"
};

// ========================================================
// 跨种族社会互动频率缩写 → 全称
// ========================================================
const socialInteractionMap = {
    'every-day': 'Every day or almost every day',
    'few-times-week': 'A few times a week',
    'few-times-month': 'A few times a month',
    'two-times-year': 'Two to a few times a year',
    'once-year': 'Once a year or less',
    'never': 'Never'
};

// ========================================================
// 补充问题：常见原因选项 a-g → 文本
// （用于多选+其他文本的转换）
// ========================================================
const reasonMap = {
    'a': 'The image quality made it difficult to judge (e.g., lighting, resolution, occlusion)',
    'b': 'I was uncertain between two or more possible categories',
    'c': 'I believed the person belonged to multiple categories',
    'd': 'I thought that none of the listed categories fit this person',
    'e': 'I did not endorse the categorization scheme used in this task',
    'f': 'I did not want to spend more time deciding',
    'g': 'Other'
};

// ========================================================
// 年龄资格验证配置
// ========================================================
const eligibilityConfig = {
    minAge: 18,
    maxAge: 64,
    requiredCountry: 'United States', // 如需取消国家限制，设为 null
    ineligibleMessage: 'Based on the information provided, you are currently ineligible to participate in this study. Thank you for your interest. You may now close this page.'
};

// ========================================================
// 反向映射工具（调试/分析用）：全称 → 简写
// 例：reverseMap(stateMap)['California'] === 'CA'
// ========================================================
function reverseMap(map) {
    const reversed = {};
    for (const [key, value] of Object.entries(map)) {
        reversed[value] = key;
    }
    return reversed;
}

module.exports = {
    stateMap,
    educationMap,
    genderMap,
    raceMap,
    skinToneMap,
    politicalScaleMap,
    politicsMap,
    bornUsMap,
    socialInteractionMap,
    reasonMap,
    eligibilityConfig,
    reverseMap
};
