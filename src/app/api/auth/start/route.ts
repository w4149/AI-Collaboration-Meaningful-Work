import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

const TASK_CONTENTS = {
  'task1': `你是 Star 咖啡店的员工。下周店里要上架一款新饮品，店长请你负责它的推广。请你完成下面两件事：

1）为新饮品设计营销方案，思考这款新品最适合卖给哪些顾客，以及怎样吸引他们来买。要求如下：
- 包含目标顾客的简单描述
- 2-3 个具体的推广点子（例如做什么活动、在哪里宣传、怎么摆放或搭配等）。点子要具体、能真正做得到。
- 🍊提示：与众不同&高创造力想象力
- 其他你认为需要提到的内容
- 不少于200字

2）为新饮品写一段推荐语，要求如下：
- 该推荐语目标发布在社交媒体上
- 内容新颖，让人一看就想尝一尝
- 大约 100 字

下面是这款新品的资料，请根据资料来写。

📋 新品资料
名称：枫糖肉桂燕麦拿铁 (Maple Cinnamon Oat Latte)
冷热：冷、热均可
口味：香浓咖啡 + 枫糖的甜香 + 肉桂的暖香 + 燕麦奶的顺滑
用料特点：用燕麦奶（不含乳糖、适合素食者）、真枫糖浆、不加人工香精
价格：5.5 美元
上市时间：下周（秋季限定）`,

  'task2': `你是 Lucky 咖啡店的员工。附近有1家 Bingo 咖啡店和你们形成长期竞争。店长想要你根据下面三份资料做一些分析，并对你所在咖啡店的未来规划提出建议。要求如下：

1. 你和竞争对手的主要优点和缺点分别（优劣势）是什么，用资料里的信息支持你的建议（根据材料得出，不要脱离现实和材料空想）
2. 不少于200字

---

#### 📊 资料一：销售数据对比图

（蓝色：工作日早间；橙色：周末下午晚些时候）

![销售数据对比图](/task2-chart.png)

---

#### 📝 资料二：顾客评价汇总

**Lucky Coffee 评价：**

| 顾客 | 评价内容 |
|------|----------|
| Olivia | 价格便宜，出餐快，上班路上买一杯提神醒脑。 |
| Emma | 咖啡味道还不错！ |
| Sophia | 服务员态度太冷淡了，问个问题都爱答不理，连个植物奶都没有。 |
| James | 价格低出餐快，味道一般般，能喝就行。 |
| Liam | 座位少得可怜，进去没地方坐，环境也太差了。 |

**Bingo Coffee 评价：**

| 顾客 | 评价内容 |
|------|----------|
| Noah | 买咖啡居然还送蛋糕和徽章，也太划算了吧！ |
| Ethan | 出品质量很好，装修有格调，跟朋友来聊天坐一下午都不想走。 |
| Ava | 咖啡豆香气足，用料认真。 |
| Chloe | 经常做活动，买年卡真的十分优惠！ |
| Ryan | 我等了快二十分钟，太慢了吧，害我迟到了。 |

---

#### 📋 资料三：本地顾客的小调查（回收 200 份）

| 需求 | 占比 |
|------|------|
| 希望有一个安静、能坐下来工作或学习的地方 | 70% |
| 在意价格 & 赠品 | 60% |
| 希望多一些吃的（不只是喝的） | 50% |
| 想要燕麦奶等植物奶的选择，适配自己的素食需求 | 40% |

提示：早晨&周末`,

  'task3': `你是 Lucky Coffee 的员工。店长收集了顾客在美食评价网站的留言，请你给这批留言分类。

要求：对于每条留言，从下面 3 个标签中选1个最合适的标注。

🏷️ **服务**
🏷️ **环境**
🏷️ **出品：饮品相关**

---

请按照这样的格式排列，每个编号及对应标签单独占一行（只需要列出编号和对应标签）：编号，标签

例如：
1，服务
2，环境
3，出品
…

---

| 编号 | 内容 |
|------|------|
| 1 | 进门的时候那个女生抬头冲我笑了一下，整个早上都好了起来。 |
| 2 | 坐进角落那个位子，窗外有棵树，就那么发了二十分钟呆。 |
| 3 | 太甜了，甜到后来嗓子有点腻，也不知道是加了什么。 |
| 4 | 站在门口等了有一分钟，里面的人没有一个抬头。 |
| 5 | 隔壁那桌不知道在讨论什么，声音完全压过了我耳机里的音乐。 |
| 6 | 喝了第一口，跟我之前喝过的那种不一样，有点惊喜。 |
| 7 | 问了好几个问题，对方没有一次表现出不耐烦，这很少见。 |
| 8 | 冬天进去一下子就暖过来了，帽子都不想摘。 |
| 9 | 那个杯子上有拉花，我拍了照片发给朋友，她说下次一定来。 |
| 10 | 点单的时候感觉自己在打扰他们聊天。 |
| 11 | 阳光从左边打进来，随手拍出来的照片都有点好看。 |
| 12 | 拿到的时候已经不烫了，不知道是不是放了一会儿。 |
| 13 | 我包落在座位上出门才发现，他们帮我放在前台，还贴了个便利贴说是我的。 |
| 14 | 椅子坐了没多久腰就开始有点酸，不太适合久待。 |
| 15 | 喝完之后还有点回甘，这我真的没想到。 |
| 16 | 说好了的东西不对，指出来之后对方的那个表情，算了不说了。 |
| 17 | 插座就在旁边，电脑充着电坐了大半天，效率高得吓到我自己。 |
| 18 | 喝到一半感觉杯底有一层沉下去的东西，没敢喝完。 |
| 19 | 快打烊了还让我多坐一会儿，说不急，这在别的地方真的很少遇到。 |
| 20 | 空调出风口正对着我的位子，坐了没多久就开始头疼。 |
| 21 | 量给得很足，我一个人喝到撑。 |
| 22 | 找零多给了两块，我说了一声，对方一脸“你不是赚到了吗”的表情，很奇怪。 |
| 23 | 背景音乐音量刚好，不知不觉在里面待了三个小时。 |
| 24 | 温度刚好，拿到就能直接喝，不用等，很省事。 |
| 25 | 我说了一遍口味要求，拿到的完全对，一个字都没漏。 |
| 26 | 那天人特别多，连个放包的地方都没找到，最后放在腿上喝完就走了。 |
| 27 | 我朋友点的那个，和照片上的颜色差挺多，看着有点不对劲。 |
| 28 | 一进门就有人来问要坐哪儿，没有那种自己站着不知道往哪去的尴尬。 |
| 29 | 靠窗的位子能看到街上来来去去的人，发发呆正合适。 |
| 30 | 泡沫很多但往下喝其实没多少，有一种被骗了的感觉。 |
| 31 | 叫了两次才有人过来，那会儿也不是很忙的时候。 |
| 32 | 洗手间的水龙头开了半天才出水，有点不舒服。 |
| 33 | 朋友不喝咖啡，点了别的，喝了一口就说下次还来，这挺说明问题的。 |
| 34 | 手抖把杯子碰倒了，对方过来处理，全程没让我有一点难堪。 |
| 35 | 外面下着雨，里头暗暗的，听着雨声，待着很对。 |
| 36 | 加了燕麦奶的版本比我想象中顺很多，不是那种寡淡的感觉。 |
| 37 | 问了推荐，对方说都可以，然后就盯着我等，感觉自己在为难他。 |
| 38 | 灯光有点暗，手机屏幕一直自动调亮，看久了眼睛很累。 |
| 39 | 冰给的有点多，喝到后来基本上没什么味道，主要在喝水。 |
| 40 | 带着孩子，他一直在吵，有人过来轻声说了句没关系，当时真的挺感激的。 |
| 41 | 进去不花哨，也没有什么多余的东西，很安静，适合想清楚一件事的时候来坐坐。 |
| 42 | 那个季节限定的，看着有点怀疑，喝了之后后悔没多点一杯。 |
| 43 | 手机没电付不了款，对方一脸为难，来来去去说了好几轮，本来很简单的事。 |
| 44 | 书架上有几本可以随手翻的，等朋友迟到的那四十分钟过得意外地快。 |
| 45 | 点了两杯一样的，一杯浓一杯淡，明显不是同一个人做的，差很多。 |
| 46 | 点单的时候主动提醒我这周有个东西在停供，帮我省了踩雷。 |
| 47 | 门口位置靠近出入口，人来人往带进来的风一直吹，坐了一会儿就走了。 |
| 48 | 那个杯子比我以为的大很多，喝了一个上午都还撑着，性价比真的高。 |
| 49 | 说五分钟好，等了将近二十分钟，也没有人来说一声，就那么干坐着。 |
| 50 | 说是热的，拿到手就是温，懒得说，但确实不太对。`,

  'task4': `你是 Lucky Coffee 客服团队的一名员工，主要负责处理顾客的意见和投诉。今天你收到了一位顾客的投诉。根据店内记录，顾客反映的问题确实发生了。请阅读下面顾客的留言，并以 Lucky Coffee 客服人员的身份，写一封回复。

工作目标是：合理沟通（适当的方法或语言等），缓和情绪，提供帮助，维护顾客关系等。

---

#### 顾客的投诉信

致 Lucky Coffee：

昨天下午，我在你们店点了一杯热拿铁和一份贝果。点单的时候店里人很多，我可以理解需要排队，但是等了三十多分钟才拿到咖啡，中间一直没人告诉我们为什么这么慢。

更让我失望的是，给我的咖啡不仅冰凉，而且还成了美式（我要的可是拿铁啊！）。我向店员反映以后，对方居然只是说“今天比较忙，让我再等一下给我重做或者直接退款”。我已经等了三十分钟，为了喝上对的咖啡居然还要再等三十分钟？就算能直接给我退款，那我等待的时间算什么？我的时间不值钱吗？我气得扔掉了咖啡直接走了。

我一直觉得 Lucky Coffee 的服务和品质都很不错，所以才经常来。但这次的体验真是让我非常气愤和失望，我再也不会来了。无论如何，你们咖啡店必须给我个解释！

—— Tony

---

要求：200-300字`,
}

