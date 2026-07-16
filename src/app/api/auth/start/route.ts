import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// Sample task content for the four task types (long versions for testing scroll)
const TASK_CONTENTS = {
  'Type A': `Climate change is one of the most pressing issues of our time, a challenge that demands our immediate and sustained attention. Over the past century, global average temperatures have risen by approximately 1.1 degrees Celsius, a seemingly small number that belies its profound impact on our planet's delicate ecosystems. This temperature increase has triggered a cascade of environmental changes: polar ice caps are melting at an alarming rate, sea levels are rising steadily, threatening coastal communities and small island nations, and extreme weather events - from hurricanes and floods to droughts and wildfires - are becoming more frequent and intense across the globe.

Scientists overwhelmingly agree that human activity, particularly the burning of fossil fuels like coal, oil, and natural gas, is the primary driver of this warming trend. When we burn these fuels for energy, transportation, and industry, we release massive quantities of greenhouse gases - most notably carbon dioxide (CO2) and methane - into the atmosphere. These gases act like a blanket, trapping heat from the sun that would otherwise radiate back into space, creating what is commonly known as the greenhouse effect. The concentration of CO2 in the atmosphere has increased by more than 40% since the Industrial Revolution, reaching levels not seen in millions of years.

Addressing climate change requires urgent, collective action on a global scale. There is no single solution; rather, we need a multifaceted approach that tackles the problem from multiple angles. This includes rapidly transitioning from fossil fuels to renewable energy sources like solar, wind, hydro, and geothermal power. We must also dramatically improve energy efficiency in our buildings, transportation systems, and industries. Protecting and restoring our forests, wetlands, and other natural carbon sinks is another critical piece of the puzzle, as these ecosystems absorb CO2 from the atmosphere. Additionally, we need to adopt more sustainable practices in agriculture, reduce waste, and promote circular economy models.

While government policies and international agreements are essential, individual actions also matter more than many people realize. Simple, everyday steps like reducing energy consumption at home, driving less or switching to electric vehicles, minimizing waste through recycling and composting, eating more plant-based foods, and supporting sustainable products and companies can all contribute to the solution when multiplied across millions or billions of people. Individual choices can also drive market change and create demand for sustainable alternatives.

Please write a short essay (200-300 words) discussing what you believe is the most important action we can take to address climate change, and why you think this action is particularly crucial. Support your argument with reasoning and, if possible, examples.`,
  
  'Type B': `The rise of artificial intelligence (AI) represents one of the most transformative technological developments in human history, fundamentally altering nearly every aspect of modern life. From healthcare and education to transportation, entertainment, and scientific research, AI systems have become integral to how we live, work, and interact with the world around us. The pace of innovation in this field is breathtaking, with breakthroughs happening at an accelerating rate that challenges our ability to fully comprehend the implications.

In healthcare, AI is revolutionizing diagnosis, treatment, and patient care. Machine learning algorithms can analyze medical images - such as X-rays, MRIs, and CT scans - with remarkable accuracy, often detecting signs of cancer, cardiovascular disease, and other conditions at an earlier stage than human doctors, when treatment is more likely to be successful. AI-powered drug discovery platforms are dramatically reducing the time and cost of developing new medications, bringing potentially life-saving treatments to patients faster. In surgery, robotic systems guided by AI are enabling more precise, minimally invasive procedures that reduce recovery times and improve outcomes.

In education, AI-powered tutoring systems and adaptive learning platforms are providing personalized educational experiences that adapt to each student's unique pace, learning style, strengths, and weaknesses. These technologies can identify knowledge gaps and provide targeted support, helping students master concepts more effectively. They also have the potential to democratize access to quality education, bringing world-class learning resources to students in remote or underserved communities who might not otherwise have access to them. Virtual reality and augmented reality, enhanced by AI, are creating immersive learning environments that make complex subjects more engaging and understandable.

However, the rapid advancement of AI also raises profound and complex ethical questions that society is only beginning to grapple with. One major concern is job displacement: as AI systems become more capable of performing tasks that were once done exclusively by humans, many traditional jobs may be automated, potentially leading to significant economic disruption and inequality. There are also worries about algorithmic bias - AI systems learn from historical data, which may contain human prejudices, leading to unfair or discriminatory outcomes in areas like hiring, lending, and criminal justice. Privacy concerns are growing as AI systems collect and analyze vast amounts of personal data. Additionally, the potential misuse of AI technology - from autonomous weapons to deepfakes and sophisticated disinformation campaigns - poses significant risks to global security and democracy.

Please write your thoughts (200-300 words) on whether you believe the benefits of AI outweigh the risks, and what specific safeguards, regulations, or ethical guidelines you think are necessary to ensure AI is developed and used responsibly for the benefit of humanity.`,
  
  'Type C': `The COVID-19 pandemic represented an unprecedented disruption to work life around the world, fundamentally altering how we work, collaborate, and think about the workplace. In a matter of weeks, millions of people transitioned to remote work almost overnight, transforming kitchens, bedrooms, and living rooms into makeshift offices. This sudden, forced experiment has had lasting effects on work culture, organizational structures, and employee expectations, reshaping the future of work in ways that are still unfolding.

Remote work offers many compelling benefits that have become increasingly apparent to both employees and employers. For workers, perhaps the most valued benefit is the flexibility it provides: the ability to set one's own schedule, work from anywhere (whether that's from home, a coffee shop, or a different city or country), and better balance work responsibilities with personal life, family commitments, and personal interests. Eliminating the daily commute saves valuable time and reduces stress, while also cutting down on transportation costs and greenhouse gas emissions. Many people also find that they're more productive in a remote setting, with fewer distractions and the ability to create a work environment that suits their individual needs.

For companies, remote work can significantly reduce overhead costs by eliminating or reducing the need for large, expensive office spaces. It also expands the talent pool exponentially, allowing organizations to hire the best candidates regardless of their geographic location. This can lead to more diverse and inclusive teams, as companies are no longer limited to hiring people who live within commuting distance of the office. Many businesses have also reported increased employee satisfaction and retention as a result of offering remote work options.

However, remote work also presents significant challenges that should not be underestimated. Feelings of isolation and loneliness are common among remote workers, as informal workplace interactions and spontaneous conversations that foster connection and creativity are lost. Collaboration and communication can become more difficult, requiring more intentional effort and the right tools to ensure everyone stays aligned and engaged. Maintaining healthy boundaries between work and personal life is another major challenge; when your home is also your office, it can be difficult to "clock out" and disconnect from work, increasing the risk of burnout. Other challenges include difficulties in onboarding and training new employees, ensuring equitable treatment and career advancement for remote workers, and maintaining company culture.

The future of work will likely involve a variety of models, with many experts predicting that hybrid arrangements - combining remote work with some in-person time in an office - will become the norm for many organizations. Finding the right balance will require innovative approaches to management, communication technology, workplace design, and organizational culture.

Please write a reflection (200-300 words) on your ideal work arrangement (remote, in-person, or hybrid) and why you think it would be most effective for both employees and organizations. Consider factors like productivity, work-life balance, collaboration, mental health, and company culture.`,
  
  'Type D': `Social media has become a central, inescapable part of modern communication and daily life for billions of people around the world. Platforms like Facebook, Twitter/X, Instagram, TikTok, LinkedIn, and Snapchat connect us to friends, family, colleagues, and communities across the globe, enabling the instantaneous sharing of ideas, news, personal experiences, art, and information. These platforms have fundamentally transformed how we interact, form relationships, consume media, and engage with the world around us, creating both remarkable opportunities and significant challenges.

One of the most positive aspects of social media is its unparalleled ability to keep us connected to friends and family regardless of geographical distance. People can share milestone moments, offer support during difficult times, and maintain relationships that might otherwise fade. Beyond personal connections, social media has given voice and visibility to marginalized communities, amplifying perspectives that have historically been excluded from mainstream media and discourse. It has also proven to be a powerful tool for social change, enabling social movements to organize, mobilize supporters, and spread awareness more quickly and effectively than ever before. During times of crisis, social media can facilitate rapid information sharing, disaster response, and community support.

However, the rise of social media also has a darker side that is increasingly cause for concern. Numerous studies have linked heavy social media use to mental health issues, particularly among children, teenagers, and young adults. The pressure to present a curated, perfect version of one's life online can lead to feelings of inadequacy, low self-esteem, and anxiety. Cyberbullying - enabled by the anonymity and reach of social platforms - has become a pervasive problem with devastating consequences. Many people find themselves trapped in addictive usage patterns, spending hours scrolling through feeds even when it doesn't bring them joy or fulfillment. The design of these platforms, which relies on algorithms that prioritize engagement above all else, often amplifies this addictive behavior.

Social media has also transformed how we consume and share information, not always for the better. The rapid spread of misinformation, disinformation, and "fake news" on these platforms has eroded trust in institutions, media, and even in one another. Algorithms tend to create echo chambers, showing us content that aligns with our existing beliefs and filtering out opposing viewpoints, which can deepen political and social polarization. The line between fact and fiction has become increasingly blurred, and conspiracy theories that once existed on the fringes can now spread rapidly to a global audience.

Please share your perspective (200-300 words) on how social media has affected relationships, communication, and society more broadly. You can draw from your personal experiences, observations of others, or general societal trends.`
}

