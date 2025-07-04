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

- % of users who complete onboarding form after first login.  
- % decrease in item mismatch errors after compatibility checks.  
- Checkout abandonment rate before vs. after streamlined UI.  
- Response time and accuracy of order tracking.  
- Positive user feedback from UAT sessions or surveys.

----------------

## Release Scope

### Included Features

- **Personalization Form**  
- **Item Compatibility**  
- **Order Tracking**  
- **Interactive Checklist**  
- **Streamlined Checkout**

### Excluded Features

- **Payment processing integration**  
- **Mobile responsiveness**  
- **Admin dashboard for tracking user submissions**

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

