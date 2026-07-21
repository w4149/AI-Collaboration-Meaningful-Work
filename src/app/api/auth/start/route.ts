import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

const TASK_CONTENTS = {
  'task1': `**广告语写作**

你是 Lucky Coffee 的员工，下周店里要上架一款新饮品——枫糖肉桂燕麦拿铁（Maple Cinnamon Oat Latte），店长请你为该饮品写一段广告推荐语，要求如下：

1. 该推荐语目标发布在社交媒体上
2. 内容新颖，让人一看就想尝一尝`,

  'task1-2': `**特殊节日活动策划**

你是 Lucky Coffee 的员工，店长希望在下半年的某个节日（需要你选择任何一个节日）举办一次店内活动，请设计这个活动，要求如下：

1. 活动目的：吸引顾客进店并留下，鼓励顾客拍照分享，甚至大幅提高本店的销量和知名度
2. 写作内容：说明活动内容、方式、以及顾客参与的流程等`,

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
`,

  'task3': `你是 Lucky Coffee 的员工。店长收集了顾客在美食评价网站的留言，请你给这批留言分类。

要求：对于每条留言，从下面 3 个标签中选 1 个最合适的标注。

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
| 1 | 我问能不能换成燕麦奶，店员直接帮我改了。 |
| 2 | 今天这杯拿铁比平时淡不少，咖啡味不太喝得出来。 |
| 3 | 美式喝起来很顺，没有那种特别刺激的酸味。 |
| 4 | 店里一直有人整理桌子，看着挺干净。 |
| 5 | 点单的时候发现会员券过期了，工作人员帮我看了半天。 |
| 6 | 焦糖放得刚刚好，不会甜得发腻。 |
| 7 | 中午人很多，比想象中还要吵一点。 |
| 8 | 我点错了，店员直接帮我重新做了一杯。 |
| 9 | 生椰拿铁还是一如既往，味道挺稳定。 |
| 10 | 二楼坐着比一楼安静一点。 |
| 11 | 我拿餐的时候店员提醒杯子有点烫，挺细心的。 |
| 12 | 今天这杯有点太苦了，喝到后面有点受不了。 |
| 13 | 靠里面那排沙发坐着比较舒服。 |
| 14 | 排到我的时候收银还确认了一遍我要的规格。 |
| 15 | 摩卡巧克力味太重了，几乎喝不到咖啡味。 |
| 16 | 下午来写东西挺合适，不容易被打扰。 |
| 17 | 我临时想取消一杯，店员很快就帮我处理好了。 |
| 18 | 今天这杯冷萃喝起来有点淡，没有以前那么清爽。 |
| 19 | 桌子收拾得挺及时，基本没有看到空杯一直放着。 |
| 20 | 我朋友第一次来，店员给推荐了几款销量比较高的。 |
| 21 | 今天浓缩放得有点重，后味一直发苦。 |
| 22 | 门口那几个位置来来往往的人比较多。 |
| 23 | 我忘记拿吸管了，走出去才发现，工作人员还叫住了我。 |
| 24 | 榛果拿铁有点太甜了，喝到后面有点腻。 |
| 25 | 店里的音乐不会特别大，聊天刚刚好。 |
| 26 | 排队的时候一直有人引导，不会乱成一团。 |
| 27 | 我带着孩子，不太方便，店员帮我把饮料端到了座位。 |
| 28 | 今天这杯温度有点低，拿到手没多久就凉了。 |
| 29 | 靠门的位置一直有人进出，里面会舒服一点。 |
| 30 | 我问新品有什么区别，店员讲得挺清楚。 |
| 31 | 香草拿铁没有想象中那么甜，喝着没什么负担。 |
| 32 | 店里空调开得太低，坐了一会儿就觉得有点冷。 |
| 33 | 我付款的时候网络卡了一下，前台一直耐心等着。 |
| 34 | 今天奶泡打得一般，没有以前那么细。 |
| 35 | 灯光比较柔和，待久了眼睛不会累。 |
| 36 | 点单以后没等多久就拿到了。 |
| 37 | 这杯喝起来有点淡，香气也没有之前那么明显。 |
| 38 | 沙发区坐着挺舒服，就是去晚了不太容易抢到。 |
| 39 | 店员看到我在找插座，还主动指了一下位置。 |
| 40 | 燕麦奶和咖啡的味道搭得不错，会回购。 |
| 41 | 下午人不少，但里面还是比较安静。 |
| 42 | 我改了两次订单，工作人员一直都很有耐心。 |
| 43 | 今天这杯冰拿铁冰块放得有点多，后面越喝越没味道。 |
| 44 | 桌椅摆得比较宽松，不会跟隔壁挨得特别近。 |
| 45 | 已经来了很多次，出品一直比较稳定，没有踩过雷。 |
| 46 | 今天点单的人不少，队伍走得比想象中慢。 |
| 47 | 椰香挺明显的，喝完整杯也不会觉得腻。 |
| 48 | 靠墙那排位置坐着比较有安全感。 |
| 49 | 我问能不能分开装，店员很爽快就答应了。 |
| 50 | 这杯热美式酸味有点重，不太符合我的口味。 |
| 51 | 今天来得比较早，店里人不多，感觉很放松。 |
| 52 | 收银的时候提醒我有优惠券可以用，不然我都忘了。 |
| 53 | 奶味有点盖过咖啡味，整体喝起来偏淡。 |
| 54 | 二楼比我想象中宽敞。 |
| 55 | 我把号码看错了，店员还特地叫了我一声。 |
| 56 | 这一杯甜度刚好，不需要另外调整。 |
| 57 | 店里空调感觉不是很给力，坐着有点闷。 |
| 58 | 我问洗手间在哪，工作人员直接带我过去了。 |
| 59 | 咖啡闻起来挺香，就是温度降得有点快。 |
| 60 | 桌面擦得很干净，不用自己收拾。 |
| 61 | 我迟迟没决定喝什么，店员一直很有耐心。 |
| 62 | 今天奶泡有点厚，把咖啡味压住了。 |
| 63 | 靠窗的位置能看到外面，人坐着不会觉得闷。 |
| 64 | 点完餐发现忘记备注少冰，店员马上帮我改了。 |
| 65 | 比起附近那家，这里的咖啡更合我口味。 |
| 66 | 下午虽然不用排队，不过出餐比平时慢一点。 |
| 67 | 灯光不会特别刺眼，坐着看书挺舒服。 |
| 68 | 店员主动提醒我今天新品可以试试。 |
| 69 | 这一杯喝起来比以前浓很多，对我来说有点苦。 |
| 70 | 店里今天有点乱，桌子没有及时收拾。 |
| 71 | 我扫码一直失败，工作人员帮我换了付款方式。 |
| 72 | 热拿铁的奶泡有点粗，没有以前顺口。 |
| 73 | 坐在里面聊天，不太会被外面影响。 |
| 74 | 我拿错了别人的饮料，店员马上帮忙换回来。 |
| 75 | 今天冰块放得有点少，喝起来没那么冰。 |
| 76 | 朋友推荐来的，没有失望。 |
| 77 | 店里有一点食物味，闻起来不是很舒服。 |
| 78 | 我想开发票，店员很快就弄好了。 |
| 79 | 今天这杯香气没有前几次那么明显。 |
| 80 | 靠近吧台的位置一直有人走来走去。 |
| 81 | 我多问了几个问题，工作人员都回答得很认真。 |
| 82 | 香气比较淡，没有闻到太明显的咖啡香。 |
| 83 | 里面的位置比外面看起来多。 |
| 84 | 我忘了取餐，店员还帮我留着。 |
| 85 | 第一口喝下去还挺惊喜。 |
| 86 | 桌子大小刚好，一个人办公够用了。 |
| 87 | 今天人很多，排队和取餐都有点乱。 |
| 88 | 冰拿铁喝到后面味道还是淡了不少。 |
| 89 | 空调温度刚刚好，不会太冷。 |
| 90 | 我想换个杯型，店员帮我重新下单处理。 |
| 91 | 咖啡入口有点苦涩，没有平时那么顺。 |
| 92 | 靠里面坐着比门口安静不少。 |
| 93 | 我把会员二维码点错了，店员耐心等我重新找。 |
| 94 | 今天这杯有一点焦香味，我挺喜欢。 |
| 95 | 地上有几张纸巾一直没人收，看着有点乱。 |
| 96 | 点单的时候店员还确认了一遍有没有其他需求。 |
| 97 | 这一杯比昨天热一点，拿在手里刚刚好。 |
| 98 | 下午太阳照进来有点晒，靠窗的位置坐着有点热。 |
| 99 | 我第一次喝这个口味，比想象中顺口。 |
| 100 | 店员把饮料做好以后还提醒我别忘了带走。 |`,

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

  'task4-2': `你是 Lucky Coffee 客服团队的一名员工。今天，两位顾客在店内发生了争执，值班店员没及时介入。事后，两人分别写了投诉信给门店，希望门店给个说法。下面是他们的投诉信。

要求：请你以 Lucky Coffee 客服人员的身份，分别给两位顾客写回信，目标是：用适当的沟通（如方法或语言等）平复双方的情绪，回应并解决投诉顾客的问题，缓和矛盾，引导他们撤销投诉。

---

**场景**：周六上午，店内只有一人当班。顾客 A 等了几分钟，顾客 B 进店直接走到台前点单。店员当时正处理后台系统故障，没及时介入。A 指出被插队，B 说没看见，两人吵起来。B 说了句“没必要这么凶”，A 变更得激动。店员事后介入但是两人都不满意直接离开了店面。两人事后均提交投诉。

---

#### 顾客 A 的投诉

我在点单台等了好几分钟，期间没有任何员工出来维持秩序。一个男的直接走过来点单，我说了一声，他说没看见我，语气很差。你们员工就站在旁边，一个字都没说。后来他说我“没必要这么凶”——我只是在说明我等了多久，这有什么问题？希望店方给我一个正式答复。

---

#### 顾客 B 的投诉

店里没有任何排队提示，我真的不知道有人在等。我解释了，对方还是一直在说，你们员工全程没有出来处理。我不觉得我做错了，但整件事如果有人早点出来说一句，根本不会吵起来。这是管理问题，希望你们正视。

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
      'task1-2': 'Type A',
      'task2': 'Type B',
      'task3': 'Type C',
      'task4': 'Type D',
      'task4-2': 'Type D',
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