const GROUP_CONFIG: Record<string, { allowCopy: boolean; allowPaste: boolean; allowChat: boolean }> = {
  'G1-Human': {
    allowCopy: false,
    allowPaste: false,
    allowChat: false,
  },
  'G2-HumanAndAI': {
    allowCopy: true,
    allowPaste: true,
    allowChat: true,
  },
  'G3-AI': {
    allowCopy: false,
    allowPaste: false,
    allowChat: false,
  },
}

export async function POST(request: Request) {
  try {
    const { prolificId, taskId, groupType } = await request.json()

    if (!prolificId) {
      return NextResponse.json({ error: 'Prolific ID is required' }, { status: 400 })
    }

    let selectedTaskId = taskId as keyof typeof TASK_CONTENTS
    let selectedGroupType = groupType as keyof typeof GROUP_CONFIG

    if (!selectedTaskId || !TASK_CONTENTS[selectedTaskId]) {
      const taskIds = Object.keys(TASK_CONTENTS) as (keyof typeof TASK_CONTENTS)[]
      selectedTaskId = taskIds[Math.floor(Math.random() * taskIds.length)]
    }

    if (!selectedGroupType || !GROUP_CONFIG[selectedGroupType]) {
      const groupTypes = Object.keys(GROUP_CONFIG) as (keyof typeof GROUP_CONFIG)[]
      selectedGroupType = groupTypes[Math.floor(Math.random() * groupTypes.length)]
    }

    const config = GROUP_CONFIG[selectedGroupType]
    const taskContent = TASK_CONTENTS[selectedTaskId] || 
      'Please complete this task by writing your response here.'

    const taskTypeMap: Record<keyof typeof TASK_CONTENTS, string> = {
      'task1': 'Type A',
      'task2': 'Type B',
      'task3': 'Type C',
      'task4': 'Type D',
    }
    
    const { data: taskType, error: taskTypeError } = await supabaseServer
      .from('task_types')
      .select('id')
      .eq('type_name', taskTypeMap[selectedTaskId])
      .single()

    if (taskTypeError || !taskType) {
      console.error('Error fetching task type:', taskTypeError)
      return NextResponse.json({ error: 'Failed to fetch task type' }, { status: 500 })
    }

    const { data: existingUser } = await supabaseServer
      .from('users')
      .select('id')
      .eq('prolific_id', prolificId)
      .single()

    let userId: string

    if (existingUser) {
      userId = existingUser.id
    } else {
      const { data: newUser, error: userError } = await supabaseServer
        .from('users')
        .insert({ prolific_id: prolificId })
        .select('id')
        .single()

      if (userError || !newUser) {
        console.error('Error creating user:', userError)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }
      userId = newUser.id
    }

    const { data: session, error: sessionError } = await supabaseServer
      .from('sessions')
      .insert({ user_id: userId })
      .select('id')
      .single()

    if (sessionError || !session) {
      console.error('Error creating session:', sessionError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    const { data: task, error: taskError } = await supabaseServer
      .from('tasks')
      .insert({
        user_id: userId,
        task_type_id: taskType.id,
        content_to_display: taskContent,
        allow_copy: config.allowCopy,
        allow_paste: config.allowPaste,
      })
      .select('id')
      .single()

    if (taskError || !task) {
      console.error('Error creating task:', taskError)
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }

    return NextResponse.json({
      userId,
      sessionId: session.id,
      taskId: task.id,
      taskTypeId: taskType.id,
      taskType: selectedTaskId,
      taskContent,
      allowCopy: config.allowCopy,
      allowPaste: config.allowPaste,
      allowChat: config.allowChat,
      groupType: selectedGroupType,
    })
  } catch (error) {
    console.error('Error in start session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}