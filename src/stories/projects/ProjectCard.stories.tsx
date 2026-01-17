// src/stories/projects/ProjectCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import type { Project } from '@/types/project';

const meta = {
  title: 'Projects/ProjectCard',
  component: ProjectCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onPress: () => {},
  },
  argTypes: {
    onPress: {
      action: 'pressed',
    },
  },
} satisfies Meta<typeof ProjectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'proj-1',
  userId: 'user-1',
  name: 'Cable Knit Sweater',
  status: 'in_progress',
  needles: '5mm Circular',
  yarn: 'Merino Wool - Navy Blue',
  techniques: ['cable', 'stockinette'],
  currentStepIndex: 2,
  totalRows: 150,
  steps: [
    { id: 's1', type: 'single', label: '1', title: 'Cast On', description: 'Cast on stitches', completed: true, techniques: [] },
    { id: 's2', type: 'single', label: '2', title: 'Ribbing', description: 'Work ribbing', completed: true, techniques: [], rowCount: 20 },
    { id: 's3', type: 'single', label: '3', title: 'Body', description: 'Knit body', completed: false, techniques: [], rowCount: 80 },
    { id: 's4', type: 'single', label: '4', title: 'Finishing', description: 'Finish up', completed: false, techniques: [], rowCount: 50 },
  ],
  createdAt: new Date().toISOString(),
  lastWorkedAt: new Date().toISOString(),
  ...overrides,
});

export const Default: Story = {
  args: {
    project: createMockProject(),
  },
  decorators: [
    (Story) => (
      <div className="w-[350px]">
        <Story />
      </div>
    ),
  ],
};

export const Planned: Story = {
  args: {
    project: createMockProject({
      name: 'Summer Shawl',
      status: 'planned',
      yarn: 'Cotton Blend - Cream',
      needles: '4mm Straight',
    }),
  },
  decorators: [
    (Story) => (
      <div className="w-[350px]">
        <Story />
      </div>
    ),
  ],
};

export const Finished: Story = {
  args: {
    project: createMockProject({
      name: 'Cozy Beanie',
      status: 'finished',
      yarn: 'Alpaca Blend - Burgundy',
      needles: '6mm DPNs',
      steps: [
        { id: 's1', type: 'single', label: '1', title: 'Cast On', description: 'Cast on stitches', completed: true, techniques: [], rowCount: 5 },
        { id: 's2', type: 'single', label: '2', title: 'Body', description: 'Work body', completed: true, techniques: [], rowCount: 30 },
        { id: 's3', type: 'single', label: '3', title: 'Crown', description: 'Decrease for crown', completed: true, techniques: [], rowCount: 10 },
      ],
      totalRows: 45,
    }),
  },
  decorators: [
    (Story) => (
      <div className="w-[350px]">
        <Story />
      </div>
    ),
  ],
};

export const Compact: Story = {
  args: {
    project: createMockProject(),
    compact: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[280px]">
        <Story />
      </div>
    ),
  ],
};

export const LongProjectName: Story = {
  args: {
    project: createMockProject({
      name: 'Grandmother\'s Vintage Cable Knit Cardigan Pattern with Traditional Irish Stitches',
    }),
  },
  decorators: [
    (Story) => (
      <div className="w-[350px]">
        <Story />
      </div>
    ),
  ],
};

export const LowProgress: Story = {
  args: {
    project: createMockProject({
      name: 'Just Started Scarf',
      totalRows: 200,
      steps: [
        { id: 's1', type: 'single', label: '1', title: 'Cast On', description: 'Cast on stitches', completed: true, techniques: [], rowCount: 10 },
        { id: 's2', type: 'single', label: '2', title: 'Body', description: 'Work body', completed: false, techniques: [], rowCount: 190 },
      ],
    }),
  },
  decorators: [
    (Story) => (
      <div className="w-[350px]">
        <Story />
      </div>
    ),
  ],
};

export const HighProgress: Story = {
  args: {
    project: createMockProject({
      name: 'Almost Done Socks',
      totalRows: 100,
      steps: [
        { id: 's1', type: 'single', label: '1', title: 'Cuff', description: 'Cast on', completed: true, techniques: [], rowCount: 20 },
        { id: 's2', type: 'single', label: '2', title: 'Leg', description: 'Work leg', completed: true, techniques: [], rowCount: 40 },
        { id: 's3', type: 'single', label: '3', title: 'Heel', description: 'Turn heel', completed: true, techniques: [], rowCount: 20 },
        { id: 's4', type: 'single', label: '4', title: 'Foot', description: 'Work foot', completed: false, techniques: [], rowCount: 15, completedRows: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        { id: 's5', type: 'single', label: '5', title: 'Toe', description: 'Finish toe', completed: false, techniques: [], rowCount: 5 },
      ],
    }),
  },
  decorators: [
    (Story) => (
      <div className="w-[350px]">
        <Story />
      </div>
    ),
  ],
};

export const NarrowContainer: Story = {
  args: {
    project: createMockProject(),
  },
  decorators: [
    (Story) => (
      <div className="w-[200px]">
        <Story />
      </div>
    ),
  ],
};

export const WideContainer: Story = {
  args: {
    project: createMockProject(),
  },
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
};

export const Grid: Story = {
  args: {
    project: createMockProject(),
  },
  render: () => {
    const projects = [
      createMockProject({ id: '1', name: 'Cable Knit Sweater' }),
      createMockProject({ id: '2', name: 'Summer Shawl', status: 'planned', yarn: 'Cotton - Cream' }),
      createMockProject({ id: '3', name: 'Cozy Beanie', status: 'finished', yarn: 'Alpaca - Red' }),
      createMockProject({ id: '4', name: 'Winter Mittens', yarn: 'Wool - Mustard' }),
    ];

    return (
      <div className="grid grid-cols-2 gap-4 w-[700px]">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onPress={() => {}} />
        ))}
      </div>
    );
  },
};
