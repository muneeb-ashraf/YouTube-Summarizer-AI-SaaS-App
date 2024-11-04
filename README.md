# YouTube Summarizer AI SaaS App

An AI-powered SaaS application that summarizes YouTube videos based on their transcript data. This application provides quick, high-quality summaries, helping users save time by giving them the essence of video content without needing to watch the entire video.

## Features

- **AI-Powered Summarization**: Uses advanced AI models to generate concise summaries.
- **User Authentication**: Google login and secure user sessions with NextAuth.
- **Coins/Points System**: Users spend coins/points for each summary, enabling monetization or access control.
- **Duplicate Check**: Ensures that summaries for previously processed videos are not re-generated, saving time and coins.
- **Efficient Backend with Prisma**: Uses Prisma for a structured database interface with Supabase/PostgreSQL.
- **Caching and Optimizations**: Reduces load time with caching strategies and prevents redundant API calls.
- **REST API**: Offers a structured API to handle summary requests and user interactions.
  
## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- **Node.js** (v16+)
- **PostgreSQL** (for database)
- **Supabase** (as the backend service, replaceable with any PostgreSQL-compatible database)
- **Prisma** ORM
- **NextAuth** (for user authentication)

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/youtube-summarizer-ai.git
    cd youtube-summarizer-ai
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Configure Environment Variables:**

   Create a `.env` file in the root directory and add the following variables:

   ```env
   # Supabase/Postgres Database URL
   DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<your_nextauth_secret>

   # Google OAuth (for login)
   GOOGLE_CLIENT_ID=<your_google_client_id>
   GOOGLE_CLIENT_SECRET=<your_google_client_secret>
   ```

4. **Set Up Prisma:**

   Generate the Prisma client and apply migrations to set up the database:

   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Run the Server:**

   Start the development server with:

   ```bash
   npm run dev
   ```

   The app should now be running at [http://localhost:3000](http://localhost:3000).

### Usage

- **User Signup/Login**: Users can sign up and log in using Google authentication.
- **Request Summary**: After logging in, users can enter a YouTube URL to get a summary.
- **Coin Deduction**: Each summary request deducts a set number of coins from the user’s account. If a summary for the same video exists, coins will not be deducted again.
- **Cache Check**: If a summary is available in the cache, it will be retrieved directly.

### Database Schema

Using Prisma, the following models are set up in `schema.prisma`:

1. **User** - Stores user data such as ID, name, email, and coin balance.
2. **CoinSpend** - Logs each summary request per user, preventing duplicate charges.
3. **Summary** - Stores summaries by video ID for quick retrieval and caching.

## API Endpoints

The app provides several key endpoints:

- **POST /api/summary** - Summarizes a YouTube video based on the URL provided.
- **POST /api/auth/callback** - Handles user login and Google OAuth callback.
- **GET /api/user** - Fetches user details and coin balance.
- **POST /api/spend-coins** - Deducts coins from the user's account.

### Example Requests

```bash
curl -X POST http://localhost:3000/api/summary \
  -H "Content-Type: application/json" \
  -d '{ "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }'
```

## Development

To run the app in development mode with hot-reloading:

```bash
npm run dev
```

### Prisma Commands

- **Generate Prisma Client**: `npx prisma generate`
- **Run Migrations**: `npx prisma migrate dev --name <migration-name>`
- **Check the Database**: `npx prisma studio`

### Testing

For testing, you can use Jest or any preferred testing library:

```bash
npm test
```

## Deployment

To deploy the app, ensure the environment variables are correctly set up on your server or hosting platform.

1. **Vercel** (recommended for Next.js applications)
2. **Docker** (optional, if using Docker containers)

## Contributing

We welcome contributions! Please fork the repository, make your changes, and submit a pull request.

## License

This project is licensed under the MIT License.

