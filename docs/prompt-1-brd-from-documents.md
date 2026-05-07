# Prompt 1: Prepare a BRD from Project Documents

> Use this prompt when you receive raw project inputs (charity brief, stakeholder notes, spreadsheets, screenshots) and need to produce a structured Business Requirements Document before any development starts.

---

## PROMPT START

You are a Business Analyst. I'm going to share documents about a charity project. Read everything and produce a **Business Requirements Document (BRD)** that a development team can use to build the solution.

### What I'll provide:
- A project brief / challenge document from the charity partner
- Any existing spreadsheets, screenshots, or links to the current system
- Notes from stakeholder conversations

### What I need you to produce:

**1. Executive Summary**
- Who is the charity, what do they do, who do they serve
- One-paragraph summary of what we're building and why

**2. Problem Statement**
- What is the current process and why is it failing
- Who is burdened and how (quantify if possible)
- What happens if nothing changes

**3. Stakeholders & Users**
- List every stakeholder with their role and involvement level
- Define each end-user persona (e.g., young person, parent, centre staff, admin)
- For each persona: what they need to do, how often, on what device

**4. Functional Requirements**
Organize by domain. For each feature area, list:
- User stories in the format "As a [persona], I want to [action] so that [benefit]"
- Acceptance criteria for each story
- Priority (Must / Should / Could / Won't for MVP)

Cover these domains (adapt based on the documents):
- Authentication & user management
- Player-facing features (dashboards, progress tracking, badges, modules, tournaments, stats, notifications)
- Admin-facing features (data management, reporting, content management, imports)
- Any data migration needs from legacy systems

**5. Badge / Gamification System**
- Define the badge hierarchy (main badges → sub-badges → XP model)
- Define level thresholds and progression rules
- Define how badges connect to learning modules and activities
- List all badge names, categories, and point values from the source data

**6. Data Model (Conceptual)**
- List all entities and their key attributes
- Describe relationships between entities
- Identify what data exists today (spreadsheets) vs. what's new

**7. Non-Functional Requirements**
- Accessibility (target audience includes young people and parents)
- Device support (mobile-first? PWA?)
- Performance expectations
- Security (age-appropriate, data protection)
- Hosting / budget constraints
- Scalability needs (e.g., rolling out to other centres)

**8. Constraints & Risks**
- Budget limitations
- Single staff member availability
- Technical literacy of admin users
- Timeline pressures
- Dependencies on external systems

**9. Out of Scope**
- What we are explicitly NOT building in this phase

**10. Success Metrics**
- How do we measure if this project worked
- Quantitative targets (e.g., admin time reduction)
- Qualitative targets (e.g., young people and parents find it easy to use)

### Rules:
- Extract everything from the documents I provide — don't invent requirements that aren't supported by the source material
- Flag any gaps or ambiguities as "NEEDS CLARIFICATION" with a suggested question to ask the stakeholder
- Use plain language — this document will be shared with non-technical charity staff for sign-off
- Keep user stories atomic — one action per story
- Prioritize ruthlessly for MVP — the charity has limited budget and one staff member

---

## Here are the project documents:

[PASTE YOUR DOCUMENTS BELOW]

## PROMPT END
