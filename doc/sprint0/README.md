# My Dorm Store Website 

## Overview 
My Dorm Store is an e-commerce platform that which designed to simplify the dorm move-in process for canadian post-secondary students. It allows students (and their families to customize and bundle essential items based on their dorm specifications, with a user-friendly web interface tailored for mobile and desktop use. 
### Key features include:
  - Dorm-specific recommendations (e.g., bed size, package types)
  - Easy checkout and delivery system
  - Admin dashboard for inventory tracking and updates


## Installation Instructions

1. **Clone the repository**

    ```bash
    git clone https://github.com/UTSC-CSCC01-Software-Engineering-I/term-group-project-c01s25-project-my-dormstore
    cd term-group-project-c01s25-project-my-dormstore
    ```

2. **Install dependencies**

  - Install frontend and backend dependencies:
   
    ```bash
    #frontend
    cd frontend
    npm install

    #backend
    cd backend
    npm install
    ```

3. **Set Up Environment Variables**
  - Frontend (frontend/.env):

     ```env
    REACT_APP_API_URL=http://localhost:5001
    ```

  - Backend (backend/.env):
    
    ```env
    PORT=5001
    PG_USER=your_db_user
    PG_PASSWORD=your_db_password
    PG_DATABASE=your_db_name
    PG_HOST=localhost
    PG_PORT=5432
    JWT_SECRET=your_jwt_secret
    ```

    - Make sure everyone is using the same PORT value across .env files and server.js

4. **Run the Application**

  - Open two separate terminals to run the backend and frontend servers

    ```bash
    #Backend Servier
    cd backend
    node server.js (or npm run dev)

    #frontend Server
    cd frontend
    npm run dev (or npm start)
    ```

## Contribution Guidelines

1. Fork the repository
2. Create a new feature branch:
   ```bash
   git checkout -b feature/{feature-name}
   ```
3. Commit changes with clear commit messages
4. Push and open a Pull Request into the <code>develop</code> branch
5. Reference the related issue number (e.g., <code>Fixes #10</code> in PR description 

### Branching Strategy

We use Git Flow to manage development:

  * <code>main</code>: for production-ready code
  * <code>develop</code>: latest development code
  * <code>feature/{name}</code>: new features
  * <code>bugfix/{name}</code>: bug fiexes
  * <code>release/{name}</code>: prepare for a new release
  * <code>hotfix/{name}</code>: for critical fixes on production code (main)

### Issues and ticketing 

All tasks are tracked using [Github Issues](https://github.com/yourusername/your-repo/issues) for tracking features, bugs, and enhancements. All tasks must be linked to an issue. Each issue should be assigned, labled (e.g., <code>frontend</code>, <code>backend</code>, bug, enhancement), and referenced in pull requests where applicable. 








