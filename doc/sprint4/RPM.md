# Release Plan

### Release Name: Sprint 4

----------------

## Release Objectives

Sprint 4 is the final sprint of the project and focuses on closing all remaining bugs, finalizing core functionality, and stabilizing both the user and admin experience. The goal is to ensure a polished, reliable dorm shopping platform with fully working cart, order, checklist, and package logic before handoff or presentation.


### Specific Goals

- Resolve major bugs related to cart, order, and inventory accuracy
- Finalize admin functionality and content editing
- Guarantee stable behavior for order tracking, checklist updates, and package integration
- Lock in backend logic and fix display issues across all key pages

### Metrics for Measurements

- All packages and products can be added to cart without error
- Cart reflects inventory and selections accurately
- Bedding checklist updates accurately on size selection
- Products and packages can be reliably added to cart and categorized
- Admin dashboard allows live editing of descriptions
- Shipping cost is correctly shown during order review
- Inventory counts reflect real-time availability after cart or order updates

## Release Scope

### Included Features

- [SCRUM-49] Fix: Shipping cost missing from review page
- [SCRUM-50] UI: Letter suggestions appear under product listings
- [SCRUM-51] Admin can edit product descriptions directly
- [SCRUM-52] Fix: Package items now visible within orders
- [SCRUM-53] Fix: Checklist now marks items as checked when size is selected
- [SCRUM-54] Fix: Products and packages can now be reliably added to cart
- [SCRUM-55] Fix: Added products/packages now show in their category views
- [SCRUM-56] Fix: Inventory logic now properly calculates package stock based on included product quantities


### Excluded Features

- Mobile optimization: Layout currently desktop-only

---

## Bug Fixes

Sprint 4 prioritized resolving critical bugs affecting user checkout, package handling, admin controls, and inventory accuracy. These fixes ensure a smooth, complete dorm shopping experience before final delivery.

---

## Non-Functional Requirements
- All major interactions (cart, checkout, order tracking) should respond within 2 seconds

---

## Dependencies and Limitations

- Depends on correct dorm profile data and cart-item mapping
- Package inventory calculation relies on updated package_items table
- All cart/order features assume valid session or guest order handling

---

## Deployment Considerations (Optional)

- Deployment: Merge develop to main and deploy to Render + Netlify
- Verification: QA testing of all 3 new major features with sample data
- Monitoring: Console logs and DB records will be manually monitored for now
- Rollback Strategy: Revert main branch to Sprint 2 commit tag and hide Sprint 3 UI with conditional rendering

