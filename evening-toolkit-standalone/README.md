# Evening Toolkit - Standalone App

A mindful companion for evening eating and emotional awareness, extracted from the GLP-1 Nutrition Sidekick app.

## About

The Evening Toolkit helps you navigate evening urges to eat by:

- **Checking in** with your emotions and hunger levels
- **Exploring alternatives** like nurturing activities or mindful eating
- **Building awareness** of patterns over time with self-compassion

Rooted in intuitive eating principles, this tool focuses on curiosity rather than restriction.

## Features

- 🌙 **Evening Check-ins**: Multi-step guided reflection
- 🎯 **Activity Suggestions**: Based on your emotional state
- 🫁 **Breathing Exercises**: 4-7-8 technique for calm
- 📝 **Journaling Space**: Safe space for reflection
- ⏰ **Mindful Timers**: For eating or activities
- 📊 **Pattern Insights**: Learn about your habits
- 🔄 **Follow-up Check-ins**: 30-minute reflection prompts

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Technology Stack

- **Next.js 15** - React framework
- **React 19** - Latest React features
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Local Storage** - Data persistence

## Usage

### Starting a Check-in

The toolkit automatically appears during evening hours (6 PM - 11 PM) or can be manually started anytime.

### Data Storage

All data is stored locally in your browser using localStorage:
- `eveningToolkitHistory` - Your check-in records
- `eveningToolkitFollowUps` - Follow-up reflections
- `eveningToolkitLastShown` - Daily usage tracking

### Clearing Data

Use the "Clear Data" button on the main page to reset all stored information.

## Development

### Project Structure

```
src/
  app/                  # Next.js app router
    layout.tsx         # Root layout
    page.tsx           # Main page
    globals.css        # Global styles
  components/          # React components
    EveningToolkit.tsx # Main toolkit component
    EveningToolkitInsights.tsx
    EveningToolkitFollowUp.tsx
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

This app can be deployed to any platform that supports Next.js:

1. **Vercel** - Seamless deployment with git integration
2. **Netlify** - Static site hosting
3. **Docker** - Containerized deployment

## License

This project is part of the GLP-1 Nutrition Sidekick application.

## Contributing

This is a standalone extraction of the Evening Toolkit feature. For contributions to the main application, see the parent repository.