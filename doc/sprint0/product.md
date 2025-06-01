# Product: My Dorm Store Website Optimization

## 1. Product Overview  
My Dorm Store is an e-commerce platform offering custom care packages and move-in kits to college students (and their families) across Canada. Through a streamlined web experience, students can select and bundle essentials tailored to their dorm specifications. Currently, compatibility checking, inventory management, and shipping rate calculations all require manual intervention, presenting key opportunities for optimization.

## 2. Target Users  
- **Primary:**  
  - First-year and returning post-secondary students in Canada (incl. international students)  
  - Tech-savvy, mobile-first shoppers  
- **Secondary:**  
  - Parents ordering on behalf of students  
  - Campus residence staff coordinating bulk orders

## 3. Market Sizing Analysis
- **TAM (Total Addressable Market):** ≈ 2.2 million Canadian post-secondary students. ~470,000 international students. (Statistics Canada, Postsecondary Enrolments, 2022/2023)  
- **SAM (Serviceable Addressable Market):** Focus on Ontario & British Columbia: 940,722 in Ontario + 286,071 in BC ≈ 1.227 million.  ~326,000 international students. (Statistics Canada, Postsecondary Enrolments by Province, 2022/2023)
- **Assumed Adoption:** 10% of SAM actively purchase move-in kits → ~118,700 potential customers  
- **SOM (Serviceable Obtainable Market):** Year 1 goal: 5% of SAM → ~5,935 users  

## 4. User Research Insights  
1. **Traffic & Seasonality:**  
   - Founder-reported: ~7,000 unique visits in August 2024 (move-in peak).  
   - Estimated off-peak: ~2,000 unique visits per month (Feb–May, Sep–Dec) based on the service’s heavy seasonality (assumption).  
   - Estimated secondary peak: ~3,500 unique visits in January for winter break shipments (assumption).  
2. **Data Collection & Manual Work:**  
   - Dorm & school info stored in an external spreadsheet; each order requires manual verification  
   - Staff must cross-check dorm address → slowdowns and occasional errors  
3. **Checkout Friction:**  
   - No persistent dorm profile → students re-enter details each session  
   - Bundledasd products not recognized by Shopify inventory → manual inventory adjustments  
4. **Feature Wish List (from initial meetings):**  
   - “A checklist so I don’t forget any dorm essentials.”  
   - “Calendar popup to pick my move-in date and get correct shipping rates.” 
   - “A dorm visualizer to confirm mattress size and compatible items.”  

## 5. Feature Prioritization Rationale  
- **Priority 1 (Must Have):** Eliminate the biggest manual bottlenecks and checkout pain points to reduce errors and support high-traffic peaks.  
- **Priority 2 (Should Have):** Enhance user engagement and smooth “next best step” flows that boost order completeness and reduce abandoned carts.  
- **Priority 3 (Nice to Have):** Add delightful, differentiated features that drive word-of-mouth and future upsells.

---

## 6. Features by Priority

### Priority 1: Must Have  
- **Residence-Based Cart Validation**  
  Notify the student when an item in their cart doesn’t fit their assigned residence (mattress size, approved products, etc.), displaying a clear on-screen message and suggesting the correct size or an approved alternative without automatically removing the item.  
  **Completion Criteria:**  
  - Dorm data input is available and accepted.  
  - UI validation accurately checks item compatibility.  
  - Notification prompts display correct alternative suggestions.  

- **Requirements & Recommendations Checklist**  
  Display a live checklist of “Required” and “Recommended” items for the selected residence. Highlight which essentials are already in the cart (✓) and which are missing (✗), allowing the student to add missing items with one click.  
  **Completion Criteria:**  
  - Checklist loads accurate required and recommended items for each dorm.  
  - Cart matching highlights existing items (✓) and missing items (✗) correctly.  
  - Clicking missing items adds them to the cart successfully.  

- **Step-by-Step, User-Friendly Checkout Flow**  
  Break checkout into clear, sequential steps (e.g., “Residence Info → Cart Validation → Shipping → Payment”) with a progress indicator (e.g., “Step 2 of 4”) so the user always knows where they are in the process.  
  **Completion Criteria:**  
  - All checkout stages display in correct order.  
  - Progress indicator updates accurately at each step.  
  - Data persists when navigating between steps (e.g., hitting “Back”).  

- **On-the-Fly Shipping Calculator (Calendar Popup)**  
  Present a small calendar widget for selecting the student’s move-in date. Immediately recalculate and display shipping cost once the move-in date and residence address are chosen.  
  **Completion Criteria:**  
  - Calendar popup displays without errors.  
  - Selecting a move-in date triggers a backend calculation.  
  - Shipping cost updates and displays accurately based on date and address.  

