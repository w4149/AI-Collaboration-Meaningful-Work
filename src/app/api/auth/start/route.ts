import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

const TASK_CONTENTS = {
  'task1': `You work at Lucky Coffee, an affordable coffee chain whose main customers are nearby office workers and students. The manager is planning an event to celebrate the store’s third anniversary and has asked you to come up with ideas for it.

  Your task is to design a third-anniversary event for Lucky Coffee.

  First, give the event a **creative name** and develop an **overall theme or concept**.

  Then, design ideas in each of the following areas that fit with your overall theme:

1. **Membership or loyalty program**: Suggest at least one way the store could use its membership or loyalty program to engage customers during the anniversary. 

2. **In-store activities**: Suggest at least one activity customers could take part in at the store during the anniversary. 

3. **Online engagement**: Suggest at least one way customers could take part in the anniversary beyond the in-store experience.

For each idea, describe what customers would do, how the idea would work, and any special details you would include. Your ideas may be simple or elaborate, but aim to make them original and distinctive while providing enough detail for someone to picture the anniversary experience.

*Note: A response of about 80–200 words is generally sufficient, but you may write more or less as needed to fully address the task.*
`,

  'task1-2': `

You work at Lucky Coffee, an affordable coffee chain known for its comfortable stores and relaxed vibe. Its main customers are nearby office workers and students. The manager wants to celebrate the store's third anniversary with an in-store event and has asked you to plan it.

Design an anniversary event that meets the following requirements:

1. Goals: Bring customers into the store and encourage them to stay, motivate them to take and share photos, and significantly boost the store's sales and brand awareness.

2. What to include: **Describe what the event is?Describe the activities included in the event**, how it works, and/or how customers would take part.`,

  'task2': `You work at Lucky Coffee. Over the past few months, afternoon drink sales have declined, and two possible explanations have been suggested:

  **Explanation A:** The opening of a nearby competitor, Bingo Coffee, contributed to the decline by attracting some of Lucky Coffee’s customers.

  **Explanation B:** Lucky Coffee’s reduction in afternoon staffing contributed to the decline by increasing waiting times and making customers less willing to visit.

  The manager has asked you to assess which explanation is better supported by the available evidence. Use the three materials below to make your assessment.

  **In your response**:
  
  1. State which explanation is better supported. Explain why.
  
  2. Use evidence from **ALL three materials**. 
  
  3. Base your answer only on the information provided.

*Note: A response of about 80–200 words is generally sufficient, but you may write more or less as needed to fully address the task.*

---

#### Material 1: Afternoon Drink Sales

Bingo Coffee opened near Lucky Coffee. Lucky Coffee kept its afternoon staffing unchanged for the next two months. At the beginning of the third month after Bingo Coffee opened, Lucky Coffee reduced its afternoon staffing by one employee.

Lucky Coffee’s average weekday drink sales in the afternoon were:

- **Before Bingo Coffee opened:** 120 drinks 

- **First month after Bingo Coffee opened:** 118 drinks 

- **Second month after Bingo Coffee opened:** 116 drinks 

- **First month after Lucky Coffee reduced its afternoon staffing:** 95 drinks 

Bingo Coffee’s average weekday afternoon drink sales increased from about 75 drinks in its first month to 84 drinks in its third month.

---

#### Material 2: Waiting Time and Customer Groups

After Lucky Coffee reduced its afternoon staffing, average customer waiting time increased from about 4 minutes to 9 minutes.

During the same period:

- Afternoon visits among customers who usually **ordered at the counter** decreased by 22%.

- Afternoon visits among customers who usually **ordered ahead through the Lucky Coffee app** decreased by 5%.

Both groups could visit Bingo Coffee. However, customers who ordered ahead through the Lucky Coffee app could usually pick up their drinks without waiting in the in-store ordering line.

---

#### Material 3: Customer Survey

Lucky Coffee surveyed 60 customers who said they had recently started visiting the store less often in the afternoon.

When asked for the main reason they were visiting less often:

- **24** said the waiting time had become too long. 

- **14** said they had started going to Bingo Coffee more often. 

- **22** gave other reasons, such as schedule changes or drinking less coffee.

`,

  'task3': `
  
You work at Lucky Coffee. The store is updating its membership database. Some customer records were entered using inconsistent formats, and your manager has asked you to standardize them.


Your task is to reformat the customer records according to the rules below.

**1. Date**:

Convert the date to the format: YYYY-MM-DD

Example: April 8, 2026 → 2026-04-08

**2. Phone number**:

Convert the phone number to the format: (XXX) XXX-XXXX

Example: 415.555.0182 → (415) 555-0182

**3. Amount**:

Convert the amount to a dollar sign followed by two decimal places: $X.XX

Examples: 6.5 → $6.50;  $12 → $12.00

For each record, enter the standardized information in the following format:

**Record number, YYYY-MM-DD, (XXX) XXX-XXXX, $X.XX**

---

For example:

| Record | Date               | Phone Number   | Amount |
|--------|--------------------|----------------|--------|
| 1      | April 8, 2026      | 415.555.0182   | 6.5    |

should become:

1, 2026-04-08, (415) 555-0182, $6.50

---

Please work through the records in order, starting with Record 1.

---

| Record | Date               | Phone Number   | Amount |
|--------|--------------------|----------------|--------|
| 1      | April 8, 2026      | 415.555.0182   | 6.5    |
| 2      | 2026/05/17         | 2125550147     | $12    |
| 3      | June 21, 2026      | 646-555-0139   | 4.75   |
| 4      | 2026/07/03         | (917)5550186   | $8     |
| 5      | August 14, 2026    | 718.555.0114   | 5.5    |
| 6      | 2026/09/06         | 2025550172     | $11.2  |
| 7      | September 19, 2026 | 305-555-0186   | 7      |
| 8      | 2026/10/11         | (312)5550140   | $4.8   |
| 9      | October 25, 2026   | 617.555.0191   | 9.25   |
| 10     | 2026/11/06         | 2135550195     | $13    |
| 11     | November 18, 2026  | (408)5550173   | 6.75   |
| 12     | 2026/12/04         | 503-555-0136   | $5     |
| 13     | December 22, 2026  | 702.555.0157   | 10.5   |
| 14     | 2026/01/03         | (206)5550148   | $7.4   |
| 15     | January 15, 2026   | 4045550127     | 8.25   |
| 16     | 2026/02/08         | 602.555.0169   | $14    |
| 17     | February 19, 2026  | 713-555-0118   | 5.6    |
| 18     | 2026/03/07         | (512)5550193   | $9     |
| 19     | March 24, 2026     | 8015550176     | 6.3    |
| 20     | 2026/04/13         | 919.555.0109   | $12.5  |
| 21     | April 28, 2026     | 314-555-0182   | 4      |
| 22     | 2026/05/05         | (720)5550134   | $7.75  |
| 23     | May 26, 2026       | 9015550155     | 11.5   |
| 24     | 2026/06/17         | 469.555.0124   | $6     |
| 25     | June 30, 2026      | 704-555-0161   | 8.4    |
| 26     | 2026/07/12         | (816)5550190   | $15    |
| 27     | July 21, 2026      | 8575550146     | 5.25   |
| 28     | 2026/08/09         | 971.555.0103   | $10.8  |
| 29     | August 27, 2026    | 678-555-0179   | 7.5    |
| 30     | 2026/09/16         | (410)5550129   | $9.3   |

`,

  'task4': `You work at Lucky Coffee and are responsible for responding to customer feedback. A customer has submitted the complaint below. Read the complaint and write a reply as a Lucky Coffee representative.

  Lucky Coffee has already approved a full refund and one complimentary drink on a future visit. You do not need to determine or explain why the incident occurred or decide what compensation should be offered.

  **In your response**: 
  
  - Acknowledge what happened and recognize the customer’s frustration and disappointment, including the fact that their time was wasted and that they are a regular customer. 

  - Communicate the approved full refund and complimentary drink, and let the customer know that their experience is being taken seriously. 
  
  - Respond in a sincere, empathetic, and considerate way that helps the customer feel heard and respected, rebuilds trust, and preserves the customer relationship.

*Note: A response of about 80–200 words is generally sufficient, but you may write more or less as needed to fully address the task.*

---

#### Customer Complaint

Yesterday I waited more than 30 minutes for my drink, and when it arrived, it was the wrong order. When I asked a staff member for help, the response felt dismissive, and I left feeling frustrated and disappointed.

I’ve been a regular customer at Lucky Coffee and have always trusted the store, so this experience was especially disappointing. I’m not sure I want to come back.

<div align="right">Tony</div>

---`,

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
  'G2-AI': {
    allowCopy: true,
    allowPaste: true,
    allowChat: true,
  },
  'G3-HumanAndAI': {
    allowCopy: false,
    allowPaste: false,
    allowChat: false,
  },
}

export async function POST(request: Request) {
  try {
    const { prolificId, taskId, groupType, studyId, prolificSessionId } = await request.json()

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
      .maybeSingle()

    let userId: string

    if (existingUser) {
      userId = existingUser.id
      // Update study_id and prolific_session_id if provided
      if (studyId || prolificSessionId) {
        await supabaseServer
          .from('users')
          .update({
            study_id: studyId || null,
            prolific_session_id: prolificSessionId || null,
          })
          .eq('id', userId)
      }
    } else {
      const { data: newUser, error: userError } = await supabaseServer
        .from('users')
        .insert({
          prolific_id: prolificId,
          study_id: studyId || null,
          prolific_session_id: prolificSessionId || null,
        })
        .select('id')
        .maybeSingle()

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