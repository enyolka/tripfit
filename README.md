# TripFit

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## 1. Project Description
TripFit is a web application designed to simplify travel planning by integrating tourism attractions with physical activities. The app helps users create personalized travel itineraries that balance sightseeing with fitness routines. It leverages artificial intelligence to generate daily plans that include an active morning, a key attraction of the day, and a period for recovery, all while taking into account the user's fitness preferences.

## 2. Tech Stack
- **Frontend:**
  - Astro 5
  - React 19
  - TypeScript 5
  - Tailwind 4
  - Shadcn/ui

- **Backend:**
  - Supabase (PostgreSQL, authentication, and data management)

- **AI Integration:**
  - Openrouter.ai for accessing models (OpenAI, Anthropic, Google, etc.)

- **Testing:**
  - Vitest for unit and integration tests
  - React Testing Library for component testing
  - Playwright for end-to-end (E2E) tests
  - MSW (Mock Service Worker) for API mocking in tests

- **CI/CD & Hosting:**
  - GitHub Actions for continuous integration and deployment
  - DigitalOcean for hosting via Docker

- **Environment:**
  - Node.js 22.14.0 (as specified in the `.nvmrc` file)

## 3. Getting Started Locally
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/tripfit.git
   cd tripfit
   ```

2. **Install Dependencies:**
   Ensure you are using Node.js version 22.14.0 (or use nvm):
   ```bash
   nvm use
   npm install
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000) (port may vary).

## 4. Available Scripts
- **`npm run dev`**: Runs the application in development mode.
- **`npm run build`**: Builds the application for production.
- **`npm run preview`**: Serves the production build locally for preview.
- **`npm run test`**: Runs the test suite (if implemented).

## 5. Project Scope
TripFit focuses on the following key features:
- **User Authentication:** Registration, login, and secure account management.
- **Profile Management:** Users can specify their favorite physical activities to tailor travel plans.
- **Travel Note Management:** Creation, editing, and deletion of travel notes with details like location, travel date, and preferred activity type.
- **AI-Based Itinerary Generation:** Integration with an AI module to generate personalized travel plans. The plans include a balanced schedule with time allocated for an active morning, a main attraction, and recovery.
- **Plan Confirmation:** Users can accept, edit, or delete generated travel plans.
- **Data Security:** Secure handling of user data with authentication, authorization, and best practices for database operations.

## 6. Project Status
**In Development**

## 7. License
This project is licensed under the [MIT License](LICENSE).

For further documentation and details, please refer to the in-repository docs or contact the project maintainers.
