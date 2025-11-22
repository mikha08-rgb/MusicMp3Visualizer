# Tech Stack Overview

## Project: testvisual

This document outlines our complete technical stack for the new project.

---

## 🎨 Core Technologies

### 3D Visualization Stack
- **Three.js** (`v0.181.2`) - Industry-standard 3D graphics library for WebGL
- **React Three Fiber** (`v9.4.0`) - React renderer for Three.js, enables declarative 3D scenes
- **React Three Drei** (`v10.7.7`) - Helper library with useful abstractions and components for R3F
- **TypeScript Types for Three.js** - Full type safety for 3D development

### UI Framework (Coming)
- **Next.js** - React framework with server-side rendering, routing, and optimization
- **React 18+** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **shadcn/ui** - High-quality, customizable UI components built on Radix UI
- **Tailwind CSS** - Utility-first CSS framework

---

## 🤖 AI-Powered Development Tools

### Claude Code Setup
We're using Claude Code with an advanced plugin system for enhanced productivity:

#### Installed Plugins
- **next-project-starter@claude-tools** - Comprehensive Next.js development bundle

#### Marketplace
- **ClaudeSmith Marketplace** (`https://github.com/JNLei/claude-tools.git`)
  - Open-source collection of Claude Code plugins
  - Includes commands, hooks, agents, skills, and MCP servers

#### What the Plugin Bundle Provides

**1. Custom Commands** - Slash commands for common Next.js tasks
**2. Development Hooks** - Automated checks and workflows:
   - TypeScript type checking
   - Build validation
   - Skill activation prompts

**3. Agent Skills** - AI agents specialized in:
   - Frontend development patterns
   - Code refactoring
   - Skill optimization

**4. MCP Integration** - Model Context Protocol servers for enhanced AI capabilities

---

## 🔧 Active MCP Servers

### shadcn MCP Server
- **Purpose**: AI-powered component installation and management
- **Command**: `npx shadcn@latest mcp`
- **Capabilities**:
  - Search and install shadcn/ui components
  - View component examples and demos
  - Get installation commands
  - Audit checklist for new components

### Next.js DevTools (via plugin)
- Component tree inspection
- Runtime diagnostics
- Build optimization insights

---

## 📁 Project Structure

```
testvisual/
├── .claude/                    # Claude Code configuration
│   ├── settings.json          # Plugin and marketplace settings
│   └── settings.local.json    # Local permissions and MCP config
├── .mcp.json                  # MCP server definitions
├── node_modules/              # Dependencies
├── package.json               # Project dependencies
└── package-lock.json          # Locked dependency versions
```

---

## 🎯 Development Workflow

### AI-Assisted Development
1. Claude Code provides intelligent suggestions and code generation
2. Custom commands streamline repetitive tasks
3. Automated hooks ensure code quality (type checking, linting)
4. MCP servers enable component discovery and installation

### 3D Development
1. Build scenes declaratively with React Three Fiber
2. Use Drei helpers for common 3D patterns (cameras, controls, etc.)
3. Type-safe Three.js development with TypeScript
4. Hot reload for rapid iteration

### UI Development (Coming)
1. Use shadcn/ui components via MCP server
2. Customize with Tailwind CSS
3. Server-side rendering with Next.js
4. Optimized for performance and SEO

---

## 🚀 Next Steps

To complete the stack setup:

1. **Install Next.js**: `npx create-next-app@latest .`
2. **Initialize Tailwind**: Next.js installer will prompt for this
3. **Initialize shadcn/ui**: `npx shadcn@latest init`
4. **Integrate Three.js**: Move existing 3D dependencies into Next.js structure

---

## 💡 Why This Stack?

### For 3D Development
- **React Three Fiber**: Brings React's component model to 3D, making complex scenes manageable
- **Drei**: Reduces boilerplate for common 3D patterns (lighting, cameras, controls)
- **Three.js**: Battle-tested, widely used, excellent documentation

### For UI/Framework
- **Next.js**: Production-ready, excellent DX, built-in optimization
- **shadcn/ui**: Owns the code (not a dependency), fully customizable, accessible
- **Tailwind**: Rapid styling, small bundle size, great with component libraries

### For AI Tooling
- **Claude Code with MCP**: Contextual AI assistance with access to project internals
- **Plugin System**: Extensible, community-driven tools for specific frameworks
- **Automated Workflows**: Reduce manual tasks, enforce quality standards

---

## 📚 Resources

- [Three.js Docs](https://threejs.org/docs/)
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber/)
- [Drei Documentation](https://github.com/pmndrs/drei)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [ClaudeSmith Marketplace](https://github.com/JNLei/claude-tools)

---

**Last Updated**: November 21, 2025
