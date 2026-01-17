// src/stories/atoms/Input.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

/**
 * Input is the standard text input field for forms and search.
 * In Purl, inputs are used for project names, pattern searches, and user data entry.
 *
 * ## Use Cases
 * - Project name input
 * - Search patterns/techniques
 * - Email/password fields
 * - Numeric inputs (row counts, stitch counts)
 *
 * ## Accessibility
 * - Always pair with a Label component
 * - Use `aria-invalid` for error states
 * - Placeholder text supplements but doesn't replace labels
 */
const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: 'Input type',
      table: {
        defaultValue: { summary: 'text' },
      },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    'aria-invalid': {
      control: 'boolean',
      description: 'Error state (use with aria-invalid)',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Text input field with consistent styling for forms and search.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// ============================================================================
// BASIC INPUT
// ============================================================================

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'My First Scarf',
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Project name...',
  },
};

// ============================================================================
// INPUT TYPES
// ============================================================================

export const TextInput: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter your project name',
  },
};

export const EmailInput: Story = {
  args: {
    type: 'email',
    placeholder: 'you@example.com',
  },
};

export const PasswordInput: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const NumberInput: Story = {
  args: {
    type: 'number',
    placeholder: '0',
    min: 0,
    max: 100,
  },
};

export const SearchInput: Story = {
  args: {
    type: 'search',
    placeholder: 'Search techniques...',
  },
};

// ============================================================================
// STATES
// ============================================================================

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
  },
};

export const DisabledWithValue: Story = {
  args: {
    disabled: true,
    defaultValue: 'Cannot edit this',
  },
};

export const Invalid: Story = {
  args: {
    'aria-invalid': true,
    defaultValue: 'Invalid value',
  },
  parameters: {
    docs: {
      description: {
        story: 'Use `aria-invalid` to show error state. Pair with error message.',
      },
    },
  },
};

// ============================================================================
// WITH LABELS
// ============================================================================

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="project-name">Project Name</Label>
      <Input id="project-name" placeholder="My knitting project" />
    </div>
  ),
};

export const WithLabelAndDescription: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="yarn-type">Yarn Type</Label>
      <Input id="yarn-type" placeholder="e.g., Merino Wool" />
      <p className="text-caption text-muted-foreground">
        Enter the type of yarn you're using for this project.
      </p>
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="email-error">Email</Label>
      <Input
        id="email-error"
        type="email"
        aria-invalid={true}
        defaultValue="invalid-email"
      />
      <p className="text-caption text-destructive">
        Please enter a valid email address.
      </p>
    </div>
  ),
};

// ============================================================================
// WITH ICONS (COMPOSITION)
// ============================================================================

export const SearchWithIcon: Story = {
  render: () => (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="pl-10" placeholder="Search techniques..." />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Compose Input with icons using relative positioning.',
      },
    },
  },
};

export const EmailWithIcon: Story = {
  render: () => (
    <div className="relative w-full max-w-sm">
      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="email" className="pl-10" placeholder="Enter your email" />
    </div>
  ),
};

export const PasswordWithToggle: Story = {
  render: function PasswordToggle() {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div className="relative w-full max-w-sm">
        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type={showPassword ? 'text' : 'password'}
          className="pl-10 pr-10"
          placeholder="Enter password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  },
};

// ============================================================================
// KNITTING-SPECIFIC EXAMPLES
// ============================================================================

export const RowCountInput: Story = {
  render: () => (
    <div className="grid w-full max-w-[200px] gap-1.5">
      <Label htmlFor="row-count">Total Rows</Label>
      <Input
        id="row-count"
        type="number"
        min={1}
        max={999}
        defaultValue={24}
        className="text-center"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Number input for tracking row counts in projects.',
      },
    },
  },
};

export const StitchCountInput: Story = {
  render: () => (
    <div className="grid w-full max-w-[200px] gap-1.5">
      <Label htmlFor="stitch-count">Stitches per Row</Label>
      <Input
        id="stitch-count"
        type="number"
        min={1}
        max={999}
        defaultValue={32}
        className="text-center"
      />
    </div>
  ),
};

export const NeedleSizeInput: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="needle-size">Needle Size</Label>
      <Input
        id="needle-size"
        placeholder="e.g., 5mm, US 8, 4.5mm"
      />
      <p className="text-caption text-muted-foreground">
        Enter metric (mm) or US needle size.
      </p>
    </div>
  ),
};

// ============================================================================
// FILE INPUT
// ============================================================================

export const FileInput: Story = {
  args: {
    type: 'file',
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  parameters: {
    docs: {
      description: {
        story: 'File input for uploading pattern PDFs and images.',
      },
    },
  },
};
