# TalentLink Frontend

React application with Context API and Figma design system.

## Project Structure

```
client/
├── public/
├── src/
│   ├── assets/             # Icons, images
│   ├── components/
│   │   ├── common/         # Reusable UI components
│   │   └── auth/           # Auth-specific components
│   ├── features/
│   │   └── authentication/
│   │       ├── components/ # Feature components
│   │       ├── context/    # Auth Context API
│   │       └── hooks/      # Custom hooks
│   ├── pages/              # Page components
│   ├── styles/             # Global styles, theme
│   ├── utils/              # Utilities
│   └── api/                # API configuration
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the root:
```
REACT_APP_API_URL=http://localhost:8000/api
```

### 3. Start Development Server
```bash
npm start
```

Application runs at: http://localhost:3000

## Design System

The app uses the Figma design system with:
- Orange primary color (#f97316)
- Clean, minimal UI
- Poppins for headings
- Inter for body text
- Consistent spacing and shadows

## Features
- Context API for state management
- Feature-based architecture
- Role-based authentication (Freelancer/Client)
- Clean, modern UI matching Figma designs
