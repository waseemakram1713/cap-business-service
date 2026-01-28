# CAP Business Service: Advanced Domain Modeling

## 1️⃣ Purpose of This Repository
This repository demonstrates a production-oriented **SAP CAP (Cloud Application Programming Model)** business service designed for **SAP BTP**.

The goal is to showcase the ability to:
* **Design business-domain-driven CAP services** using Core Data Services (CDS).
* **Implement draft-enabled entities** to support high-end SAP Fiori UX patterns.
* **Enforce business validations and actions** through custom server-side logic.
* **Apply enterprise-grade authorization** using XSUAA and role-based access control.
* **Build backend services** exactly as they are architected in real-world SAP projects.

> [!IMPORTANT]
> This repository intentionally focuses on **backend service design**, independent of any specific SAP backend system, to demonstrate core architecture principles.

---

## 2️⃣ Business Scenario

### Business Context
Organizations often require a centralized service to manage **Customer Onboarding Requests** before customers are created in core ERP systems. The onboarding process must:

* **Support draft-based data entry:** Allow users to save partial progress without triggering final validations.
* **Enforce business validations:** Ensure data integrity (e.g., region-specific requirements) before finalization.
* **Allow controlled submission for review:** Transition the record through a formal lifecycle.
* **Be securely exposed:** Provide a hardened API for UI (Fiori) and integration consumers.

### Scope of This Service
* **Manage customer onboarding requests** through a managed lifecycle.
* **Validate business rules** (e.g., mandatory fields based on geographic context).
* **Control state transitions** via custom actions (`SubmitForReview`).
* **Provide a reusable backend** for Fiori apps, SAP Build Process Automation, or external integrations.

---

## 3️⃣ Domain Model Design
The data model is intentionally business-focused and minimal, adhering to **Domain-Driven Design (DDD)** principles.

### Key Design Principles:
* **No technical fields exposed unnecessarily:** Internal IDs and administrative data are handled via built-in aspects to keep the API clean.
* **Clear ownership of data:** The service owns the lifecycle of the `CustomerOnboarding` entity from draft to submission.
* **Extensibility:** The schema is designed using standard CAP components, making it ready for future extensions (e.g., adding attachments or comments) without breaking existing consumers.

### Example Entity: `CustomerOnboarding`
* **Purpose:** Represents a single, unique onboarding request.
* **Lifecycle:** Owns its own state and validation rules, independent of the final ERP customer record.
* **Implementation:** Uses `cuid` for global uniqueness and `managed` for automated audit trails (`createdAt`, `createdBy`).

> [!NOTE]
> This model avoids premature optimization and mirrors how SAP CAP services are typically designed in high-stakes customer projects to ensure maintainability.

## 4️⃣ Draft Handling (SAP Fiori–Ready)
The core entity is draft-enabled using CAP’s native OData draft mechanism (`@odata.draft.enabled`). 

### Why this matters:
* **Fiori-Native Experience:** Modern SAP Fiori applications rely heavily on drafts to manage "in-progress" work.
* **Safe Staging:** Users can save incomplete or "dirty" data safely without violating database constraints or triggering final business logic.
* **Optimistic Locking:** Drafts provide a robust way to handle concurrent edits in a stateless web environment.
* **Lifecycle Validation:** Business validations are intelligently deferred until the "Activation" (Save) step, providing a smoother user journey.



By implementing Drafts at the service layer, this backend is **immediately compatible** with SAP Fiori Elements templates (like the List Report or Object Page) without requiring any additional "glue" code.

## 5️⃣ Service Design & Business Actions
The service is designed to be more than a simple database entry point. It exposes a structured API that includes:

* **Standard CRUD operations** for managing the lifecycle of onboarding requests.
* **Custom Business Action:** `SubmitForReview` to handle state transitions.

### Why a Custom Action?
Instead of simply updating a status field via a generic `PATCH` request, using an explicit action ensures:
* **Explicit Business Intent:** The API clearly states "What" is happening (a submission), not just "How" the data changes.
* **Clean Semantics:** Avoids overloading standard CRUD operations with complex side effects.
* **Architecture Alignment:** Matches **SAP’s recommended CAP design patterns** for enterprise applications.

### Action Logic & Protection
The `SubmitForReview` action is implemented with a custom handler that:
1. **Validates State:** Ensures the request exists and isn't already in a `SUBMITTED` status.
2. **Transactional Integrity:** Updates the onboarding status within a single transaction to prevent data inconsistency.
3. **Transition Control:** Acts as a gatekeeper, preventing invalid state transitions (e.g., submitting an empty or already-finalized request).

