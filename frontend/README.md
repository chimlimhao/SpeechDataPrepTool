# Frontend Service Setup Guide

This is the frontend service for the Speech Data Preparation Tool, providing a user interface for managing speech data projects and audio file processing.

## Prerequisites

- Node.js 16 or higher
- npm or yarn
- Supabase account and project
- Backend service running (see backend/README.md)

## Setup Instructions

1. **Install Dependencies**
```bash
npm install
# or
yarn install
```

2. **Environment Configuration**
Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

## Project Structure
```
frontend/
├── components/     # React components
├── pages/         # Next.js pages
├── public/        # Static assets
├── styles/        # CSS styles
├── utils/         # Utility functions
└── package.json
```

## Available Scripts

```bash
# Development mode
npm run dev
# or
yarn dev

# Build for production
npm run build
# or
yarn build

# Start production server
npm start
# or
yarn start
```

## Features

- **Project Management**
  - Create and manage speech data projects
  - Upload audio files
  - Monitor processing status
  - Export processed data

- **Audio Processing**
  - Preview audio files
  - Test noise reduction
  - View transcriptions
  - Export datasets

- **User Management**
  - Authentication with Supabase

## Development Guidelines

1. **Component Structure**
   - Use functional components with hooks
   - Follow atomic design principles
   - Implement proper prop validation

2. **State Management**
   - Use React Query for server state
   - Context API for global state
   - Local state for component-specific data

3. **Styling**
   - Tailwind CSS for styling
   - Follow responsive design principles
   - Maintain consistent theming

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | Yes |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anonymous key | Yes |
| NEXT_PUBLIC_BACKEND_URL | Backend service URL | Yes |

## Deployment

1. **Build the Application**
```bash
npm run build
# or
yarn build
```

2. **Start the Production Server**
```bash
npm start
# or
yarn start
```

## Troubleshooting

1. **Build Issues**
   - Clear `.next` directory
   - Remove node_modules and reinstall
   - Check Node.js version

2. **API Connection Issues**
   - Verify environment variables
   - Check CORS configuration
   - Ensure backend and machine-learning service is running

3. **Authentication Problems**
   - Check Supabase configuration
   - Clear local storage
   - Verify JWT tokens

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style
2. Write meaningful commit messages
3. Test your changes thoroughly
4. Update documentation as needed
