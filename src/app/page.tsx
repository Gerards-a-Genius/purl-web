import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center space-y-6">
          <Badge variant="secondary" className="text-label">
            AI-Powered Knitting Companion
          </Badge>

          <h1 className="text-h1 max-w-3xl">
            Turn any knitting pattern into a guided project
          </h1>

          <p className="text-body text-muted-foreground max-w-2xl">
            Upload your PDF patterns, let AI parse them into step-by-step instructions,
            and track your progress as you knit. Learn techniques, get help when stuck,
            and never lose your place again.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" className="bg-copper hover:bg-copper-dark text-white">
              Get Started
            </Button>
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-caramel-surface/50 rounded-3xl">
        <h2 className="text-h2 text-center mb-12">
          Everything you need to knit with confidence
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            title="AI Pattern Parsing"
            description="Upload any PDF pattern and our AI will convert it into clear, trackable steps with technique detection."
            icon="📄"
          />
          <FeatureCard
            title="Progress Tracking"
            description="Track rows, stitches, and time spent. Never lose your place with automatic progress saving."
            icon="📊"
          />
          <FeatureCard
            title="Learn Techniques"
            description="Access a library of 100+ techniques with video tutorials, step-by-step guides, and quizzes."
            icon="🎓"
          />
          <FeatureCard
            title="SOS Assistant"
            description="Stuck on a mistake? Get AI-powered help to fix dropped stitches, twisted yarns, and more."
            icon="🆘"
          />
          <FeatureCard
            title="Pattern Annotations"
            description="Draw on your patterns, add notes, and highlight important sections that persist across sessions."
            icon="✏️"
          />
          <FeatureCard
            title="Project Wizard"
            description="Create custom projects from scratch with our guided wizard that generates steps based on your specs."
            icon="🧙"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-2xl mx-auto bg-copper-light border-copper/20">
          <CardHeader>
            <CardTitle className="text-h2">Ready to start knitting?</CardTitle>
            <CardDescription className="text-body">
              Create your free account and upload your first pattern today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="bg-copper hover:bg-copper-dark text-white">
              Create Free Account
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-body-small text-muted-foreground">
            © 2024 Purl. Made with ❤️ for knitters everywhere.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-body-small text-muted-foreground hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="text-body-small text-muted-foreground hover:text-foreground">
              Terms
            </a>
            <a href="#" className="text-body-small text-muted-foreground hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <Card className="bg-card hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="text-4xl mb-2">{icon}</div>
        <CardTitle className="text-h3">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-body-small text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
