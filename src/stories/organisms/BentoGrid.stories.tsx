// src/stories/organisms/BentoGrid.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import {
  BentoGrid,
  BentoItem,
  BentoHero,
  BentoSidebar,
  BentoStats,
  BentoRow,
} from '@/components/layout/BentoGrid';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  HelpCircle,
  BookOpen,
  Play,
  Clock,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  ArrowRight,
} from 'lucide-react';

/**
 * Bento Grid Layout System
 *
 * Modern web design uses asymmetric grid compositions that feel organic yet structured.
 * Perfect for Purl's craft aesthetic.
 *
 * ## Layout Presets
 * - **auto**: Auto-fit responsive grid (default)
 * - **hero-sidebar**: Two column with hero area
 * - **dashboard**: Dashboard layout with hero and sidebar
 * - **showcase**: Feature showcase grid
 * - **masonry**: Masonry-like varied heights
 * - **split**: Side-by-side for project steps
 *
 * ## Key Features
 * - CSS Grid based for true asymmetric layouts
 * - Responsive by default
 * - Composable items with variants
 * - Interactive hover effects
 */
const meta: Meta<typeof BentoGrid> = {
  title: 'Organisms/BentoGrid',
  component: BentoGrid,
  tags: ['autodocs'],
  argTypes: {
    layout: {
      control: 'select',
      options: ['auto', 'hero-sidebar', 'dashboard', 'showcase', 'masonry', 'split'],
      description: 'Grid layout preset',
    },
    gap: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Gap between items',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Bento grid layout for modern dashboard and showcase designs.',
      },
    },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof BentoGrid>;

// ============================================================================
// BASIC LAYOUTS
// ============================================================================

export const AutoLayout: Story = {
  render: () => (
    <BentoGrid layout="auto" gap="md">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <BentoItem key={i} variant="default" className="p-6 min-h-[150px]">
          <h3 className="font-semibold">Item {i}</h3>
          <p className="text-sm text-muted-foreground mt-1">Auto-fit responsive grid</p>
        </BentoItem>
      ))}
    </BentoGrid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Auto-fit responsive grid that adjusts columns based on container width.',
      },
    },
  },
};

export const HeroSidebarLayout: Story = {
  render: () => (
    <BentoGrid layout="hero-sidebar" gap="md">
      <BentoHero>
        <Sparkles className="size-8 text-copper mb-4" />
        <h2 className="text-h2 text-chestnut">Welcome Back!</h2>
        <p className="text-muted-foreground mt-2">
          Continue your cable knit sweater project
        </p>
        <Button className="mt-6">
          <Play className="size-4" />
          Continue Project
        </Button>
      </BentoHero>
      <BentoSidebar className="flex flex-col gap-4">
        <h3 className="font-semibold">Quick Actions</h3>
        <Button variant="outline" className="justify-start">
          <Plus className="size-4" />
          New Project
        </Button>
        <Button variant="outline" className="justify-start">
          <HelpCircle className="size-4" />
          SOS Help
        </Button>
        <Button variant="outline" className="justify-start">
          <BookOpen className="size-4" />
          Learn
        </Button>
      </BentoSidebar>
    </BentoGrid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Hero area with sidebar - great for dashboards with prominent CTA.',
      },
    },
  },
};

// ============================================================================
// DASHBOARD EXAMPLE
// ============================================================================