## 6️⃣ Business Validation Strategy
Data integrity is maintained through a robust validation strategy enforced at the service layer using **CAP Lifecycle Hooks** (`this.before`).

### Key Validation Examples:
* **Contextual Requirements:** Implemented logic to ensure that customers from specific regions (e.g., **Germany/DE**) must provide a valid email address before activation.
* **State Protection:** Prevents the submission of duplicate requests or the modification of records already finalized in the workflow.

### Architectural Principle:
> **"Business rules live in the service, not in the UI."**

By centralizing validation in the backend, we ensure:
1. **Consistency:** All consumers (Fiori apps, Mobile clients, or API integrations) are subject to the same rules.
2. **Security:** Validation cannot be bypassed by manipulating the frontend or calling the API directly.
3. **Maintainability:** Rules are updated in one location rather than across multiple UI components.

## 7️⃣ Authorization Model
Security is not an afterthought; it is baked into the service definition using **SAP BTP XSUAA** and CAP-native annotations.

### Design Approach:
* **XSUAA Integration:** Roles and scopes are formally defined in `xs-security.json`, ensuring the service is ready for SAP BTP deployment.
* **Declarative Security:** Uses `@requires` annotations in the CDS service definition to protect boundaries without polluting the business logic with security code.
* **Granular Control:** Actions (which modify state) carry stricter authorization requirements than simple read-only queries.

### Enterprise Roles:
| Role | Access Level | Business Purpose |
| :--- | :--- | :--- |
| **OnboardingViewer** | Read-Only | Designed for auditors or observers who need to track request status. |
| **OnboardingAdmin** | Full Access + Actions | Designed for processors authorized to validate and `SubmitForReview`. |


This implementation reflects **real-world SAP project authorization models**, moving beyond simplified demos to show a hardened, production-ready security posture.

## 8️⃣ Production Readiness Considerations
This service is architected with a "Production-First" mindset, ensuring reliability, maintainability, and security in an enterprise landscape.

### Architectural Strengths:
* **Separation of Concerns:** Clear boundaries between data persistence (`db/`), service exposure (`srv/`), and security configuration.
* **Transaction Safety:** Business actions are wrapped in managed transactions to prevent "half-baked" data updates.
* **Meaningful API Feedback:** Implements standardized OData error handling, providing consumers with actionable messages rather than generic failures.
* **Environment Agnostic:** Zero hardcoded URLs or credentials; the service is designed to consume configuration via BTP Service Bindings.
* **Consistent Security:** Protection is applied at the service entry point, ensuring no "backdoors" exist in the business logic.

### 📈 Future-Proofing & Extensibility
While intentionally focused on core principles, this architecture is a "plug-and-play" foundation ready for:
1. **SAP Build Process Automation:** Using the `SubmitForReview` action to trigger a global workflow.
2. **Event-Driven Architecture:** Emitting messages to **SAP Event Mesh** when an onboarding request is finalized.
3. **S/4HANA Connectivity:** Extending the model to fetch live vendor or material data from a core ERP.

## 9️⃣ Target Use Cases
This CAP business service is designed as a modular "building block" within the SAP BTP ecosystem. It is optimized for the following scenarios:

* **Backend for SAP Fiori Applications:** Fully compatible with Fiori Elements (List Report/Object Page) thanks to native Draft support and OData V4 exposure.
* **Input Service for SAP Build Process Automation:** The `SubmitForReview` action can act as a trigger for a low-code/no-code workflow, passing the validated request to a manager for approval.
* **Source System for Integration Scenarios:** Provides a clean, secured API for **SAP Integration Suite** to fetch data and push it into a core ERP like S/4HANA or SuccessFactors.
* **Standalone Business Service on SAP BTP:** Operates as a resilient microservice capable of managing its own data lifecycle independent of a larger monolith.

## 🔟 What This Repository Demonstrates
This project serves as a technical portfolio piece proving the ability to:

* **Design CAP services like an SAP Consultant:** Moving beyond technical tutorials to build solutions that address real business requirements and lifecycle constraints.
* **Use Advanced CAP Features Correctly:** Mastery of complex features like OData V4 Drafts, managed aspects, and custom action handlers.
* **Model Business Behavior, Not Just Persistence:** A focus on "Intent-Driven" design where the API reflects the business process (onboarding, validation, submission) rather than just table updates.
* **Build Services Ready for Real Enterprise Usage:** Ensuring that security (XSUAA), scalability, and data integrity are fundamental parts of the design, not afterthoughts.

---

---
## 11️⃣ Disclaimer
This project is intended for **portfolio and architectural demonstration purposes** and does not represent a complete, production-ready customer solution. It is designed to showcase specific technical patterns and best practices within the SAP CAP framework.

