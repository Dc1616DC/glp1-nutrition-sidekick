# GLP-1 Nutrition Companion App

Welcome to your GLP-1 Nutrition Companion! This web application is designed to be a simple, supportive tool for individuals using GLP-1 medications. It focuses on providing clear nutrition guidance, AI-powered meal planning, and essential education without the complexity of traditional tracking apps.

## Core Features

-   **Personalized Nutrition Calculator**: Calculates your unique Total Daily Energy Expenditure (TDEE), target calories, and protein goals, with special adjustments for the needs of GLP-1 users.
-   **User Authentication & Profiles**: A simple and secure system for users to sign up, log in, and save their calculator results and preferences.
-   **Meal Database & AI Generation**: A hybrid system that offers a curated list of high-protein, high-fiber meals and uses AI (GPT-3.5) to generate new meal ideas based on user preferences.
-   **Educational Content Hub**: A collection of short, easy-to-understand articles on topics like the importance of protein, managing side effects, and making sustainable food choices.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) with React
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication & Firestore)
-   **AI Integration**: [OpenAI API](https://openai.com/api/)

---

## Getting Started (Beginner's Guide)

Follow these steps carefully to get the project running on your local machine. Don't worry, I'll guide you through everything!

### Step 1: Prerequisites

Before you begin, you need to have [Node.js](https://nodejs.org/) installed on your computer. Node.js includes `npm` (Node Package Manager), which we'll use to install project dependencies.

-   You can download it from the official website: [nodejs.org](https://nodejs.org/). I recommend the **LTS** (Long Term Support) version.

### Step 2: Project Installation

1.  **Clone the Repository**: First, you need to get the code onto your computer. Open your terminal (like Terminal on Mac or Command Prompt/PowerShell on Windows) and run this command:
    ```bash
    git clone <your-repository-url>
    ```
    (Replace `<your-repository-url>` with the actual URL of this repository).

2.  **Navigate to the Project Directory**:
    ```bash
    cd glp1-nutrition-sidekick
    ```

3.  **Install Dependencies**: Now, use `npm` to install all the packages the project needs to run.
    ```bash
    npm install
    ```
    This might take a minute or two. It reads the `package.json` file and downloads all the necessary libraries into a `node_modules` folder.

### Step 3: Setting Up Environment Variables

This is the most important setup step. We need to give the application the "keys" to connect to services like Firebase and OpenAI. We'll do this by creating a special file that is kept private on your machine.

1.  **Create the `.env.local` file**: In the root of your project folder, create a new file and name it exactly:
    ```
    .env.local
    ```

2.  **Copy the template**: Open the `.env.example` file that's already in the project. Copy its entire contents and paste them into your new `.env.local` file.

Now, let's fill in the values.

#### Firebase Setup

Follow these instructions to get your Firebase keys.

1.  **Go to the Firebase Console**: Visit [console.firebase.google.com](https://console.firebase.google.com/) and sign in with your Google account.
2.  **Create a Project**: Click on "Add project" and follow the on-screen instructions. You can give it any name you like (e.g., "GLP-1 Companion"). You can disable Google Analytics for now to keep things simple.
3.  **Create a Web App**: Once your project is created, you'll be on the project dashboard. Click the **`</>`** icon (it's for "Web") to add a web app to your project.
4.  **Register App**: Give your app a nickname (e.g., "GLP-1 Web App"). **Do not** check the box for Firebase Hosting. Click "Register app".
5.  **Find Your Keys**: Firebase will show you your configuration keys. They will look something like this:
    ```javascript
    const firebaseConfig = {
      apiKey: "AIzaSy...",
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      // ...and so on
    };
    ```
6.  **Copy Keys to `.env.local`**: Copy each value from the Firebase console and paste it into your `.env.local` file.

    Your `.env.local` file should look like this (with your actual keys):
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
    NEXT_PUBLIC_FIREBASE_APP_ID="1:1234567890:web:abcdef123456"
    ```

7.  **Enable Firebase Services**:
    *   In the Firebase console, go to the "Build" section in the left-hand menu.
    *   Click on **Authentication**. Click "Get started" and enable the **Email/Password** sign-in provider.
    *   Click on **Firestore Database**. Click "Create database", start in **test mode** (this is fine for development), and choose a location near you.

#### OpenAI API Key

1.  **Get Your Key**: Go to your [OpenAI API keys page](https://platform.openai.com/api-keys).
2.  **Create a New Key**: Click "+ Create new secret key", give it a name, and copy the key it generates.
3.  **Add to `.env.local`**: Add the key to the bottom of your `.env.local` file.
    ```
    OPENAI_API_KEY="sk-..."
    ```

### Step 4: Run the Development Server

You're all set! To start the application, run the following command in your terminal:

```bash
npm run dev
```

This will start the local development server. You can now view your application by opening a web browser and going to **http://localhost:3000**.

---

## Importing the Meal Database

Your app includes a script to do a one-time import of meals from an Excel file into your Firebase database.

### 1. Prepare Your Files

-   **Excel File**: Make sure your meal data is in an Excel file named `meals.xlsx`. The column headers should match those referenced in the script (e.g., `Name`, `Category`, `Protein (g)`). Place this file inside the `src/scripts/` folder.
-   **Service Account Key**: This is a special key for allowing a script to act as an administrator for your Firebase project.
    1.  Go to your Firebase project settings (click the gear icon).
    2.  Go to the **Service accounts** tab.
    3.  Click the **"Generate new private key"** button. A JSON file will be downloaded.
    4.  Rename this file to `serviceAccountKey.json`.
    5.  Move this file into the `src/scripts/` folder.

    > **SECURITY WARNING**: The `serviceAccountKey.json` file is extremely sensitive. It provides full admin access to your Firebase project. The `.gitignore` file is already configured to prevent this file from being uploaded to GitHub, but you should never share it publicly.

### 2. Install Script Dependencies

The import script needs a couple of extra packages. Run these commands in your terminal:

```bash
npm install -g ts-node
npm install xlsx
```

### 3. Run the Import Script

With your `meals.xlsx` and `serviceAccountKey.json` files in the `src/scripts/` folder, run the following command from the **root directory** of your project:

```bash
ts-node src/scripts/importMeals.ts
```

You will see log messages in your terminal as each meal is uploaded to your Firestore database. You only need to do this once!

---

## Deployment

When you're ready to share your app with the world, you can deploy it to a hosting service.

-   **Recommended**: [Vercel](https://vercel.com/) is the company that created Next.js, and their hosting platform is optimized for it. It's incredibly easy to use.
-   **Alternative**: [Netlify](https://www.netlify.com/) is also an excellent choice that works well with Next.js.

When you deploy, you will need to set up your **environment variables** (the keys from your `.env.local` file) in the project settings on Vercel or Netlify. This ensures the live application can connect to Firebase and OpenAI securely.
