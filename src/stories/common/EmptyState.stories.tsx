// src/stories/common/EmptyState.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from '@/components/common/EmptyState';
import { Package, Search, FolderOpen, Inbox, FileQuestion, BookOpen } from 'lucide-react';

const meta = {
  title: 'Common/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: false,
    },
    onAction: {
      action: 'clicked',
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: Package,
    title: 'No projects yet',
    description: 'Create your first knitting project to get started on your crafting journey.',
  },
};

export const WithAction: Story = {
  args: {
    icon: FolderOpen,
    title: 'No projects found',
    description: "You haven't created any projects yet. Start your first knitting project today!",
    actionLabel: 'Create Project',
    onAction: () => alert('Create project clicked'),
  },
};

export const SearchEmpty: Story = {
  args: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search terms or browse all items instead.',
    actionLabel: 'Clear Search',
    onAction: () => alert('Clear search clicked'),
  },
};

export const InboxEmpty: Story = {
  args: {
    icon: Inbox,
    title: 'All caught up!',
    description: 'You have no pending notifications. Check back later for updates.',
  },
};

export const PatternNotFound: Story = {
  args: {
    icon: FileQuestion,
    title: 'Pattern not found',
    description: 'The pattern you are looking for does not exist or has been removed.',
    actionLabel: 'Browse Library',
    onAction: () => alert('Browse library clicked'),
  },
};

export const TechniquesEmpty: Story = {
  args: {
    icon: BookOpen,
    title: 'No techniques yet',
    description: "We're still adding techniques to this category. Check back soon!",
  },
};

export const CustomStyling: Story = {
  args: {
    icon: Package,
    title: 'Custom styled empty state',
    description: 'This empty state has custom styling applied via className.',
    className: 'bg-muted rounded-xl',
  },
};

export const InCard: Story = {
  args: {
    icon: Package,
    title: 'No items here',
    description: 'This empty state is rendered inside a card container.',
    actionLabel: 'Add Item',
    onAction: () => alert('Add item clicked'),
    className: 'py-8',
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] border rounded-lg shadow-sm bg-card">
        <Story />
      </div>
    ),
  ],
};
