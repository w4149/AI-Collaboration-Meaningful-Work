import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-green-600">Thank You!</CardTitle>
          <CardDescription className="text-lg mt-2">
            Your participation in our study is greatly appreciated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            You have successfully completed the study. You may now close this window or return to Prolific.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
            <p className="text-green-700 font-medium">
              Study Complete
            </p>
            <p className="text-green-600 text-sm mt-1">
              Remember to submit your completion on Prolific to receive payment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
