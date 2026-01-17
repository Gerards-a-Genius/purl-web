// src/stories/atoms/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { Button, IconButton } from '@/components/ui/button';
import { Plus, ChevronRight, Download, Heart, ArrowRight, Sparkles } from 'lucide-react';

/**
 * The Button component is the primary interactive element in Purl.
 * It supports multiple variants and sizes to accommodate different use cases.
 *
 * ## Hierarchy (2025 Best Practice)
 * Clear action hierarchy helps users understand importance:
 * - **default** (Primary): Main CTAs - Solid copper, prominent
 * - **secondary**: Alternative actions - Muted background
 * - **outline**: Outlined, subtle border
 * - **ghost**: Tertiary actions - No border, text only
 * - **destructive**: Dangerous actions - Red, requires confirmation
 * - **link**: Inline text link style
 *
 * ## Sizes
 * - **sm**: 32px - Compact UI elements
 * - **default**: 40px - Standard buttons
 * - **lg**: 48px - Emphasized actions
 * - **xl**: 56px - Hero CTAs (2025 trend)
 *
 * ## Accessibility
 * - All buttons are keyboard accessible
 * - Focus states use visible ring
 * - Loading state provides visual feedback
 * - Disabled state prevents interaction
 */
const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
      description: 'Visual style variant',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'xl', 'icon', 'icon-sm', 'icon-lg'],
      description: 'Button size',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state with spinner',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child element (for composition)',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Primary interactive element for triggering actions. Uses Purl\'s copper color for primary CTAs.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// ============================================================================
// BASIC VARIANTS
// ============================================================================

export const Default: Story = {
  args: {
    children: 'Start Knitting',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'View Details',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Cancel',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Skip',
    variant: 'ghost',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete Project',
    variant: 'destructive',
  },
};

export const Link: Story = {
  args: {
    children: 'Learn more',
    variant: 'link',
  },
};

// ============================================================================
// SIZES
// ============================================================================

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    children: 'Start Your Journey',
    size: 'xl',
  },
  parameters: {
    docs: {
      description: {
        story: '56px height - Perfect for hero sections and prominent CTAs. A 2025 trend for better touch targets and visual hierarchy.',
      },
    },
  },
};

export const IconButtonDefault: Story = {
  args: {
    size: 'icon',
    'aria-label': 'Add new',
    children: <Plus className="size-4" />,
  },
};

export const IconButtonSmall: Story = {
  args: {
    size: 'icon-sm',
    'aria-label': 'Add new',
    children: <Plus className="size-4" />,
  },
};

export const IconButtonLarge: Story = {
  args: {
    size: 'icon-lg',
    'aria-label': 'Add new',
    children: <Plus className="size-5" />,
  },
};

// ============================================================================
// WITH ICONS
// ============================================================================

export const WithIconLeft: Story = {
  args: {
    children: (
      <>
        <Plus className="size-4" />
        New Project
      </>
    ),
  },
};

export const WithIconRight: Story = {
  args: {
    children: (
      <>
        Continue
        <ChevronRight className="size-4" />
      </>
    ),
  },
};

export const DownloadButton: Story = {
  args: {
    variant: 'outline',
    children: (
      <>
        <Download className="size-4" />
        Download Pattern
      </>
    ),
  },
};

// ============================================================================
// STATES
// ============================================================================

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Processing...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Built-in loading state with spinner. Button is automatically disabled during loading.',
      },
    },
  },
};

export const LoadingWithoutText: Story = {
  args: {
    loading: true,
    size: 'icon',
    'aria-label': 'Loading',
  },
};

// ============================================================================
// HERO CTA EXAMPLES
// ============================================================================

export const HeroCTA: Story = {
  render: () => (
    <div className="bg-gradient-warm p-12 rounded-2xl flex flex-col items-center gap-4 text-center">
      <h2 className="text-h2 text-chestnut">Start Your Knitting Journey</h2>
      <p className="text-muted-foreground max-w-md">
        Create beautiful projects with AI-powered pattern assistance
      </p>
      <Button size="xl">
        <Sparkles className="size-5" />
        Get Started Free
        <ArrowRight className="size-5" />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Hero section with XL button - prominent call to action for landing pages.',
      },
    },
  },
};

// ============================================================================
// ALL VARIANTS SHOWCASE
// ============================================================================

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All button variants side by side for comparison.',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All button sizes side by side for comparison.',
      },
    },
  },
};

export const AllIconSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton size="icon-sm"><Heart className="size-4" /></IconButton>
      <IconButton size="icon"><Heart className="size-4" /></IconButton>
      <IconButton size="icon-lg"><Heart className="size-5" /></IconButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon button sizes - use for toolbar actions and compact interfaces.',
      },
    },
  },
};

export const ButtonHierarchy: Story = {
  render: () => (
    <div className="p-6 bg-card rounded-xl border space-y-4">
      <div className="space-y-2">
        <p className="text-label text-muted-foreground">Primary Action</p>
        <Button>Save Project</Button>
      </div>
      <div className="space-y-2">
        <p className="text-label text-muted-foreground">Secondary Action</p>
        <Button variant="secondary">Preview</Button>
      </div>
      <div className="space-y-2">
        <p className="text-label text-muted-foreground">Tertiary Action</p>
        <Button variant="ghost">Cancel</Button>
      </div>
      <div className="space-y-2">
        <p className="text-label text-muted-foreground">Destructive Action</p>
        <Button variant="destructive">Delete</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button hierarchy demonstration - Primary actions stand out, secondary provides alternatives, ghost for tertiary.',
      },
    },
  },
};