- **Persistent Residence Profile**  
  Save the student’s school, dorm building, room number, and move-in date in their account profile so these details auto-populate on subsequent visits and avoid repeated data entry.  
  **Completion Criteria:**  
  - Student can save residence profile successfully.  
  - Auto-population of profile fields works on repeat visits.  
  - Profile updates persist across sessions.  

### Priority 2: Should Have  
- **Backend Process Automation**  
  Tailored code modules to eliminate manual intervention in compatibility checks, inventory updates, and shipping calculations.  
  **Completion Criteria:**  
  - Code modules trigger compatibility, inventory, and shipping checks automatically when cart or profile changes.  
  - Automated jobs run successfully without manual intervention, verified by integration tests.  
  - Error logging and retry mechanisms exist for failed automation tasks.  

- **High-Traffic Performance Optimization**  
  Code and infrastructure tweaks to ensure smooth load handling during August and January peaks.  
  **Completion Criteria:**  
  - Load-testing results show 95% of checkout page requests complete under 2 seconds with simulated peak traffic.  
  - Caching strategies and optimized queries reduce database response times by at least 50% compared to baseline.  
  - Monitoring dashboard displays CPU, memory, and response-time metrics during peak load.  

- **Modular MVP Code Architecture**  
  Develop a minimum viable product of optimized custom code that can be iterated on and integrated with the existing Shopify setup or a new site.  
  **Completion Criteria:**  
  - Codebase is organized into distinct modules (cart-logic, compatibility, shipping) with clear interfaces.  
  - Each module has unit tests with at least 80% coverage on critical functions.  
  - Successful integration of modules into a staging environment replicating production flows.  

### Priority 3: Nice to Have  
- **Real-Time Loading Indicators**  
  Visual feedback (spinners, progress bars) during backend calls to reassure users.  
  **Completion Criteria:**  
  - Loading indicator displays within 500ms when a backend call is initiated.  
  - Indicator disappears and shows updated data upon successful response.  
  - Error state displays a retry option if the call fails.  

- **User-Centered Analytics Dashboard**  
  Insights into checkout drop‑off, feature usage, and residence‑specific error rates.  
  **Completion Criteria:**  
  - Dashboard loads within 2 seconds and displays accurate metrics for checkout funnel and error counts.  
  - Filtering by residence or date range updates metrics correctly in under 1 second.  
  - Alerts trigger when drop-off rates or error rates exceed set thresholds.  

- **Themed Checkout Experiences**  
  Customizable UI skins that reflect school colors or program branding for enhanced engagement.  
  **Completion Criteria:**  
  - Selection of a school applies the correct color scheme and logo to the checkout UI.  
  - “Use Default Theme” resets UI to the standard theme without residual styling.  
  - New school themes added to the system display correctly after deployment.  




### Competitive Analysis

**IKEA Canada**  
Offers affordable, in-store “College Starter” kits and dorm furniture, but only during August–September. Lacks real-time dorm compatibility checks and an online flow that adjusts bundles or shipping based on a student’s assigned residence.

**Dormify (Pottery Barn Dorm)**  
Focuses on stylish bedding, décor, and visual tools (bed visualizer, packing checklists) but does not provide complete move-in kits or automate compatibility and shipping. Its standalone e-commerce presence is limited during the transition to Pottery Barn Dorm.

**My Dorm Store**  
Delivers year-round, online move-in kits with real-time, residence-based cart validation and a live essentials checklist. Automates compatibility, inventory, and shipping in the backend, and offers a step-by-step checkout with saved residence profiles and instant shipping calculations. Peak-traffic optimizations ensure fast load times in August and January, filling gaps left by IKEA’s seasonal bundles and Dormify’s décor focus.

**Summary**  
- **IKEA** offers affordable, in-store bundled kits but lacks automated dorm compatibility and online availability outside August–September.  
- **Dormify** provides design-focused bedding and decor tools but does not deliver complete move-in kits or backend automation, and its e-commerce presence is limited.  
- **My Dorm Store** fills these gaps with real-time dorm-specific cart validation, a dynamic checkout experience, automated backend processes, and peak-traffic optimization, positioning it as the most comprehensive online solution for Canadian post-secondary students.  




Citation:

1. Statistics Canada. (2024, November 20). Canadian postsecondary enrolments and graduates, 2022/2023. https://www150.statcan.gc.ca/n1/daily-quotidien/241120/dq241120b-eng.htm

2. Statistics Canada. (2024, November 20). Table 37-10-0018-01: Postsecondary enrolments, by registration status, institution type, status of student in Canada and gender. https://doi.org/10.25318/3710001801-eng


