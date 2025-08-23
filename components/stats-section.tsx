import { Card, CardContent } from "@/components/ui/card"

const stats = [
  {
    number: "10,000+",
    label: "Active Communities",
    description: "Growing network of verified communities",
  },
  {
    number: "50,000+",
    label: "Events Hosted",
    description: "Successful events with proof of attendance",
  },
  {
    number: "250,000+",
    label: "NFTs Issued",
    description: "Soulbound tokens proving participation",
  },
  {
    number: "99.9%",
    label: "Uptime",
    description: "Reliable blockchain infrastructure",
  },
]

export function StatsSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">Trusted by Thousands</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the growing community of creators and participants using Presence
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="text-center ripple-effect hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm border-2 hover:border-primary/20"
            >
              <CardContent className="pt-8 pb-6">
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-lg font-semibold mb-2">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
