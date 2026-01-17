// src/stories/dashboard/AiTipCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { AiTipCard } from '@/components/dashboard/AiTipCard';

/**
 * AiTipCard displays a rotating AI tip on the dashboard to help users
 * learn new techniques and improve their crafting.
 *
 * ## Features
 * - Daily rotating tips (based on day of year)
 * - Links to relevant learning content
 * - Sparkle icon for AI branding
 * - Copper color theme for visual distinction
 *
 * ## Tip Content
 * Tips cover various knitting techniques including:
 * - German Short Rows
 * - Lifelines
 * - Blocking
 * - Stitch counting
 * - Kitchener Stitch
 */
const meta: Meta<typeof AiTipCard> = {
  title: 'Dashboard/AiTipCard',
  component: AiTipCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'AI tip of the day card with knitting advice.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[300px] bg-card rounded-xl p-4 shadow-md border">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AiTipCard>;

// ============================================================================
// DEFAULT
// ============================================================================

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default AI tip card. The tip shown depends on the current day of the year.',
      },
    },
  },
};

// ============================================================================
// IN ELEVATED CARD
// ============================================================================

export const InElevatedCard: Story = {
  decorators: [
    (Story) => (
      <div className="w-[320px] bg-card rounded-xl p-5 shadow-lg border">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'AI tip card in an elevated container with more padding.',
      },
    },
  },
};

// ============================================================================
// COMPACT
// ============================================================================

export const Compact: Story = {
  decorators: [
    (Story) => (
      <div className="w-[240px] bg-card rounded-lg p-3 shadow border">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'AI tip card in a compact container.',
      },
    },
  },
};

// ============================================================================
// FULL WIDTH
// ============================================================================

export const FullWidth: Story = {
  decorators: [
    (Story) => (
      <div className="w-full max-w-lg bg-card rounded-xl p-5 shadow-md border">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'AI tip card in a full-width container.',
      },
    },
  },
};

// ============================================================================
// ON GRADIENT BACKGROUND
// ============================================================================

export const OnGradient: Story = {
  decorators: [
    (Story) => (
      <div className="w-[320px] bg-gradient-to-br from-copper-surface to-caramel-surface rounded-xl p-5">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'AI tip card on a gradient background.',
      },
    },
  },
};
