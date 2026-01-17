// src/stories/molecules/Card.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  GlassCard,
  FeatureCard,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MoreHorizontal, Play, Clock, Sparkles, ArrowRight, BookOpen, Zap } from 'lucide-react';

/**
 * Cards are used to group related content and actions.
 * They provide visual hierarchy and organization.
 *
 * ## Variants
 * - **default**: Standard card with subtle shadow
 * - **glass**: Glassmorphism effect for overlays and modals
 * - **feature**: Hero card for bento grids with gradient background
 * - **elevated**: Higher elevation with stronger shadow
 * - **outline**: Bordered card without shadow
 *
 * ## Features
 * - Interactive hover states with lift effect
 * - Multiple padding options
 * - Compound components for flexible layout
 */
const meta: Meta<typeof Card> = {
  title: 'Molecules/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'glass', 'feature', 'elevated', 'outline'],
      description: 'Visual style variant',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    interactive: {
      control: 'boolean',
      description: 'Enable hover/click effects',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'default', 'lg'],
      description: 'Padding preset',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Card component for grouping related content. Supports multiple variants for different use cases.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// ============================================================================
// BASIC VARIANTS
// ============================================================================

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Cable Knit Sweater</CardTitle>
        <CardDescription>Classic winter sweater with cable pattern</CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={45} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">Step 3 of 8 • 45% complete</p>
      </CardContent>
      <CardFooter className="justify-between">
        <Badge variant="secondary">In Progress</Badge>
        <Button size="sm">Continue</Button>
      </CardFooter>
    </Card>
  ),
};

export const Elevated: Story = {
  render: () => (
    <Card variant="elevated" className="w-[350px]">
      <CardHeader>
        <CardTitle>Elevated Card</CardTitle>
        <CardDescription>Higher elevation for prominent content</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">This card has stronger shadow for visual hierarchy.</p>
      </CardContent>
    </Card>
  ),
};

export const Outline: Story = {
  render: () => (
    <Card variant="outline" className="w-[350px]">
      <CardHeader>
        <CardTitle>Outline Card</CardTitle>
        <CardDescription>Bordered without shadow</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Useful for secondary content or nested cards.</p>
      </CardContent>
    </Card>
  ),
};

export const Glass: Story = {
  render: () => (
    <div className="bg-gradient-copper p-8 rounded-xl">
      <GlassCard className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-white">Glass Card</CardTitle>
          <CardDescription className="text-white/80">Glassmorphism effect</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/90">Perfect for overlays and modal content with backdrop blur.</p>
        </CardContent>
      </GlassCard>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Glass morphism card with backdrop blur. Best used over images or gradients.',
      },
    },
  },
};

export const Feature: Story = {
  render: () => (
    <FeatureCard className="w-[400px]">
      <div className="flex flex-col h-full justify-between">
        <div>
          <Sparkles className="size-8 text-copper mb-4" />
          <h3 className="text-h3 text-chestnut mb-2">AI Pattern Assistant</h3>
          <p className="text-muted-foreground">
            Get instant help parsing patterns, understanding techniques, and troubleshooting issues.
          </p>
        </div>
        <Button className="mt-6 w-fit">
          Try It Now
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </FeatureCard>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Feature card for bento grid hero sections. 280px minimum height with gradient background.',
      },
    },
  },
};

// ============================================================================
// INTERACTIVE CARDS
// ============================================================================

export const Interactive: Story = {
  render: () => (
    <div className="flex gap-4">
      <Card interactive className="w-[250px]">
        <CardHeader>
          <CardTitle>Hover Me</CardTitle>
          <CardDescription>I lift on hover</CardDescription>
        </CardHeader>
      </Card>
      <Card variant="elevated" interactive className="w-[250px]">
        <CardHeader>
          <CardTitle>Elevated Interactive</CardTitle>
          <CardDescription>Enhanced hover effect</CardDescription>
        </CardHeader>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Interactive cards have hover lift effect. Use for clickable cards like project list items.',
      },
    },
  },
};

// ============================================================================
// WITH ACTION BUTTON
// ============================================================================

export const WithAction: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Project Name</CardTitle>
        <CardDescription>Last edited 2 hours ago</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Progress value={65} className="h-2" />
      </CardContent>
    </Card>
  ),
};

// ============================================================================
// PROJECT CARD EXAMPLE
// ============================================================================

export const ProjectCard: Story = {
  render: () => (
    <Card interactive className="w-[320px]">
      <div className="aspect-[4/3] bg-caramel-surface rounded-t-xl flex items-center justify-center">
        <div className="text-4xl">🧶</div>
      </div>
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="text-xs">Knitting</Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="size-3" /> 12h 30m
          </span>
        </div>
        <CardTitle>Colorwork Beanie</CardTitle>
        <CardDescription>Fair Isle pattern in autumn colors</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Progress value={78} className="h-1.5" />
        <p className="text-xs text-muted-foreground mt-2">Round 42 of 54</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <Play className="size-4" />
          Continue
        </Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example project card as used in the projects list view.',
      },
    },
  },
};

// ============================================================================
// TECHNIQUE CARD EXAMPLE
// ============================================================================

export const TechniqueCard: Story = {
  render: () => (
    <Card interactive padding="default" className="w-[280px]">
      <div className="flex items-start gap-4">
        <div className="size-12 rounded-lg bg-olive-surface flex items-center justify-center shrink-0">
          <BookOpen className="size-6 text-olive" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">German Short Rows</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Create smooth short rows without holes
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="text-xs">Intermediate</Badge>
            <span className="text-xs text-muted-foreground">5 min read</span>
          </div>
        </div>
      </div>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Technique card for the Learn section.',
      },
    },
  },
};

// ============================================================================
// QUICK ACTION CARD
// ============================================================================

export const QuickActionCard: Story = {
  render: () => (
    <Card variant="outline" interactive padding="default" className="w-[200px]">
      <div className="flex flex-col items-center text-center">
        <div className="size-12 rounded-full bg-copper-surface flex items-center justify-center mb-3">
          <Zap className="size-6 text-copper" />
        </div>
        <h4 className="font-semibold">Quick Start</h4>
        <p className="text-xs text-muted-foreground mt-1">Create a new project</p>
      </div>
    </Card>
  ),
};

// ============================================================================
// ALL VARIANTS SHOWCASE
// ============================================================================

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-3xl">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Default</CardTitle>
          <CardDescription>Standard card with subtle shadow</CardDescription>
        </CardHeader>
      </Card>
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Elevated</CardTitle>
          <CardDescription>Higher elevation</CardDescription>
        </CardHeader>
      </Card>
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Outline</CardTitle>
          <CardDescription>Bordered without shadow</CardDescription>
        </CardHeader>
      </Card>
      <div className="bg-gradient-copper p-4 rounded-xl">
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-white">Glass</CardTitle>
            <CardDescription className="text-white/80">Glassmorphism</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All card variants side by side for comparison.',
      },
    },
  },
};
