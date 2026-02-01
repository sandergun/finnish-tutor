# Project Analysis

## Core Technologies

*   **Frontend**: Next.js with React
*   **State Management**: Zustand
*   **Styling**: Tailwind CSS
*   **Backend**: Next.js API Routes
*   **AI**: Groq API (`llama-3.3-70b-versatile` model)
*   **Database**: Supabase (PostgreSQL)

## Project Structure

*   `app/`: Contains the Next.js pages and API routes.
    *   `app/page.js`: The main entry point of the application.
    *   `app/layout.tsx`: The root layout of the application.
    *   `app/api/`: Contains the API routes.
        *   `app/api/generate-lesson/route.js`: The endpoint for generating lessons.
*   `components/`: Contains the React components.
    *   `components/Dashboard.js`: The main component for logged-in users.
    *   `components/AdminPanel.js`: The component for managing and generating lessons.
    *   `components/LessonPlayer.js`: The component for playing lessons.
*   `lib/`: Contains the core logic of the application.
    *   `lib/lessonGenerator.js`: The core logic for generating lessons using the Groq API.
    *   `lib/supabase.js`: The Supabase client.
*   `store/`: Contains the Zustand stores for managing state.
    *   `store/useUserStore.js`: The store for managing user data.
    *   `store/useAchievementsStore.js`: The store for managing achievements.

## Core Functionality

*   User authentication and progress tracking.
*   AI-powered lesson generation using the Groq API.
*   An admin panel for managing and creating lessons.
*   Lessons include theory, flashcards, quizzes, and dialogues.
*   Automatic suggestion of the next lesson topic.
*   The application is designed to be used with a Telegram Mini App.

## Lesson Generation

The `lib/lessonGenerator.js` file contains the core logic for generating lessons. It constructs a detailed prompt for the Groq API, asking it to generate a complete lesson in JSON format. The generated lesson is then stored in the Supabase database.

The prompt includes specific instructions for the AI on the structure and content of the lesson, including the number of cards and quiz questions, the types of quiz questions, and the format of the data.
