---
name: "consent-page"
description: "Generates a reusable research consent page with study info, eligibility, and agreement checkbox. Invoke when user needs a consent/IRB page for a research study web app."
---

# Consent Page Generator

This skill creates a reusable, self-contained consent page module for Next.js + shadcn/ui projects. It displays study information, eligibility criteria, and a mandatory agreement checkbox before proceeding.

## When to Use

Invoke this skill when:
- User asks to add a consent page / IRB consent form to a web app
- User needs a research study landing page with agreement checkbox
- User mentions "consent", "同意协议", "知情同意", "IRB", or "research participation"

## Architecture

The module consists of two parts:

### 1. Reusable Component: `src/components/ConsentPage.tsx`

A presentational component that accepts all content via props — no hardcoded text, fully reusable across projects.

**Props interface:**

```typescript
interface ConsentSection {
  type?: 'info' | 'warning' | 'plain'  // controls styling (blue/amber/default)
  title?: string
  content: string
}

interface ConsentPageProps {
  title: string                          // study title shown in header
  description?: string                   // subtitle
  sections: ConsentSection[]             // body content blocks
  checkboxText: string                   // agreement statement
  buttonText?: string                    // default: "Continue"
  onAgree: () => void                    // callback when user checks + clicks
  isLoading?: boolean                    // shows loading state on button
}
```

**Dependencies:** `Card`, `Checkbox`, `Label`, `Button` from shadcn/ui (already in most projects).

### 2. Route Page: `src/app/consent/page.tsx`

A thin wrapper that supplies project-specific content and handles routing after consent.

## Implementation Steps

1. Ensure shadcn/ui `card`, `checkbox`, `label`, `button` components exist. If not, install:
   ```
   npx shadcn@latest add card checkbox label button
   ```

2. Create `src/components/ConsentPage.tsx`:

```tsx
"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface ConsentSection {
  type?: 'info' | 'warning' | 'plain'
  title?: string
  content: string
}

interface ConsentPageProps {
  title: string
  description?: string
  sections: ConsentSection[]
  checkboxText: string
  buttonText?: string
  onAgree: () => void
  isLoading?: boolean
}

export default function ConsentPage({
  title,
  description,
  sections,
  checkboxText,
  buttonText = 'Continue',
  onAgree,
  isLoading = false,
}: ConsentPageProps) {
  const [agreed, setAgreed] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
          {description && (
            <CardDescription className="text-center">{description}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {sections.map((section, idx) => {
            const bgClass =
              section.type === 'info' ? 'bg-blue-50 border-blue-200' :
              section.type === 'warning' ? 'bg-amber-50 border-amber-200' :
              ''
            const titleClass =
              section.type === 'info' ? 'text-blue-800' :
              section.type === 'warning' ? 'text-amber-800' :
              'text-gray-800'
            const contentClass =
              section.type === 'info' ? 'text-blue-700' :
              section.type === 'warning' ? 'text-amber-700' :
              'text-gray-700'

            return (
              <div key={idx} className={`p-4 rounded-lg border ${bgClass}`}>
                {section.title && (
                  <h3 className={`font-semibold mb-2 ${titleClass}`}>{section.title}</h3>
                )}
                <p className={`text-sm leading-relaxed whitespace-pre-line ${contentClass}`}>
                  {section.content}
                </p>
              </div>
            )
          })}

          <div className="flex items-start space-x-3 pt-4">
            <Checkbox
              id="consent-agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="consent-agree" className="text-sm leading-relaxed">
                {checkboxText}
              </Label>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button
            onClick={onAgree}
            disabled={!agreed || isLoading}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Loading...' : buttonText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
```

3. Create route page `src/app/consent/page.tsx` — fill in study-specific content:

```tsx
"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import ConsentPage from '@/components/ConsentPage'

export default function ConsentRoutePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleAgree = () => {
    // Preserve query params (e.g. PROLIFIC_PID) when navigating
    const params = searchParams.toString()
    router.push(params ? `/next-page?${params}` : '/next-page')
  }

  return (
    <ConsentPage
      title="Study Title"
      description="Subtitle"
      sections={[
        { type: 'info', title: 'Section Title', content: 'Section content...' },
        // ... more sections
      ]}
      checkboxText="I agree to..."
      buttonText="Continue"
      onAgree={handleAgree}
    />
  )
}
```

4. Update root redirect in `src/app/page.tsx`:

```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/consent')
}
```

## Customization Tips

- **Styling**: Adjust `type` field on sections (`info` = blue, `warning` = amber, `plain` = default)
- **Multi-page consent**: Pass `onAgree` that routes to another consent page
- **Persistent consent**: Store agreement in localStorage/cookie to skip on return visits
- **Query param preservation**: Always forward URL params (e.g. Prolific IDs) through redirects
