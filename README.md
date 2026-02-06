# BlackBelt

A fully organized system for BJJ academy management.

## Stack

- **Expo 54** (React Native)
- **NativeWind** (Tailwind CSS)
- **Supabase** (Backend)
- **TypeScript**
- **Expo Router 6**

## Architecture

Uses **Ports/Adapters** (hexagonal architecture):

- `/src/core/ports` — interfaces
- `/src/infra/supabase` — implementations
- `/src/core/hooks` — use cases
- `/src/ui` — components

## Getting Started

```bash
npm install
npx expo start
```

## Documentation (Obsidian)

The project documentation is managed with Obsidian. To set up locally:

1. Create your Obsidian vault wherever you prefer
2. Symlink it to `docs/obsidian`:
   ```bash
   # Linux/WSL example:
   ln -s /path/to/your/BlackBelt-Docs docs/obsidian
   
   # Windows (PowerShell as Admin):
   New-Item -ItemType SymbolicLink -Path docs\obsidian -Target C:\path\to\BlackBelt-Docs
   ```

The `docs/obsidian` symlink is gitignored (machine-specific).
