## Release Plan

### Release Name: Sprint 1

---

## Release Objectives

### Specific Goals
- Set up core UI components and establish the frontend frameworks  
- Implement user authentication  
- Implement basic cart functionality  

### Metrics for Measurement
- Successful user registration and login (backend returns correct JWT tokens)  
- UI setups (React app runs successfully)  
- Cart implementation (users can add/remove items)  

---

## Release Scope

### Included Features
- **Register & Login**  
  - Users can create accounts and login  
  - Backend securely stores hashed passwords using bcrypt  
  - JWT tokens are issued upon login  

- **Frontend setup**  
  - React-based UI with basic page routing and forms  

### Excluded Features
- **Checkout Integration**  
  - Payment/checkout is planned for future sprints (Sprint 2), after cart persistence is implemented  

- **Role-based access**  
  - Only basic authentication for now; admin/user role separation is not yet implemented  

- **Persistent Cart Storage**  
  - Currently cart exists only in frontend state; backend cart persistence is planned for next release  

---

## Bug Fixes
- None

---

## Non-Functional Requirements
- Passwords must be hashed using bcrypt before being stored in the PostgreSQL database  
- Page loads for primary routes should occur in under 2 seconds  
- Registration and login forms must show clear error messages for missing or invalid inputs  
- The app should not crash on invalid inputs or empty requests  

---

## Dependencies and Limitations
- Limited feature set since this is the first sprint  

---

## Additional Organizational Details (Optional)

These sections are typically included in an organizational release plan. You are not required to complete them for your term project, but here's how they might look:

### Detailed Instruction - Steps to Carry Out the Deployment
- Merge the `develop` branch into the `main` branch  
- Deploy the backend server (Node.js + Express) and frontend (React) to their respective environments  
- Verify successful deployment through manual and automated health checks (e.g., `/ping` endpoint, successful page loads)  

### PIV (Post Implementation Verification) Instruction
- Use Postman or the frontend UI to test user registration and login  
- Check PostgreSQL database to confirm correct users table entry  
- Confirm JWT tokens are returned and valid  
- Ensure the UI components render and behave properly  

### Post Deployment Monitoring
- Monitor server logs for API errors or crashes  
- Check PostgreSQL for any inconsistent data entries  
- Track frontend issues using browser dev tools and user feedback  
- Watch console output for failed fetch requests or CORS problems  

### Roll Back Strategy
- If deployment introduces breaking changes, revert to the previous stable commit on `main`  
- Temporarily disable login/register functionality by disabling API endpoints or hiding the form  
- Backup and restore PostgreSQL database if any corrupt data is found  
- Use Git branches to isolate hotfixes and redeploy once issues are patched  
