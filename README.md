# UC Gator Admin System

A comprehensive administrative platform for managing UC Gator's campus operations and user management. Built with React, TypeScript, and Vite for optimal performance and developer experience.

## Features

- **User Management**
  - Admin user creation and management
  - Role-based access control (Admin, Editor, Viewer)
  - User status management (Active, Suspended, Inactive)
  - Granular permissions system

- **Campus Management**
  - Interactive campus map
  - Location pin management
  - Building editor functionality

- **Dashboard**
  - Overview of system operations
  - Quick access to key features
  - System reports

- **Announcement System**
  - Create and manage announcements
  - List and view all announcements

## Tech Stack

- React 19
- TypeScript
- Vite
- TailwindCSS
- React Router DOM
- React Auth Kit
- Axios
- Font Awesome
- React Toastify

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=your_api_url_here
```

## Development

This project uses ESLint for code linting. To run the linter:

```bash
npm run lint
```

## Security

- Authentication is handled through React Auth Kit
- Secure cookie-based session management
- Role-based access control
- Protected routes implementation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is private and confidential. All rights reserved.
