# Release Plan

### Release Name: Sprint 2

----------------

## Release Objectives

This release focuses on refining and expanding the dorm shopping experience for students. The goal is to improve item compatibility, streamline the checkout process, and enable order tracking, thereby increasing overall usability and satisfaction.

### Specific Goals

- Enable compatibility checks between cart items and student dorm profile  
- Implement an order tracking feature accessible to students.  
- Allow students and guests to save and revisit their carts  
- Introduce a personalized onboarding form to tailor recommendations  
- Improve the checkout process with a clear UI and progress indicators  
- Provide an interactive checklist of required and recommended items 

### Metrics for Measurements

- Personalization & Profile Form
  - Users are prompted with the form only on their first login.
  - Submitted profile data (first name, school, dorm) is saved and shown correctly on the Profile page.
  - Profile info (school & dorm) is used to generate personalized checklist content.
- Interactive Checklist
  - Checklist updates dynamically based on the selected dorm.
  - Personalized greeting is rendered using user’s first name.
- Account Settings (Email & Password)
  - Email and password fields are displayed with an option to edit.
  - Email updates are reflected immediately after submission.
  - Password changes are securely hashed and stored in the database.
- Save Cart for Later
  - Logged-in students can leave and return to find their cart items unchanged.
  - Guest users can add items to cart and see them persist across page reloads.
- Cart Item Compatibility
- Checkout Page UI
- Streamlined Checkout Experience



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

- **Personalization Form**
  - Students fill out school and dorm information upon first login to receive tailored recommendations.
  - Enhances user experience by customizing the checklist and product display.
- **Interactive Checklist**
  - Provides a categorized list of required and recommended items per dorm.
  - Helps students ensure they don’t miss essential supplies.
  - Dynamically adjusts based on selected dorm.
- **Account Settings Management**
  - Users can view and edit their email and password from the profile
  - Ensures users can maintain secure and up-to-date contact information.
- **Save Cart for Later**
  - Enables guest users to save their carts and students to check out later.
- **Order Tracking**
  - Students can enter their order number and email/phone to view order status.
- **Streamlined Checkout**
  - Simplified UI with clear progress indicators for checkout steps.
- **Item Compatibility**
  - The cart automatically checks if selected items match the student’s dorm requirements.
  - Notifies students when an item is incompatible and suggests alternatives.
  - Re-evaluates compatibility when the dorm profile is updated

### Excluded Features

- **Payment processing integration**
  - Deferred due to security concerns and scope limitations.
  - Will be considered in future sprints after user authentication is fully stable.
- **Mobile responsiveness**
  - Current layout is optimized for desktop use only.
  - Mobile support will be addressed in a future UI/UX sprint.
- **Admin dashboard for tracking user submissions**
  - Out of scope for Sprint 2 due to time constraints.
  - Future plans include a dashboard to review form responses and order data.

----------------

## Bug Fixes

- 

----------------

## Non-Functional Requirements

- All responses to form submissions and cart actions must occur within 2 seconds.

----------------

## Dependencies and Limitations

- Requires authentication system from Sprint 1 to be fully functional.  
- Dorm item compatibility relies on accurate dorm requirement datasets.  
- Form submission depends on session token availability.

----------------

## Deployment Considerations (Optional)

- **Deployment Steps:** Use GitHub Actions to merge `develop` into `main`, then deploy to Render/Netlify.

- **Post-Implementation Verification:** Manually test all 10 sprint features using test cases from QA sheet.

- **Monitoring:** Use Google Analytics and logs to monitor feature usage and errors.

- **Rollback Strategy:** Revert to Sprint 1 stable build and remove new feature flags.

