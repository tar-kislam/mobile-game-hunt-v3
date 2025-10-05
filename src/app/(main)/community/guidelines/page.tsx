import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommunitySidebar } from '@/components/community/community-sidebar'

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 hidden lg:block">
          <CommunitySidebar />
        </aside>
        <main className="lg:col-span-2 space-y-6">
          <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                Community Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground mb-6">
                  Welcome to our mobile gaming community! These guidelines help ensure a positive, 
                  constructive environment for everyone to share, learn, and connect.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                      <span className="text-green-400 text-sm">✅</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-400 mb-1">Respect Others</h3>
                      <p className="text-muted-foreground text-sm">
                        No harassment, hate speech, or personal attacks. Treat everyone with kindness and respect, 
                        regardless of their background, experience level, or opinions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                      <span className="text-blue-400 text-sm">⚡</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-400 mb-1">Stay On Topic</h3>
                      <p className="text-muted-foreground text-sm">
                        Share posts relevant to mobile gaming, game development, industry news, and related topics. 
                        Keep discussions focused and meaningful.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mt-0.5">
                      <span className="text-purple-400 text-sm">🎯</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-400 mb-1">Quality Content</h3>
                      <p className="text-muted-foreground text-sm">
                        Avoid spam, low-effort posts, or repetitive content. Share valuable insights, 
                        ask thoughtful questions, and contribute meaningfully to discussions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center mt-0.5">
                      <span className="text-orange-400 text-sm">🤝</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-orange-400 mb-1">Constructive Feedback</h3>
                      <p className="text-muted-foreground text-sm">
                        Help others improve with kindness and constructive criticism. Be specific, 
                        helpful, and encouraging in your feedback and suggestions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5">
                      <span className="text-red-400 text-sm">🚨</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-400 mb-1">Report Issues</h3>
                      <p className="text-muted-foreground text-sm">
                        Use reporting tools for inappropriate behavior, spam, or content that violates 
                        these guidelines. Help us maintain a safe community environment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-yellow-300 text-sm font-medium">
                    ⚠️ <strong>Important:</strong> Violations may lead to warnings, content removal, or account suspension.
                  </p>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-blue-300 text-sm">
                    💡 <strong>Need help?</strong> If you have questions about these guidelines or need assistance, 
                    feel free to reach out to our community moderators or support team.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
        <aside className="lg:col-span-1" />
      </div>
    </div>
  )
}
