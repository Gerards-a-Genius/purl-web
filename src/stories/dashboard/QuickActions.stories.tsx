// src/stories/dashboard/QuickActions.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { QuickActions } from '@/components/dashboard/QuickActions';

/**
 * QuickActions provides fast access to common actions on the dashboard.
 *
 * ## Actions
 * - **New Project**: Navigate to project creation wizard
 * - **SOS Help**: Access the AI troubleshooting assistant
 * - **Learn**: Browse technique tutorials and guides
 *
 * ## Design Notes
 * - Ghost button variant for subtle appearance
 * - Left-aligned icons for consistency
 * - Color-coded icons for visual distinction
 */
const meta: Meta<typeof QuickActions> = {
  title: 'Dashboard/QuickActions',
  component: QuickActions,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Quick action buttons for common dashboard tasks.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[250px] bg-background rounded-xl p-4 border">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof QuickActions>;

// ============================================================================
// DEFAULT
// ============================================================================

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default quick actions panel with all three action buttons.',
      },
    },
  },
};

// ============================================================================
// IN DARK BACKGROUND
// ============================================================================

export const InDarkBackground: Story = {
  decorators: [
    (Story) => (
      <div className="w-[250px] bg-chestnut/90 rounded-xl p-4">
        <div className="text-cream">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Quick actions on a darker background.',
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
      <div className="w-[180px] bg-background rounded-xl p-3 border">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Quick actions in a compact container.',
      },
    },
  },
};

// ============================================================================
// IN CARD
// ============================================================================

export const InCard: Story = {
  decorators: [
    (Story) => (
      <div className="w-[280px] bg-card rounded-xl p-5 shadow-md border">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Quick actions inside a card component.',
      },
    },
  },
};
