# term-group-project-c01s25-project-my-dormstore

 > _Note:_ This document is meant to be written during (or shortly after) your review meeting, which should happen fairly close to the due date.      
 >      
 > _Suggestion:_ Have your review meeting a day or two before the due date. This way you will have some time to go over (and edit) this document, and all team members should have a chance to make their contribution.


## Iteration 2 - Review & Retrospect

 * When: July 8th, 2025
 * Where: Online (Discord)

## Process - Reflection

Throughout Sprint 2, our team made noticeable progress in communication, task delegation, and feature delivery compared to the first sprint. We collaborated more actively during development, and most members were consistent in providing updates and pushing changes on GitHub. Starting with a clear task breakdown helped us stay on track, and mid-sprint check-ins kept priorities aligned.

However, we did face some challenges. One team member became unresponsive partway through the sprint, which created uncertainty and required the remaining members to redistribute tasks with limited notice. Additionally, some technical misalignments, such as inconsistent state management and delayed merges, caused friction during integration. Moving forward, we aim to establish better early sprint alignment and develop a plan for how to handle team inactivity or unplanned absences more effectively.

#### Decisions that turned out well

- **Component-based front-end development**
In Sprint 2, we decided to complete both the backend and frontend functionalities, ensuring that all features, including buttons across the website work properly. This full integration approach allowed us to deliver a more complete and interactive user experience while maintaining a consistent and scalable front-end structure.

- **Combining virtual and in-person meetings**  
We continued to hold a mix of virtual and in-person meetings. This hybrid approach gave us flexibility while maintaining strong productivity. In-person sessions were particularly effective for debugging and integration, while virtual stand-ups ensured consistent coordination.

- **Prioritize early integration to reduce merge conflicts**  
We successfully completed all tasks except those assigned to the missing group member. We merged all remaining work, committed the final functionalities to GitHub, and delivered a complete demo presentation.



#### Decisions that did not turn out as well as we hoped

- **Delayed planning of cart checkout**  

  We are still in the process of determining the best approach for implementing the card checkout functionality, which has led to some inconsistencies and conflicts in cart behavior.


#### Planned changes

- **Improve merge coordination and PR timing**
  
  Although our merging process went smoothly this time, we plan to implement a stricter pull request (PR) deadline, such as no merges within 24 hours of the sprint deadline to allow sufficient time for code reviews and conflict resolution.

- **Clear Task Ownership and Prioritization**

  Each task will have a designated owner and a priority label (e.g., High, Medium, Low) to improve accountability and help the team focus on the most   critical items first.

## Product - Review

#### Goals and/or tasks that were met/completed:

- **Developed and integrated the Personalization Form**

![profile](./images/profile.png)

![userform](./images/userForm.png)

- **Implemented the Interactive Checklist**

![checklist](./images/checklist.png)


- **Built the Profile and Account Settings Pages**

![accountSetting](./images/accountSetting.png)

- **Connected the backend of the ambassador's program with the frontend**

![ambassador](./images/ambassador.png)

![ambassador-db](./images/ambassador-db.png)

- **Built both the frontend and backend of the contactus page**

![contactus](./images/contact-us.png)

![contactus](./images/contact-db.png)




#### Goals and/or tasks that were planned but not met/completed:

- **Admin Dashboard**

  Initially planned to create a dashboard for administrators to view user form submissions and track order data, but was deprioritized due to time      constraints and focus on user-facing features.

- **Payment Processing Integration**

  Planned to begin integration with a payment gateway; however, this was postponed to a future sprint to prioritize checklist personalization,   account management, and order tracking.

- **Mobile Responsiveness Improvements**

  While some UI components were tested on smaller screens, full mobile optimization was not completed and will be addressed in a future design- 
  focused sprint.

## Meeting Highlights

Going into the next iteration, our main insights are:

- **Integrate early and often to avoid merge conflicts**  
  Delaying major merges until the end of the sprint caused unnecessary conflicts and debugging overhead. In the next sprint, we’ll adopt a strategy of frequent, smaller merges into the develop branch to maintain stability.

- **Align on global state structure from the start**  
  Miscommunication around cart and form state management led to redundant work and integration issues. We'll start the sprint with a shared review of state ownership, naming conventions, and where data should live (e.g., context, localStorage, backend).

- **Time-box tasks and manage scope more proactively**  
  Some features (like compatibility rechecking and checklist filtering) took longer than expected and affected our sprint pacing. Next sprint, we’ll apply stricter time-boxing and be more willing to reduce scope if necessary to complete work on time.




