import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/globals.css';
import React from 'react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Use Purl's warm-white background as default
    backgrounds: {
      default: 'warm-white',
      values: [
        { name: 'warm-white', value: '#FBF7E8' },
        { name: 'white', value: '#FFFFFF' },
        { name: 'caramel-surface', value: '#FFF8F2' },
        { name: 'dark', value: '#1a0a08' },
      ],
    },
    // Sort stories by type
    options: {
      storySort: {
        order: [
          'Introduction',
          'Design Tokens',
          'Atoms',
          ['Button', 'Badge', 'Input', 'Progress', 'Skeleton'],
          'Molecules',
          ['ProjectCard', 'StatusPill', 'TechniqueChip', 'EmptyState'],
          'Organisms',
          ['PatternViewer', 'AnnotationCanvas', 'ShowMeHowSheet', 'SOSAssistant', 'StepNavigator'],
          'Pages',
        ],
      },
    },
    a11y: {
      // Show a11y violations in the test UI
      test: 'todo',
    },
  },
  decorators: [
    (Story) => {
      // Apply font classes for Storybook (mimics Next.js layout)
      return React.createElement(
        'div',
        {
          // Manrope font-stack - using system fallback since next/font doesn't work in Storybook
          style: {
            fontFamily: '"Manrope", system-ui, sans-serif',
            minHeight: '100vh',
          },
          className: 'antialiased',
        },
        React.createElement(Story)
      );
    },
  ],
  tags: ['autodocs'],
};

export default preview;
