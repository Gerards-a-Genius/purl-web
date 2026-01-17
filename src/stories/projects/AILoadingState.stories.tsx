// src/stories/projects/AILoadingState.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { AILoadingState } from '@/components/projects/AILoadingState';

const meta = {
  title: 'Projects/AILoadingState',
  component: AILoadingState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AILoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export const WithCustomMessage: Story = {
  args: {
    message: 'Analyzing your pattern...',
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export const WithEstimatedTime: Story = {
  args: {
    estimatedTime: 'This usually takes 10-15 seconds',
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export const FullyConfigured: Story = {
  args: {
    message: 'Processing your PDF pattern...',
    estimatedTime: 'Estimated time: 30 seconds',
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export const InCard: Story = {
  render: () => (
    <div className="w-[400px] border rounded-lg shadow-sm bg-card">
      <AILoadingState />
    </div>
  ),
};

export const CompactSpace: Story = {
  args: {
    className: 'py-8',
  },
  decorators: [
    (Story) => (
      <div className="w-[300px] border rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export const FullScreen: Story = {
  args: {
    message: 'Parsing your knitting pattern...',
    estimatedTime: 'This may take a moment for complex patterns',
  },
  decorators: [
    (Story) => (
      <div className="w-screen h-screen flex items-center justify-center bg-muted/30">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};
