import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

const TASK_CONTENTS = {
  'task1': `You work at Lucky Coffee, an affordable coffee chain known for its comfortable stores and relaxed vibe. Its main customers are nearby office workers and students. The manager wants to celebrate the store's third anniversary with an in-store event and has asked you to plan it.

Design an anniversary event that meets the following requirements:

1. Goals: Bring customers into the store and encourage them to stay, motivate them to take and share photos, and significantly boost the store's sales and brand awareness.

2. What to include: Describe the activities included in the event, how it works, and/or how customers would take part.`,

  'task1-2': `

You work at Lucky Coffee, an affordable coffee chain known for its comfortable stores and relaxed vibe. Its main customers are nearby office workers and students. The manager wants to celebrate the store's third anniversary with an in-store event and has asked you to plan it.

Design an anniversary event that meets the following requirements:

1. Goals: Bring customers into the store and encourage them to stay, motivate them to take and share photos, and significantly boost the store's sales and brand awareness.

2. What to include: **Describe what the event is?Describe the activities included in the event**, how it works, and/or how customers would take part.`,

  'task2': `You work at Lucky Coffee. Over the past few months, two changes have occurred: a nearby competitor, Bingo Coffee, opened, and Lucky Coffee later reduced the number of employees working during the afternoon by one. During this period, Lucky Coffee’s afternoon drink sales declined.

  Two possible explanations have been suggested:

  **Explanation A:** The opening of Bingo Coffee contributed to the decline by attracting some of Lucky Coffee’s customers.

  **Explanation B:** The reduction in afternoon staffing contributed to the decline by making customers less willing to visit Lucky Coffee.

  The manager has asked you to review the available information and assess how well each explanation is supported by the evidence and which appears to be the more important explanation for the decline.

  Use the four materials below to make your assessment.

  Please:
  
  1. Give your overall assessment of the two explanations. 

  2. Explain the reasons for your assessment. 

  3. Use evidence from all four materials. 

  4. Base your answer only on the information provided. 

---

#### Material 1: Afternoon Drink Sales

Bingo Coffee opened near Lucky Coffee. Lucky Coffee kept its afternoon staffing unchanged for the next two months. At the beginning of the third month after Bingo Coffee opened, Lucky Coffee reduced its afternoon staffing by one employee.

Lucky Coffee’s average weekday drink sales between 2:00 and 5:00 p.m. were:

1. Before Bingo Coffee opened: 120 drinks 

2. First month after Bingo Coffee opened: 118 drinks 

3. Second month after Bingo Coffee opened: 116 drinks 

4. First month after Lucky Coffee reduced its afternoon staffing: 95 drinks 

Bingo Coffee’s average weekday afternoon drink sales were about **75 drinks in its first month** and **84 drinks in its third month**.

---

#### Material 2: Waiting Time After the Staffing Change

After Lucky Coffee reduced its afternoon staffing:

1. Average customer waiting time increased from about **4 minutes** to **9 minutes**. 

2. Drink prices remained unchanged. 

3. The menu remained unchanged. 

4. Store seating remained unchanged. 

---

#### Material 3: Customer Survey

Lucky Coffee surveyed 60 customers who said they had recently started visiting the store less often between 2:00 and 5:00 p.m.

When asked for the main reason they were visiting less often:

1. **24** said the waiting time had become too long. 

2. **14** said they had started going to Bingo Coffee more often. 

3. **12** said their work or class schedule had changed. 

4. **6** said they were drinking less coffee in general. 

5. **4** gave other reasons. 

---

#### Material 4: Customer Groups

Lucky Coffee also compared changes in afternoon visits among two groups of regular customers after the staffing change:

- Among customers who usually **ordered at the counter**, afternoon visits decreased by **22%**. 

- Among customers who usually **ordered ahead through the app**, afternoon visits decreased by **5%**. 

Both groups had access to Bingo Coffee. Customers who ordered ahead through the app could usually pick up their drinks without waiting in the in-store ordering line.
`,

  'task3': `You work at Lucky Coffee. The store manager has collected customer comments from an online review site and needs you to sort them into categories.

  Your job: for each review, choose the ONE label that fits best from the three below.

🏷️ Service: What staff do (e.g., help, assistance, or other staff behavior)

🏷️ Environment: What the store is like (e.g., space, facilities, or cleanliness)

🏷️ Product: What the drink is like (e.g., taste, temperature, sweetness, or strength)

---

For each comment, list the number and corresponding label on a separate line in the following format: Number, Label

For example:

1, Service

2, Atmosphere

3, Drinks
  
…

---

| Number | Content |
|------|------|
| 1 | The barista gave me a quick recommendation when I said I wanted something not too sweet. |
| 2 | My latte was a little too milky today — couldn't really taste the coffee. |
| 3 | Espresso smelled amazing and tasted really smooth. |
| 4 | Love the window seats, tons of natural light. |
| 5 | Barista double‑checked my special requests and got everything right. |
| 6 | The mocha was heavy on chocolate, kind of drowned out the coffee flavor. |
| 7 | The iced tea was light and refreshing, not watered down at all. |
| 8 | Barista let me know right when my drink was ready. |
| 9 | Barista noticed my drink had been sitting and offered to make a fresh one. |
| 10 | Staff noticed my hands were full and brought me a tray without asking. |
| 11 | Vanilla latte was sweetened just right for me. |
| 12 | The barista noticed I was waiting on a mobile order and checked on it for me. |
| 13 | Latte art was gorgeous, and it tasted just as smooth. |
| 14 | Cashier caught a mistake on my receipt and fixed it before I even said anything. |
| 15 | Flat white had a great balance of milk and coffee. |
| 16 | My iced latte sat for a bit, but it was still well mixed. |
| 17 | Seats along the wall have outlets, good pick if you're trying to get work done. |
| 18 | The drip coffee tasted fresh and had a nice nutty flavor. |
| 19 | Barista patiently walked me through the differences between the new drinks. |
| 20 | There’s enough room between tables that you don’t feel like you’re sitting with strangers. |
| 21 | Staff tied up my to‑go bag so it was easy to carry. |
| 22 | This place is spotless, floors are always clean. |
| 23 | Americano was pretty bitter today, but not very acidic at least. |
| 24 | Cashier processed my refund super quickly. |
| 25 | The outdoor tables have enough shade to sit comfortably even when it’s sunny. |
| 26 | Touchless faucets in the restroom are a nice touch. |
| 27 | The caramel flavor was subtle, which I actually appreciated. |
| 28 | The little corner near the bookshelf is probably the coziest place in the shop. |
| 29 | Corner couch is comfy and feels pretty private. |
| 30 | Cashier applied my rewards and coupon together, super convenient. |
| 31 | Upstairs is way quieter than the first floor. |
| 32 | Barista noticed I was waiting on a mobile order and checked on it for me. |
| 33 | Barista wrote down my complicated custom order and read it back to make sure it was right. |
| 34 | Windows upstairs actually open, so the air feels way better than downstairs. |
| 35 | This latte has a strong coconut flavor, honestly like it even more over ice. |
| 36 | Dividers between the tables actually work — you can barely hear the table next to you. |
| 37 | Drink got cold, but the barista reheated it for me no problem. |
| 38 | Barista kept an eye on my order and called my name the second it was ready. |
| 39 | My hands were full, so the barista brought my order right to the table. |
| 40 | Barista asked if I needed utensils before handing over my breakfast sandwich. |
| 41 | Cold brew was strong, one cup woke me right up. |
| 42 | There’s a good mix of bigger tables and little two‑person spots. |
| 43 | Oat milk latte tasted kind of weak today. |
| 44 | These chairs are so comfy, I can sit for hours. |
| 45 | Barista helped me find a seat near an outlet. |
| 46 | Cappuccino had a nice thick layer of foam with a little cinnamon on top. |
| 47 | Barista reminded me to give my drink a stir before drinking. |
| 48 | Matcha latte was a little bitter today. |
| 49 | Hot latte had really smooth foam, easy to drink. |
| 50 | Cold brew with oat milk was smoother, easier to drink. |
| 51 | Barista put a sleeve on my cup so I wouldn't burn my hand. |
| 52 | Seats in the back upstairs don't get much natural light. |
| 53 | Almost left one of my drinks behind, but the cashier caught it and stopped me. |
| 54 | Staff helped an older customer carry a couple drinks over to their table. |
| 55 | Restroom's always stocked with soap and paper towels. |
| 56 | Staff noticed we had a little one with us and brought over a high chair. |
| 57 | The seasonal drink was good, though the whipped cream made it a little too rich for me. |
| 58 | Pour‑over had a really floral flavor with a slightly sweet finish. |
| 59 | Mocha was a bit too sweet today. |
| 60 | Barista saw me staring at the menu and patiently ran through some of the bestsellers. |
| 61 | Vanilla latte had a clear vanilla flavor, gently sweet. |
| 62 | Coconut latte was less sweet today, honestly liked it better that way. |
| 63 | The cold foam was fluffy and held up all the way through the drink. |
| 64 | Hot Americano was pretty strong, more bitter than usual. |
| 65 | Hot chocolate was rich enough to feel like a treat, but not too thick. |
| 66 | The iced coffee could’ve used a little more coffee flavor—it tasted slightly diluted. |
| 67 | My cappuccino was a little hotter than I expected, but the espresso itself tasted great. |
| 68 | Love the window seats, tons of natural light. |
| 69 | Caramel macchiato was extra sweet today. |
| 70 | Background music stays low, not distracting at all. |
| 71 | It’s easy to find a quiet seat if you come before 10 a.m. |
| 72 | The cashier made sure my gift card balance covered everything before charging my card. |
| 73 | My rewards points were about to expire, and the barista put in a request to extend them for me. |
| 74 | I like sitting in the back — quiet enough to actually get work done. |
| 75 | Loved the coconut flavor in the latte — tastes natural, not overly sweet. |
| 76 | The blonde roast was milder than I usually go for, but it was smooth and easy to drink. |
| 77 | Cashier reminded me it was rewards member day. |
| 78 | The front area can be a little drafty when the door keeps opening. |
| 79 | The barista noticed my drink had been sitting and offered to make a fresh one. |
| 80 | The iced matcha was earthy and smooth, not that overly sugary kind. |
| 81 | The staff packed my pastry separately so it wouldn’t get squished in my bag. |
| 82 | Lighting's nice and soft, my eyes don't get tired even at night. |
| 83 | Not enough outlets here, wish there were more. |
| 84 | Barista noticed I was waiting on a mobile order and checked on it for me. |
| 85 | Caramel latte is pretty sweet, starts to feel heavy after a while. |
| 86 | Warm lighting at night is easy on the eyes, not too bright. |
| 87 | Had two separate orders, and the barista combined the rewards points without me even asking. |
| 88 | Caramel macchiato had a really nice balance. |
| 89 | Americano tasted a bit sour today, maybe they switched up the beans. |
| 90 | Staff let me know the kitchen was running behind before I had to ask. |
| 91 | Some rewards points were missing, and the barista went ahead and added them manually. |
| 92 | Took me forever to decide, and the barista was patient the whole time. |
| 93 | Windows upstairs actually open, so airflow's way better than downstairs. |
| 94 | Cashier reminded me I had an unused coupon sitting in the app. |
| 95 | Love the window seats, tons of natural light. |
| 96 | Outdoor tables have enough shade to sit comfortably even when it’s sunny. |
| 97 | Barista double‑checked the seal on my to‑go cup before handing it over. |
| 98 | Plenty of table space for a laptop and notebook. |
| 99 | Foam on my hot latte was so smooth and creamy. |
| 100 | Barista remembered my order from last time and asked if I wanted the usual. |
| 101 | Had a ton of stuff with me, so the barista cleared off a bigger table. |
| 102 | The music changes throughout the day, but it always fits the vibe. |
| 103 | Chairs have cushioned seats, so they're comfortable even if you camp out for hours. |
| 104 | The restroom mirror and counter were clean, which is always a good sign. |
| 105 | Cold brew leaves a nice aftertaste. |
| 106 | Ordered a dessert to go, and the barista packed it in its own box. |
| 107 | The restroom is small, but it’s clearly looked after. |
| 108 | Staff offered to combine my two orders onto one check. |
| 109 | There's an outlet right by this seat, makes working on a laptop so much easier. |
| 110 | Lighting's nice and warm at night, whole place feels calm. |
| 111 | Cashier told me about the BOGO deal even though I never asked. |
| 112 | Coconut latte tasted more like coconut than coffee today. |
| 113 | Barista got every detail on my receipt right the first time. |
| 114 | The hazelnut latte was creamy and not overly syrupy. |
| 115 | Oat milk latte was sweet enough on its own, didn't need to add anything. |
| 116 | The iced mocha tasted more like actual cocoa than sugary chocolate sauce. |
| 117 | Hot Americano stayed warm till the very last sip. |
| 118 | Barista mentioned my drink had light ice and suggested I drink it soon. |
| 119 | Mocha had a nice balance of chocolate and coffee. |
| 120 | Cold brew was so refreshing, no bitterness at all. |
| 121 | Love the high ceilings, makes the whole place feel open. |
| 122 | Background noise is low enough that I can focus without headphones. |
| 123 | Had two drinks, and the barista put them both on one tray for me. |
| 124 | My iced Americano was smoother than usual, less acidic too. |
| 125 | Cashier gave me a heads‑up that one of the pastries was fresh out of the oven. |
| 126 | Booths in the back are pretty private, great if you want to actually talk. |
| 127 | The pour‑over took a few minutes, but it came out bright, clean, and worth the wait. |
| 128 | The window seats get amazing afternoon light, perfect spot for reading. |
| 129 | Flat white tasted more like coffee today, less milk than usual. |
| 130 | Iced Americano was pretty acidic today, had a fruity finish though. |
| 131 | Restroom's clean and doesn't smell at all. |
| 132 | They kept my iced drink behind the counter while I waited for my food, so it didn’t melt. |
| 133 | There's a little rack by the register for your bag, super convenient. |
| 134 | I like adding a little coconut milk to my cold brew, makes it so much smoother. |
| 135 | The plant vibe is nice. |
| 136 | AC runs a little cold in here. |
| 137 | Iced latte had way too much ice. |
| 138 | Tables are spaced out well, easy to walk around. |
| 139 | The Wi‑Fi held up really well while I was on a video call. |
| 140 | Sitting by the window watching people go by is oddly relaxing. |
| 141 | Foam on the cappuccino was a bit dry, but the cocoa dusting on top was spot on. |
| 142 | Spilled some coffee and staff came over to clean it up without me even asking. |
| 143 | The cashier reminded me about a coupon before I even brought it up. |
| 144 | Plants and wooden tables look great together, gives the place a really natural feel. |
| 145 | Oat milk latte was the perfect temperature, could drink it right away. |
| 146 | Couldn't find a seat, so the barista pointed me to an open table in the back. |
| 147 | Seats by the door get a lot of foot traffic — much quieter if you sit further in. |
| 148 | Tables are always wiped down well, never sticky. |
| 149 | Temperature inside is always comfortable, never feels too cold. |
| 150 | The place has a relaxed neighborhood feel, even when it’s fairly full. |
| 151 | Barista patiently walked me through the differences between the new drinks. |
| 152 | The patio’s surprisingly peaceful in the morning. |
| 153 | Had my pet with me, and the staff showed us where we could sit. |
| 154 | I accidentally ordered the wrong size, but the barista fixed it right away, no questions asked. |
| 155 | Tried oat milk in my latte and it worked out really well. |
| 156 | The barista labeled both my drinks so I could tell them apart easily. |
| 157 | Music's at a good volume — you can actually hold a conversation without raising your voice. |
| 158 | Staff was super patient answering all my questions about the new drinks. |
| 159 | The espresso shot had a rich flavor and no burnt aftertaste. |
| 160 | Forgot to scan for rewards points, but the staff went back and added them for me. |
| 161 | Cold brew was so refreshing, no bitterness at all. |
| 162 | These couches are so comfy, I could sit here alone for hours. |
| 163 | Barista reprinted my receipt right away, no hassle. |
| 164 | Love the seats by the big windows — the view makes it such a relaxing spot. |
| 165 | Mocha was loaded with chocolate, which made it sweeter than usual. |
| 166 | The hooks under the counter are handy for hanging a backpack or tote. |
| 167 | I changed my mind at the register, and the cashier updated the order without any attitude. |`,

  'task4': `You work at Lucky Coffee and handle customer feedback. A customer's complaint below has been confirmed as accurate by store records. Read it and write a reply as a Lucky Coffee representative.

Goal: communicate appropriately, calm the customer down, offer help, and preserve the relationship.

---

#### Customer Complaint

Yesterday I ordered a hot latte. I get that it was busy, but I waited over 30 minutes with zero explanation. Worse, the drink was cold and turned out to be an Americano, not a latte.

I flagged it down with one of the staff, and all I got back was "we're pretty swamped right now, so either hang tight for a remake or we can just refund you." After already losing 30 minutes, I'm supposed to wait another 30? And a refund doesn't give me my time back. I was so frustrated that I just left the coffee there and walked out.

I've always trusted Lucky Coffee and been a regular here. This really let me down, and I don't think I'll be back. Either way, I feel like I deserve an explanation.

—— Tony

---

Requirements: 200‑300 words`,

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