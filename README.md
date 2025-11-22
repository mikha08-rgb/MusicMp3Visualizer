# testvisual

A modern 3D visualization project built with Next.js, React Three Fiber, and Three.js.

## Tech Stack

See [TECH_STACK.md](./TECH_STACK.md) for a comprehensive overview of our technical architecture.

### Core Technologies

- **Next.js 16** - React framework with server-side rendering
- **React 19** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Helper components for R3F
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components

### AI Development Tools

- **Claude Code** - AI-powered development assistance
- **next-project-starter** - Next.js development bundle (commands, hooks, agents)
- **shadcn MCP** - AI-powered component installation

## Getting Started

### Prerequisites

- Node.js 18+
- npm, pnpm, yarn, or bun

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm run start
```

## Project Structure

```
testvisual/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   └── Scene.tsx          # 3D scene component
├── lib/                   # Utility functions
│   └── utils.ts           # Helper utilities
├── .claude/               # Claude Code configuration
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── components.json        # shadcn/ui configuration
```

## Features

- **3D Rendering**: Interactive 3D scenes with Three.js
- **Orbit Controls**: Click and drag to rotate, scroll to zoom
- **Responsive Design**: Works on all device sizes
- **Type Safety**: Full TypeScript support
- **Modern UI**: Built with shadcn/ui components
- **Fast Refresh**: Instant feedback during development
- **AI Assistance**: Claude Code integration for enhanced productivity

## Adding shadcn/ui Components

Use the shadcn MCP server or CLI to add components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
```

## Development Workflow

1. **Start Dev Server**: `npm run dev`
2. **Make Changes**: Edit files in `app/` or `components/`
3. **See Updates**: Changes appear instantly with Fast Refresh
4. **Add UI Components**: Use shadcn/ui for consistent design
5. **Build 3D Scenes**: Use React Three Fiber in `components/`

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# shadcn/ui
npx shadcn@latest add [component]  # Add component
npx shadcn@latest diff             # Check for updates
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Three.js Docs](https://threejs.org/docs/)
- [Drei Components](https://github.com/pmndrs/drei)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## License

MIT