export const DashboardLayout: Story = {
  render: () => (
    <BentoGrid layout="dashboard" gap="lg">
      {/* Hero - Continue Project */}
      <BentoHero className="lg:col-span-1 lg:row-span-2">
        <div className="flex flex-col h-full justify-between">
          <div>
            <Badge variant="secondary" className="mb-4">In Progress</Badge>
            <h2 className="text-h2 text-chestnut">Cable Knit Sweater</h2>
            <p className="text-muted-foreground mt-2">Step 3: Knit the Body</p>
            <div className="mt-4">
              <Progress value={45} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">45% complete</p>
            </div>
          </div>
          <Button size="lg" className="mt-6">
            <Play className="size-4" />
            Continue
          </Button>
        </div>
      </BentoHero>

      {/* Sidebar - Quick Actions & AI Tip */}
      <div className="flex flex-col gap-4">
        <BentoItem variant="default" className="p-6">
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <div className="flex flex-col gap-2">
            <Button variant="ghost" className="justify-start h-9">
              <Plus className="size-4" />
              New Project
            </Button>
            <Button variant="ghost" className="justify-start h-9">
              <HelpCircle className="size-4 text-warning" />
              SOS Help
            </Button>
            <Button variant="ghost" className="justify-start h-9">
              <BookOpen className="size-4 text-olive" />
              Learn
            </Button>
          </div>
        </BentoItem>

        <BentoItem variant="elevated" className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-4 text-copper" />
            <span className="text-label text-copper">AI Tip</span>
          </div>
          <p className="text-sm">
            Try the German Short Rows technique for smoother shoulder shaping!
          </p>
          <Button variant="link" className="p-0 h-auto mt-2">
            Learn more <ArrowRight className="size-3" />
          </Button>
        </BentoItem>
      </div>

      {/* Bottom Row - Stats & Recent */}
      <BentoStats>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-olive-surface flex items-center justify-center">
            <Clock className="size-5 text-olive" />
          </div>
          <div>
            <p className="text-2xl font-bold">12.5h</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </div>
        </div>
      </BentoStats>

      <BentoRow>
        <h3 className="font-semibold mb-4">Recent Projects</h3>
        <div className="grid grid-cols-4 gap-4">
          {['Beanie', 'Scarf', 'Mittens', '+ New'].map((name, i) => (
            <div
              key={name}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
                i === 3 ? 'border-2 border-dashed border-muted-foreground/30' : 'bg-caramel-surface'
              }`}
            >
              {i === 3 ? <Plus className="size-5 text-muted-foreground" /> : '🧶'}
            </div>
          ))}
        </div>
      </BentoRow>
    </BentoGrid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete dashboard layout example matching the Purl home dashboard design.',
      },
    },
  },
};

// ============================================================================
// SHOWCASE LAYOUT
// ============================================================================

export const ShowcaseLayout: Story = {
  render: () => (
    <BentoGrid layout="showcase" gap="md">
      <BentoItem span={2} variant="feature" className="p-8">
        <Sparkles className="size-8 text-copper mb-4" />
        <h3 className="text-h3 text-chestnut">AI Pattern Parser</h3>
        <p className="text-muted-foreground mt-2">
          Upload any knitting pattern and let AI break it down into easy steps.
        </p>
      </BentoItem>

      <BentoItem variant="elevated" className="p-6">
        <Target className="size-6 text-olive mb-3" />
        <h4 className="font-semibold">Step Tracking</h4>
        <p className="text-sm text-muted-foreground mt-1">
          Track your progress row by row
        </p>
      </BentoItem>

      <BentoItem variant="elevated" className="p-6">
        <TrendingUp className="size-6 text-caramel mb-3" />
        <h4 className="font-semibold">Progress Stats</h4>
        <p className="text-sm text-muted-foreground mt-1">
          See your crafting journey visualized
        </p>
      </BentoItem>

      <BentoItem variant="elevated" className="p-6">
        <HelpCircle className="size-6 text-warning mb-3" />
        <h4 className="font-semibold">SOS Help</h4>
        <p className="text-sm text-muted-foreground mt-1">
          Get instant help when stuck
        </p>
      </BentoItem>

      <BentoItem span={2} variant="default" className="p-6">
        <BookOpen className="size-6 text-olive mb-3" />
        <h4 className="font-semibold">Learn Library</h4>
        <p className="text-sm text-muted-foreground mt-1">
          50+ techniques with step-by-step guides and video tutorials
        </p>
      </BentoItem>
    </BentoGrid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Feature showcase layout for landing pages and marketing sections.',
      },
    },
  },
};

// ============================================================================
// SPLIT LAYOUT (PROJECT STEPS)
// ============================================================================

export const SplitLayout: Story = {
  render: () => (
    <BentoGrid layout="split" gap="lg" className="min-h-[500px]">
      <BentoItem variant="default" className="p-6">
        <div className="aspect-square bg-caramel-surface rounded-lg flex items-center justify-center">
          <span className="text-6xl">📷</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Pattern Preview</span>
          <Button variant="ghost" size="sm">Zoom</Button>
        </div>
      </BentoItem>

      <BentoItem variant="default" className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge>Step 3</Badge>
          <span className="text-sm text-muted-foreground">of 12</span>
        </div>
        <h3 className="text-h3 mb-2">Knit the Body</h3>
        <p className="text-muted-foreground mb-4">
          Knit in stockinette stitch until piece measures 14 inches from cast on edge,
          or desired length to underarm.
        </p>

        <Card variant="outline" className="mb-4">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="size-4 text-olive" />
              Techniques Used
            </h4>
            <div className="flex gap-2">
              <Badge variant="secondary">Stockinette</Badge>
              <Badge variant="secondary">K2tog</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline">← Previous</Button>
          <Button className="flex-1">Next Step →</Button>
        </div>
      </BentoItem>
    </BentoGrid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Split layout for project step view - pattern and instructions side by side.',
      },
    },
  },
};

// ============================================================================
// ITEM VARIANTS
// ============================================================================

export const ItemVariants: Story = {
  render: () => (
    <BentoGrid layout="auto" gap="md">
      <BentoItem variant="default" className="p-6 min-h-[150px]">
        <h4 className="font-semibold">Default</h4>
        <p className="text-sm text-muted-foreground">Standard card style</p>
      </BentoItem>
      <BentoItem variant="elevated" className="p-6 min-h-[150px]">
        <h4 className="font-semibold">Elevated</h4>
        <p className="text-sm text-muted-foreground">Higher shadow</p>
      </BentoItem>
      <BentoItem variant="glass" className="p-6 min-h-[150px]">
        <h4 className="font-semibold">Glass</h4>
        <p className="text-sm text-muted-foreground">Glassmorphism</p>
      </BentoItem>
      <BentoItem variant="feature" className="p-6 min-h-[150px]">
        <h4 className="font-semibold text-chestnut">Feature</h4>
        <p className="text-sm text-muted-foreground">Gradient background</p>
      </BentoItem>
      <BentoItem variant="transparent" className="p-6 min-h-[150px] border-2 border-dashed border-muted">
        <h4 className="font-semibold">Transparent</h4>
        <p className="text-sm text-muted-foreground">No background</p>
      </BentoItem>
      <BentoItem variant="default" interactive className="p-6 min-h-[150px]">
        <h4 className="font-semibold">Interactive</h4>
        <p className="text-sm text-muted-foreground">Hover to lift</p>
      </BentoItem>
    </BentoGrid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available item variants for different visual effects.',
      },
    },
  },
};

// ============================================================================
// SPAN OPTIONS
// ============================================================================

export const SpanOptions: Story = {
  render: () => (
    <BentoGrid layout="auto" gap="md">
      <BentoItem span={1} variant="default" className="p-4 min-h-[100px]">
        <p className="text-sm font-medium">Span 1</p>
      </BentoItem>
      <BentoItem span={1} variant="default" className="p-4 min-h-[100px]">
        <p className="text-sm font-medium">Span 1</p>
      </BentoItem>
      <BentoItem span={2} variant="elevated" className="p-4 min-h-[100px]">
        <p className="text-sm font-medium">Span 2 - Two columns wide</p>
      </BentoItem>
      <BentoItem span={3} variant="feature" className="p-4 min-h-[100px]">
        <p className="text-sm font-medium text-chestnut">Span 3 - Three columns wide</p>
      </BentoItem>
      <BentoItem span="full" variant="default" className="p-4 min-h-[100px]">
        <p className="text-sm font-medium">Span Full - Full width</p>
      </BentoItem>
    </BentoGrid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Items can span multiple columns for varied layouts.',
      },
    },
  },
};