export async function POST(request: Request) {
  try {
    const { prolificId } = await request.json()

    if (!prolificId) {
      return NextResponse.json({ error: 'Prolific ID is required' }, { status: 400 })
    }

    // 1. Create or get user
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

    // 2. Create session
    const { data: session, error: sessionError } = await supabaseServer
      .from('sessions')
      .insert({ user_id: userId })
      .select('id')
      .single()

    if (sessionError || !session) {
      console.error('Error creating session:', sessionError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    // 3. Get task types and randomly assign one
    const { data: taskTypes } = await supabaseServer
      .from('task_types')
      .select('*')

    if (!taskTypes || taskTypes.length === 0) {
      return NextResponse.json({ error: 'No task types available' }, { status: 500 })
    }

    const randomIndex = Math.floor(Math.random() * taskTypes.length)
    const selectedTaskType = taskTypes[randomIndex]
    const taskContent = TASK_CONTENTS[selectedTaskType.type_name as keyof typeof TASK_CONTENTS] || 
      'Please complete this task by writing your response here.'

    // Randomly set copy/paste permissions for variation
    const allowCopy = Math.random() > 0.5
    const allowPaste = Math.random() > 0.5

    // 4. Create task
    const { data: task, error: taskError } = await supabaseServer
      .from('tasks')
      .insert({
        user_id: userId,
        task_type_id: selectedTaskType.id,
        content_to_display: taskContent,
        allow_copy: allowCopy,
        allow_paste: allowPaste,
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
      taskType: selectedTaskType.type_name,
      taskContent,
      allowCopy,
      allowPaste,
    })
  } catch (error) {
    console.error('Error in start session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
