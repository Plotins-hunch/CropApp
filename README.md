# CropApp

1. Set Up the Backend (FastAPI + SQLite)
Navigate to the backend directory:
cd backend
Create and activate a virtual environment:
On macOS/Linux:
python3 -m venv venv
source venv/bin/activate
On Windows:
python -m venv venv
venv\Scripts\activate
Install the backend dependencies:
pip install -r requirements.txt
Run the FastAPI application:
uvicorn app.main:app --reload
This will start the backend server at http://localhost:8000.
2. Set Up the Frontend (React.js)
Navigate to the frontend directory:
cd ../frontend
Install the frontend dependencies:
npm install
Start the React development server:
npm start
The React app will launch on http://localhost:3000.
3. Additional Tips
Environment Variables:
If your project requires environment-specific settings (such as API URLs or secret keys), ensure these are documented in a README or a sample .env file. Teammates may need to create their own .env file with the required configurations.
Code Editor Setup:
It’s helpful if everyone uses an editor with support for Python and JavaScript (e.g., VS Code), along with recommended extensions like Python, Prettier, and ESLint for a smoother development experience.
Version Control:
Remind teammates to pull the latest changes frequently and to commit their own changes following your team’s Git workflow (e.g., using branches and pull requests).
Following these steps, your team members will have a local development environment with the backend and frontend both up and running, ready for further development or testing.
