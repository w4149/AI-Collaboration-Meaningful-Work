# AI Collaboration Meaningful Work

A research platform for studying human-AI collaboration in meaningful work tasks.

## Features

- 4 different task types (randomly assigned)
- Left panel: Information display with copy permission control
- Left panel: Task submission with paste permission control, local storage persistence
- Right panel: AI chat assistant with collapse/expand functionality
- GPT-3.5 integration
- Survey system for demographic and experience data
- Supabase database for data collection
- Prolific integration ready

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Supabase
- OpenAI API
- Zustand (state management)

## Setup Instructions

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize
3. Go to SQL Editor and create a new query
4. Copy the contents of `supabase/migrations/001_init.sql` and run it to create the tables

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

You can find these in your Supabase project settings:
- Project URL: Project Settings → API → Project URL
- Anon Key: Project Settings → API → Project API keys → anon public
- Service Role Key: Project Settings → API → Project API keys → service_role secret

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage with Prolific

Set your study URL on Prolific to:

```
https://your-domain.com/entry?PROLIFIC_PID={{%PROLIFIC_PID%}}
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/start/       # Start session and assign task
│   │   ├── chat/             # Chat with GPT and save messages
│   │   ├── submissions/      # Save task submissions
│   │   └── survey/           # Save survey responses
│   ├── entry/                # Instruction and consent page
│   ├── task/                 # Main task interface
│   ├── survey/               # Post-task survey
│   └── thank-you/            # Completion page
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── InfoDisplay.tsx       # Text display with copy control
│   ├── TaskInput.tsx         # Task submission with paste control
│   ├── ChatWindow.tsx        # AI chat interface
│   └── Navigation.tsx        # Top navigation with timer
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── supabase-server.ts    # Supabase server client
│   ├── openai.ts             # OpenAI client
│   └── store.ts              # Zustand state management
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add the environment variables in Vercel project settings
4. Deploy!

## Database Schema

### task_types
- id (UUID)
- type_name (VARCHAR)
- description (TEXT)

### users
- id (UUID)
- prolific_id (VARCHAR, unique)
- created_at (TIMESTAMP)
- session_id (VARCHAR)

### tasks
- id (UUID)
- user_id (UUID)
- task_type_id (UUID)
- instruction (TEXT)
- content_to_display (TEXT)
- allow_copy (BOOLEAN)
- allow_paste (BOOLEAN)
- created_at (TIMESTAMP)

### task_submissions
- id (UUID)
- user_id (UUID)
- task_id (UUID)
- content (TEXT)
- submitted_at (TIMESTAMP)

### chat_messages
- id (UUID)
- user_id (UUID)
- task_id (UUID)
- role (ENUM: user, assistant)
- content (TEXT)
- timestamp (TIMESTAMP)

### survey_responses
- id (UUID)
- user_id (UUID)
- age (INTEGER)
- gender (VARCHAR)
- education (VARCHAR)
- task_familiarity (INTEGER: 1-5)
- additional_comments (TEXT)
- submitted_at (TIMESTAMP)

### sessions
- id (UUID)
- user_id (UUID)
- start_time (TIMESTAMP)
- end_time (TIMESTAMP)
- task_completed (BOOLEAN)

## License

MIT
