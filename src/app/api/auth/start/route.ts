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

---

Note: A response of about 80–200 words is recommended, but you may write more or less as needed to fully address the task.

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
  
---

Note: A response of about 80–200 words is recommended, but you may write more or less as needed to fully address the task.

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

  'task3': `You work at Lucky Coffee. The store manager has collected customer comments from an online review site and needs you to label each review using one of three categories.


Your task: for each review, choose the **ONE label that fits best** from the three below.

- **Service**: What the staff do (e.g., assistance, order handling, or other staff behavior)

- **Environment**: What the store is like (e.g., space, facilities, or cleanliness)

- **Product**: What the drink or food is like (e.g., taste, temperature, sweetness, or strength)

For each comment, enter the review number and corresponding label on a separate line using the following format: 

**Number,Label**

---

For example:

1,Service

2,Environment

3,Product

---

Work through the reviews in order, starting with Review 1. Complete as many reviews as you can within the time available.

---

|Number|Review|
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
| 16 | My iced latte was really well mixed, with no separation at all. |
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
| 32 | Barista wrote down my complicated custom order and read it back to make sure it was right. |
| 33 | Windows upstairs actually open, so the air feels way better than downstairs. |
| 34 | This latte has a strong coconut flavor, honestly like it even more over ice. |
| 35 | Dividers between the tables actually work — you can barely hear the table next to you. |
| 36 | Barista kept an eye on my order and called my name the second it was ready. |
| 37 | My hands were full, so the barista brought my order right to the table. |
| 38 | Barista asked if I needed utensils before handing over my breakfast sandwich. |
| 39 | Cold brew was strong, one cup woke me right up. |
| 40 | There’s a good mix of bigger tables and little two‑person spots. |
| 41 | Oat milk latte tasted kind of weak today. |
| 42 | These chairs are so comfy, I can sit for hours. |
| 43 | Cappuccino had a nice thick layer of foam with a little cinnamon on top. |
| 44 | Barista reminded me to give my drink a stir before drinking. |
| 45 | Matcha latte was a little bitter today. |
| 46 | Hot latte had really smooth foam, easy to drink. |
| 47 | Cold brew with oat milk was smoother, easier to drink. |
| 48 | Barista put a sleeve on my cup so I wouldn't burn my hand. |
| 49 | Seats in the back upstairs don't get much natural light. |
| 50 | Almost left one of my drinks behind, but the cashier caught it and stopped me. |
| 51 | Staff helped an older customer carry a couple drinks over to their table. |
| 52 | Restroom's always stocked with soap and paper towels. |
| 53 | Staff noticed we had a little one with us and brought over a high chair. |
| 54 | The seasonal drink was good, though the whipped cream made it a little too rich for me. |
| 55 | Pour‑over had a really floral flavor with a slightly sweet finish. |
| 56 | Mocha was a bit too sweet today. |
| 57 | Barista saw me staring at the menu and patiently ran through some of the bestsellers. |
| 58 | Vanilla latte had a clear vanilla flavor, gently sweet. |
| 59 | Coconut latte was less sweet today, honestly liked it better that way. |
| 60 | The cold foam was fluffy and held up all the way through the drink. |
| 61 | Hot Americano was pretty strong, more bitter than usual. |
| 62 | Hot chocolate was rich enough to feel like a treat, but not too thick. |
| 63 | The iced coffee could’ve used a little more coffee flavor—it tasted slightly diluted. |
| 64 | My cappuccino was a little hotter than I expected, but the espresso itself tasted great. |
| 65 | Caramel macchiato was extra sweet today. |
| 66 | Background music stays low, not distracting at all. |
| 67 | It’s easy to find a quiet seat if you come before 10 a.m. |
| 68 | The cashier made sure my gift card balance covered everything before charging my card. |
| 69 | My rewards points were about to expire, and the barista put in a request to extend them for me. |
| 70 | I like sitting in the back — quiet enough to actually get work done. |
| 71 | Loved the coconut flavor in the latte — tastes natural, not overly sweet. |
| 72 | The blonde roast was milder than I usually go for, but it was smooth and easy to drink. |
| 73 | Cashier reminded me it was rewards member day. |
| 74 | The front area can be a little drafty when the door keeps opening. |
| 75 | The iced matcha was earthy and smooth, not that overly sugary kind. |
| 76 | The staff packed my pastry separately so it wouldn’t get squished in my bag. |
| 77 | Lighting's nice and soft, my eyes don't get tired even at night. |
| 78 | Not enough outlets here, wish there were more. |
| 79 | Caramel latte is pretty sweet, starts to feel heavy after a while. |
| 80 | Warm lighting at night is easy on the eyes, not too bright. |
| 81 | Had two separate orders, and the barista combined the rewards points without me even asking. |
| 82 | Caramel macchiato had a really nice balance. |
| 83 | Americano tasted a bit sour today, maybe they switched up the beans. |
| 84 | Staff let me know the kitchen was running behind before I had to ask. |
| 85 | Some rewards points were missing, and the barista went ahead and added them manually. |
| 86 | Took me forever to decide, and the barista was patient the whole time. |
| 87 | Cashier reminded me I had an unused coupon sitting in the app. |
| 88 | Barista double‑checked the seal on my to‑go cup before handing it over. |
| 89 | Plenty of table space for a laptop and notebook. |
| 90 | Foam on my hot latte was so smooth and creamy. |
| 91 | Barista remembered my order from last time and asked if I wanted the usual. |
| 92 | Had a ton of stuff with me, so the barista cleared off a bigger table. |
| 93 | The music changes throughout the day, but it always fits the vibe. |
| 94 | Chairs have cushioned seats, so they're comfortable even if you camp out for hours. |
| 95 | The restroom mirror and counter were clean, which is always a good sign. |
| 96 | Cold brew leaves a nice aftertaste. |
| 97 | Ordered a dessert to go, and the barista packed it in its own box. |
| 98 | The restroom is small, but it’s clearly looked after. |
| 99 | Staff offered to combine my two orders onto one check. |
| 100 | There's an outlet right by this seat, makes working on a laptop so much easier. |
| 101 | Lighting's nice and warm at night, whole place feels calm. |
| 102 | Cashier told me about the BOGO deal even though I never asked. |
| 103 | Coconut latte tasted more like coconut than coffee today. |
| 104 | Barista got every detail on my receipt right the first time. |
| 105 | The hazelnut latte was creamy and not overly syrupy. |
| 106 | Oat milk latte was sweet enough on its own, didn't need to add anything. |
| 107 | The iced mocha tasted more like actual cocoa than sugary chocolate sauce. |
| 108 | Hot Americano stayed warm till the very last sip. |
| 109 | Barista mentioned my drink had light ice and suggested I drink it soon. |
| 110 | Mocha had a nice balance of chocolate and coffee. |
| 111 | Cold brew was so refreshing, no bitterness at all. |
| 112 | Love the high ceilings, makes the whole place feel open. |
| 113 | Background noise is low enough that I can focus without headphones. |
| 114 | Had two drinks, and the barista put them both on one tray for me. |
| 115 | My iced Americano was smoother than usual, less acidic too. |
| 116 | Booths in the back are pretty private, great if you want to actually talk. |
| 117 | The pour‑over tasted bright and clean, with a really crisp finish. |
| 118 | The window seats get amazing afternoon light, perfect spot for reading. |
| 119 | Flat white tasted more like coffee today, less milk than usual. |
| 120 | Iced Americano was pretty acidic today, had a fruity finish though. |
| 121 | Restroom's clean and doesn't smell at all. |
| 122 | They kept my iced drink behind the counter while I waited for my food, so it didn’t melt. |
| 123 | There's a little rack by the register for your bag, super convenient. |
| 124 | I like adding a little coconut milk to my cold brew, makes it so much smoother. |
| 125 | The plants around the store give the space a relaxed, natural feel. |
| 126 | AC runs a little cold in here. |
| 127 | Iced latte had way too much ice. |
| 128 | Tables are spaced out well, easy to walk around. |
| 129 | The Wi‑Fi held up really well while I was on a video call. |
| 130 | Sitting by the window watching people go by is oddly relaxing. |
| 131 | Foam on the cappuccino was a bit dry, but the cocoa dusting on top was spot on. |
| 132 | Spilled some coffee and staff came over to clean it up without me even asking. |
| 133 | The cashier reminded me about a coupon before I even brought it up. |
| 134 | Plants and wooden tables look great together, gives the place a really natural feel. |
| 135 | Oat milk latte was the perfect temperature, could drink it right away. |
| 136 | Couldn't find a seat, so the barista pointed me to an open table in the back. |
| 137 | Seats by the door get a lot of foot traffic — much quieter if you sit further in. |
| 138 | Tables are always wiped down well, never sticky. |
| 139 | Temperature inside is always comfortable, never feels too cold. |
| 140 | The place has a relaxed neighborhood feel, even when it’s fairly full. |
| 141 | The patio’s surprisingly peaceful in the morning. |
| 142 | Had my pet with me, and the staff showed us where we could sit. |
| 143 | I accidentally ordered the wrong size, but the barista fixed it right away, no questions asked. |
| 144 | Tried oat milk in my latte and it worked out really well. |
| 145 | The barista labeled both my drinks so I could tell them apart easily. |
| 146 | Music's at a good volume — you can actually hold a conversation without raising your voice. |
| 147 | Staff was super patient answering all my questions about the new drinks. |
| 148 | The espresso shot had a rich flavor and no burnt aftertaste. |
| 149 | Forgot to scan for rewards points, but the staff went back and added them for me. |
| 150 | These couches are so comfy, I could sit here alone for hours. |
| 151 | Barista reprinted my receipt right away, no hassle. |
| 152 | Love the seats by the big windows — the view makes it such a relaxing spot. |
| 153 | Mocha was loaded with chocolate, which made it sweeter than usual. |
| 154 | The hooks under the counter are handy for hanging a backpack or tote. |
| 155 | I changed my mind at the register, and the cashier updated the order without any attitude. |
| 156 | The tables near the back have plenty of space between them, so it never feels crowded. |
| 157 | Chai latte had a warm cinnamon kick without tasting overly spicy. |
| 158 | The barista checked the syrup ingredients carefully when I mentioned my nut allergy. |
| 159 | There’s a bike rack right outside, which makes stopping by really convenient. |
| 160 | The menu board is clear enough to read before you reach the register. |
| 161 | The lemonade was tart and fresh, not overloaded with sugar. |
| 162 | Staff warmed my pastry and timed it so it came out with my drink. |
| 163 | The decaf coffee still tasted full‑bodied, not thin or flat. |
| 164 | The ramp at the entrance makes it easy to come in with a stroller. |
| 165 | Barista rinsed my reusable cup before filling it, which I appreciated. |
| 166 | Peppermint mocha had a clean mint flavor without tasting like toothpaste. |
| 167 | There’s a coat rack near the entrance, really useful on rainy days. |
| 168 | The barista offered me a small sample before I committed to the seasonal drink. |
| 169 | The restroom has a changing table, which is helpful for parents. |
| 170 | Staff brought me a cup of water while I waited for the rest of my order. |
| 171 | My black tea had steeped a little too long and tasted slightly astringent. |
| 172 | Barista marked the lid clearly so I knew which drink was dairy‑free. |
| 173 | The honey latte had a soft floral sweetness that didn’t overpower the espresso. |
| 174 | The staircase has a sturdy handrail and doesn’t feel too steep. |
| 175 | Staff brought out a bowl of water when they saw my dog on the patio. |
| 176 | The recycling and trash bins are clearly labeled, so sorting everything is easy. |
| 177 | The rooibos tea was mellow and naturally sweet without any syrup. |
| 178 | The restroom hand dryer is surprisingly quiet. |
| 179 | The turmeric latte tasted earthy with just enough ginger to brighten it up. |
| 180 | Barista gave us an extra empty cup so we could split one drink. |
| 181 | The cascara drink had a light fruity flavor, almost like dried cherries. |
| 182 | Cashier helped me load the exact amount I wanted onto a gift card. |
| 183 | The aisles are wide enough to move through comfortably with a stroller. |
| 184 | The ristretto shot had a concentrated flavor with a caramel‑like finish. |
| 185 | The iced hibiscus tea was bright and tangy without being too sharp. |
| 186 | There’s a covered stand by the entrance where you can leave a wet umbrella. |
| 187 | Staff gave me clear directions to the nearest bus stop when I asked. |
| 188 | The stairs have nonslip strips, which helps when it’s raining outside. |
| 189 | The espresso con panna had just enough cream to soften the strong coffee taste. |
| 190 | Barista offered me a ceramic mug when they realized I was staying in. |
| 191 | Trash bins are placed near the exits, so you don’t have to search for one. |
| 192 | The barista offered to refill my water bottle before I left. |
| 193 | The honey latte tasted floral, not just sweet. |
| 194 | Cashier walked me through loading a gift card in the app. |
| 195 | Almond milk latte had a light nutty taste that didn't fight the espresso. |
| 196 | Shared long table works well if you're solo and don't need a four‑top. |
| 197 | Extra‑hot latte tasted a bit cooked — milk got scalded. |
| 198 | Skylight upstairs keeps it bright even on gray days. |
| 199 | Cashier found the card I dropped and held it at the register. |
| 200 | Barista warmed my croissant before putting it in the bag. |
| 201 | Floor‑to‑ceiling shelves give the place a nice library feel. |
| 202 | Honey lavender latte was fragrant without being too floral. |
| 203 | The brown sugar boba latte had a nice chew to the pearls. |
| 204 | There's a small garden out back that's nice for sitting in the morning. |
| 205 | Barista wrote a little note on my cup for my friend's birthday. |
| 206 | Iced mocha had just the right amount of chocolate drizzle. |
| 207 | Cashier let me know my card had already been charged once, so I didn't double pay. |
| 208 | Barista held the door open for me since my hands were full. |
| 209 | Pistachio latte had a rich, nutty flavor that wasn't too sweet. |
| 210 | Staff brought extra napkins over before I even asked. |
| 211 | The plain croissant was buttery and flaky, paired well with coffee. |
| 212 | The restroom is cramped and doesn’t have much space. |
| 213 | The wallpaper gives the space a warm, homey feel. |
| 214 | Brown butter latte had a subtle toasty flavor I really enjoyed. |
| 215 | Standing charging stations near the counter are handy for a quick top‑up. |
| 216 | The skylight brings in nice light without making the room too warm. |
| 217 | Cashier explained the app's referral bonus when I asked about it. |
| 218 | Cortado had a good coffee‑to‑milk ratio, strong but smooth. |
| 219 | Booth cushions could use a bit more padding. |
| 220 | Barista offered to box up my leftover pastry for later. |
| 221 | The seasonal pumpkin drink had a nice spice blend, not too sweet. |
| 222 | The bookshelf by the window has a nice little reading nook. |
| 223 | Staff apologized and remade my order after mixing up my ticket. |
| 224 | Iced chai was well spiced but a bit too sweet for me. |
| 225 | Umbrellas on the patio make sitting outside comfortable even when it drizzles. |
| 226 | The banana bread was moist and paired nicely with a latte. |
`,

  'task4': `You work at Lucky Coffee and are responsible for responding to customer feedback. A customer has submitted the complaint below. Read the complaint and write a reply as a Lucky Coffee representative.

  Lucky Coffee has already approved a full refund and one complimentary drink on a future visit. You do not need to determine or explain why the incident occurred or decide what compensation should be offered.

  **In your response**: 
  
  - Acknowledge what happened and recognize the customer’s frustration and disappointment, including the fact that their time was wasted and that they are a regular customer. 

  - Communicate the approved full refund and complimentary drink, and let the customer know that their experience is being taken seriously. 
  
  - Respond in a sincere, empathetic, and considerate way that helps the customer feel heard and respected, rebuilds trust, and preserves the customer relationship.

---

Note: A response of about 80–200 words is recommended, but you may write more or less as needed to fully address the task.

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