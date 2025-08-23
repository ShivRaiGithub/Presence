import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, Trophy, Zap, Globe, Lock } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Soulbound NFTs",
    description: "Non-transferable tokens that prove authentic participation and membership.",
  },
  {
    icon: Users,
    title: "Community Building",
    description: "Create and manage communities with verifiable membership through NFT badges.",
  },
  {
    icon: Trophy,
    title: "Event Attendance",
    description: "Issue proof-of-presence tokens for events, conferences, and gatherings.",
  },
  {
    icon: Zap,
    title: "Instant Verification",
    description: "Quick and easy verification of community membership and event participation.",
  },
  {
    icon: Globe,
    title: "Decentralized",
    description: "Built on blockchain technology for transparency and immutable proof.",
  },
  {
    icon: Lock,
    title: "Secure",
    description: "Your data and participation records are secured by blockchain technology.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">Why Choose Presence?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the powerful features that make Presence the ultimate proof-of-presence platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="ripple-effect hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 bg-card/50 backdrop-blur-sm"
            >
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
