Theory Hub- is a comprehensive platform for learning programming languages and frameworks. It provides theory, examples, and interactive code snippets for modern technologies. Users can register, log in, and explore programming concepts, while admins can manage content and users securely.

✨ Project Overview

Modern software development requires not just hands-on coding but also deep theoretical knowledge. Theory Hub bridges the gap between learning and application:

For Learners: Access theory, examples, and code snippets of popular programming languages and frameworks.

For Admins: Easily manage users, languages, and theory content.

Security & Authentication: Protect user data with hashed passwords and JWT-based sessions.

Responsive UI: Fully responsive design with React + Tailwind CSS for smooth navigation across devices.

📚 Features

User Features:

Signup / Login with secure authentication

Explore programming languages and frameworks

View theory, code examples, and best practices

Search functionality for easy content discovery

Personalized experience with viewed languages tracking

Admin Features:

Role-based access control

Admin dashboard for user and content management

Add / Edit / Delete languages and topics

Monitor user activity

Technical Features:

Password hashing with bcryptjs

JWT-based authentication and authorization

RESTful API with Express.js

MongoDB for persistent data storage

Axios for API requests

Fully responsive React + Tailwind CSS frontend

🛠 Tech Stack

Frontend:

React.js

React Router DOM

Tailwind CSS

Axios

Backend:

Node.js / Express.js

MongoDB / Mongoose

bcryptjs (Password Hashing)

jsonwebtoken (JWT Authentication)

⚡ Architecture & Flow

Frontend (React):

Users interact with UI, fill forms, view content.

Axios calls the backend API endpoints.

Backend (Node.js / Express):

Receives API requests, validates input, handles authentication.

Interacts with MongoDB for CRUD operations.

Database (MongoDB):

Stores user information, roles, programming languages, and theory topics.

Authentication:

Passwords are hashed with bcryptjs.

JWT tokens manage sessions securely.

Flow Example (Login):

User -> Frontend Login Form -> POST /api/auth/login -> Backend Validation -> JWT Token -> Frontend Stores Token -> Access Protected Routes

📝 Setup Instructions
1️⃣ Clone the Repository
git clone https://github.com/your-username/theory-hub.git
cd theory-hub

2️⃣ Backend Setup
cd backend
npm install


Create a .env file:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key


Start the backend server:

npm run dev

3️⃣ Frontend Setup
cd ../frontend
npm install
npm start

🔗 API Endpoints
Method	Route	Description
POST	/api/auth/signup	Register a new user
POST	/api/auth/login	Login a user
GET	/api/languages	Get all languages
GET	/api/languages/:id	Get language by ID
🌐 Usage
For Users:

Signup or login.

Browse programming languages and frameworks.

Click a language to view theory, examples, and code snippets.

Use search to find topics quickly.

For Admins:

Login with an admin account.

Access the Admin Dashboard.

Add, edit, or remove users, languages, and theory topics.

Monitor user activity for analytics.

💡 Why Theory Hub?

In modern software engineering:

Theory is as important as practice.

Understanding underlying concepts helps in interviews and real-world projects.

Theory Hub is designed to make learning structured, interactive, and engaging.

It’s perfect for students, self-learners, and professionals looking to strengthen programming fundamentals.

🎯 Future Enhancements

Interactive coding challenges

User progress tracking


Real-time collaborative notes

📝 License

This project is licensed under the MIT License.

