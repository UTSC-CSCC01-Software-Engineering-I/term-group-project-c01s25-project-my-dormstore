# Release Plan

### Release Name: Sprint 3

----------------

## Release Objectives

Sprint 3 aims to elevate the overall dorm shopping experience by expanding upon personalization, enhancing order transparency, and supporting better user engagement post-checkout. Key features include an auto-updating dorm checklist tied to cart activity, a purchase history view for users, and a streamlined order tracking interface using order number and email. These enhancements ensure the system is more intelligent, informative, and user-centric.

### Specific Goals

- Make dorm checklist live and automatically check off items added to cart
- Provide students with a history of their past purchases via the Profile page
- Enable users to track their order using order number and email
- Improve cart functionality with backend sync for better accuracy
- Lay groundwork for unit testing on key backend and frontend logic
- Enable admin to manage the website

### Metrics for Measurements

- Dorm Checklist Auto-Check
  - Items already added to cart are automatically marked as checked on checklist  - Submitted profile data (first name, school, dorm) is saved and shown correctly on the Profile page.
  - Checklist state reflects cart contents without manual interaction
- Purchase History
  - Purchase history tab available on Profile page
  - Displays item names, order numbers, timestamps, and total spent
- Order Tracking via Order # and Email
  - Users can input order ID and email on a form and be directed to a live status page
  - Displays status bar, order details, and estimated delivery

## Release Scope

### Included Features

- **Live Dorm Checklist Integration**
  - Checklist automatically reflects cart updates, reducing user manual tracking
- **Purchase History**
  - Users can view all past purchases and order details in one place
- **Track Order by Email and Order ID**
  - Streamlined order tracking UI accessible without login
  - Order progress visually displayed
- **Admin Dashboard**
  - Administrators can manage the orders,products,user and ambassadors from this page.
  - Display general revneu and orders management.

### Excluded Features

- **Mobile responsiveness**
  - Current layout is optimized for desktop use only.
  - Mobile support will be addressed in a future UI/UX sprint.
  
---

## Bug Fixes
- Cart images not rendering correctly in some contexts

---

## Non-Functional Requirements
- All responses to form submissions and cart actions must occur within 2 seconds.

---

## Dependencies and Limitations

- Relies on completed personalization form and checklist data from Sprint 2  
- Assumes cart and orders are correctly stored in database  
- Requires logged-in session for profile purchase history

---

## Deployment Considerations (Optional)

- Deployment: Merge develop to main and deploy to Render + Netlify
- Verification: QA testing of all 3 new major features with sample data
- Monitoring: Console logs and DB records will be manually monitored for now
- Rollback Strategy: Revert main branch to Sprint 2 commit tag and hide Sprint 3 UI with conditional rendering

