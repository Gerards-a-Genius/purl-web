// src/stories/common/StatusPill.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { StatusPill } from '@/components/common/StatusPill';

const meta = {
  title: 'Common/StatusPill',
  component: StatusPill,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['planned', 'in_progress', 'finished'],
    },
  },
} satisfies Meta<typeof StatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Planned: Story = {
  args: {
    status: 'planned',
  },
};

export const InProgress: Story = {
  args: {
    status: 'in_progress',
  },
};

export const Finished: Story = {
  args: {
    status: 'finished',
  },
};

export const AllStatuses: Story = {
  args: {
    status: 'in_progress',
  },
  render: () => (
    <div className="flex gap-3">
      <StatusPill status="planned" />
      <StatusPill status="in_progress" />
      <StatusPill status="finished" />
    </div>
  ),
};

export const InContext: Story = {
  args: {
    status: 'in_progress',
  },
  render: () => (
    <div className="space-y-4 p-4 bg-card rounded-lg border w-[300px]">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Cable Knit Sweater</h3>
        <StatusPill status="in_progress" />
      </div>
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Summer Shawl</h3>
        <StatusPill status="planned" />
      </div>
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Cozy Beanie</h3>
        <StatusPill status="finished" />
      </div>
    </div>
  ),
};

export const WithCustomClassName: Story = {
  args: {
    status: 'in_progress',
    className: 'text-xs',
  },
};
