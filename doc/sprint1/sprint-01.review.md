# term-group-project-c01s25-project-my-dormstore

 > _Note:_ This document is meant to be written during (or shortly after) your review meeting, which should happen fairly close to the due date.      
 >      
 > _Suggestion:_ Have your review meeting a day or two before the due date. This way you will have some time to go over (and edit) this document, and all team members should have a chance to make their contribution.


## Iteration 01 - Review & Retrospect

 * When: June 15, 2025
 * Where: Online (Discord)

## Process - Reflection

(Optional) Short introduction

#### Decisions that turned out well

List process-related (i.e. team organization) decisions that, in retrospect, turned out to be successful.


 * 2 - 4 decisions.
 * Ordered from most to least important.
 * Explain why (i.e. give a supporting argument) you consider a decision to be successful.
 * Feel free to refer/link to process artifact(s).

#### Decisions that did not turn out as well as we hoped

1. **Insufficient time allocated for resolving merge conflicts**  
Several merge conflicts occurred toward the end of the sprint due to overlapping work and last-minute merges, slowing integration.

2. **Delayed planning of cart state management**  
We didn’t allocate enough time for planning how to manage cart state globally, resulting in inconsistent or conflicting cart behavior.

#### Planned changes

1. **Improve merge coordination and PR timing**  
We'll implement a stricter PR deadline (e.g., no merges 24 hrs before sprint deadline) to allow time for reviews and conflict resolution.

2. **

## Product - Review

#### Goals and/or tasks that were met/completed:

- **User Authentication**  

  Implemented and tested login/register functionality using JWT for authentication. `/me` endpoint confirms session handling.

  ![register](./images/Login.png)

  ![login](./images/Register.png)

  #### mydormstore user database

  ![login](./images/database.png)

- **Frontend Framework Setup**  

  Core UI structure built using React. Layout is responsive and reusable components like `TopBar`, `NavBar`, and `Footer` are functioning.

  ![Home](./images/Home.png)

  ![ourStory](./images/ourStory.png)


  #### Our Story
  
  Users can find a page to read the user story
  
  ![ourStory](./images/ourStory.png)


  #### Blog Page

  Users can find a path/blog to read some of the blogs of mydormstore

  ![blog](./images/blog.png)


  #### Ambassador Page

  Users can find a path/ambassador to find the form to fill in to join the ambassador program

  ![ambassador](./images/ambassador.png)

- **Basic Cart Functionality**  

  Users can add and remove items from the cart. Cart state is managed using context.

  ![cart](./images/Cart.png)

  ![Cartaddandremove](./images/cartAddandRremove.png)


#### Goals and/or tasks that were planned but not met/completed:

**Check-out Page**  

We planned to implement the user check-out page during this sprint, but it was delayed due to merge conflicts when integrating into the `develop` branch. Although we attempted to address it, we didn’t have enough time to finish and test it properly. Completing this feature will be a priority in the next sprint.

**Join Ambassador Backend**

We realized this was something we might want to implement near the end of Sprint 1. Since there wasn’t enough time, we’ve decided to move it to Sprint 2.


## Meeting Highlights

Going into the next iteration, our main insights are:


- **Prioritize early integration to reduce merge conflicts**  
  Waiting until the final days to merge major branches created avoidable conflicts. Next sprint we’ll encourage smaller, more frequent merges into `develop`.

- **Establish shared understanding of global state early**  
  Misalignment on cart state management delayed progress. We’ll begin the sprint with a brief planning session to define our state structure and ownership.

- **Time-box individual features more strictly**  
  Several tasks exceeded their estimates and disrupted overall sprint pacing. We’ll scope work more realistically and trim scope if necessary to finish on time.

- **Maintain daily check-ins plus a mid-sprint sync**  
  Daily stand-ups kept communication flowing; adding a mid-sprint sync will help us realign priorities and surface blockers earlier.


