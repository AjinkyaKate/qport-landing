export const MODULE_PAGES = [
  {
    id: "routes",
    label: "Routes",
    path: "/routes",
    seo: {
      title: "QPort Routes | Surveyed. Curated. Dispatchable.",
      description:
        "Manage wind ODC corridors as versioned routes: review geometry, split and merge segments, publish driver-ready truth, and export reports that match the road.",
    },
    hero: {
      overline: "MODULE",
      line1: "Routes",
      line2: { before: "Turn surveys into", accent: "dispatchable", after: " corridors." },
      line3:
        "Split, merge, and publish corridor truth with the lineage your team can defend.",
    },
    overview: {
      title: "The route is the asset.",
      body:
        "Wind ODC moves are multi-week commitments. If the corridor lives in paper and memory, every dispatch is a gamble. QPort makes the route explicit: geometry, constraints, and decisions captured as a single artifact.",
      bullets: [
        "Route statuses that reflect reality: recording, paused, completed, draft, published.",
        "A route library built for reuse, not one-off trips.",
        "Exports that match what the driver sees in the field.",
      ],
    },
    capabilities: {
      eyebrow: "CAPABILITIES",
      title: "Curation tools that stay out of your way.",
      items: [
        {
          title: "Route Review",
          body:
            "Open a corridor and see the route line, annotations, and key context in one place.",
          tag: "Now",
        },
        {
          title: "Split Routes",
          body:
            "Break a long survey into operational segments without losing what happened on the road.",
          tag: "Now",
        },
        {
          title: "Merge Routes",
          body:
            "Compose a new corridor from proven segments. Keep the chain of custody intact.",
          tag: "Now",
        },
        {
          title: "Publishing Workflow",
          body:
            "Move from draft to published with clear state cues so drivers only see approved truth.",
          tag: "Now",
        },
        {
          title: "Export Packages",
          body:
            "Generate shareable reports for safety, admin, and escorts. No copy-paste assembly.",
          tag: "Now",
        },
        {
          title: "Geometry Diff",
          body:
            "Compare versions and see what changed before you approve a corridor for dispatch.",
          tag: "Roadmap",
        },
      ],
    },
    workflow: {
      eyebrow: "WORKFLOW",
      title: "A short path from survey to dispatch.",
      steps: [
        {
          n: "01",
          title: "Ingest",
          body:
            "Create a route from a field survey or import an existing corridor to curate.",
        },
        {
          n: "02",
          title: "Compose",
          body:
            "Split, merge, and refine until the corridor reads like an instruction set, not a story.",
        },
        {
          n: "03",
          title: "Publish + Export",
          body:
            "Lock a driver-ready version, then generate exports for every stakeholder in the move.",
        },
      ],
    },
    roadmap: {
      eyebrow: "ROADMAP",
      title: "Directional roadmap for Routes.",
      disclaimer:
        "Roadmap items are directional. Priorities may shift based on customer corridors and operational risk.",
      lanes: [
        {
          title: "Now",
          items: [
            "Route library with statuses and review context",
            "Split route into child routes",
            "Merge routes into a composed corridor",
            "Exportable reporting workflow",
          ],
        },
        {
          title: "Next",
          items: [
            "Version diffs for geometry and annotations",
            "Approval checkpoints (review → publish) with audit trail",
            "Reusable constraint library (turns, clearance points, escorts)",
            "Connector suggestions with gap rationale",
          ],
        },
        {
          title: "Later",
          items: [
            "Automated constraint scoring and corridor risk profile",
            "Permit-ready export packs with required fields and attachments",
            "What-if detour simulation around closures and restrictions",
            "Shared corridor templates across teams and regions",
          ],
        },
      ],
    },
    faq: [
      {
        q: "Do we have to resurvey to reuse a corridor?",
        a: "No. You can split a survey into reusable segments, then compose future corridors by merging proven pieces. The route lineage stays visible so reviewers understand where each segment came from.",
      },
      {
        q: "How do we prevent drivers from seeing draft routes?",
        a: "Routes move through explicit statuses. Keep drafts internal, and publish only the corridor version you want in the field.",
      },
      {
        q: "Can the route changes be audited later?",
        a: "That is the goal of the workflow. Roadmap items add deeper diffs and approval checkpoints, but the system already favors versioned edits over ad-hoc changes.",
      },
    ],
  },
  {
    id: "vehicles",
    label: "Vehicles",
    path: "/vehicles",
    seo: {
      title: "QPort Vehicles | Fleet Reality, Not Assumptions",
      description:
        "Manage ODC fleet records with driver assignment and operational status so dispatch decisions stay aligned with what is actually in service.",
    },
    hero: {
      overline: "MODULE",
      line1: "Vehicles",
      line2: { before: "Make fleet", accent: "reality", after: " explicit." },
      line3:
        "Track vehicle status, assign drivers, and keep dispatch aligned with what is actually in service.",
    },
    overview: {
      title: "Dispatch starts with constraints.",
      body:
        "A route can be perfect and still fail when the truck setup is wrong. Vehicles keeps the fleet state visible so plans don’t outrun reality.",
      bullets: [
        "Active, maintenance, and inactive status at a glance.",
        "Vehicle types standardized for reporting and filtering.",
        "Driver assignment that matches long-haul ODC operations.",
      ],
    },
    capabilities: {
      eyebrow: "CAPABILITIES",
      title: "Fleet tools that stay clean and fast.",
      items: [
        { title: "Vehicle Directory", body: "A single list of fleet records with quick access to details.", tag: "Now" },
        { title: "Operational Status", body: "Mark vehicles active, maintenance, or inactive so teams plan with the same truth.", tag: "Now" },
        { title: "Driver Assignment", body: "Assign or unassign a driver where that relationship matters for the move.", tag: "Now" },
        { title: "Standardized Types", body: "Consistent vehicle type labels for analytics and exports.", tag: "Now" },
        { title: "Vehicle Profiles", body: "Store dimensions, axle setups, and corridor-specific constraints for compatibility checks.", tag: "Roadmap" },
        { title: "Route Compatibility", body: "Validate a vehicle setup against corridor constraints before dispatch.", tag: "Roadmap" },
      ],
    },
    workflow: {
      eyebrow: "WORKFLOW",
      title: "Keep fleet state aligned.",
      steps: [
        { n: "01", title: "Register", body: "Create fleet records with the fields your dispatch team actually uses." },
        { n: "02", title: "Assign", body: "Attach drivers where needed and keep ownership visible across long moves." },
        { n: "03", title: "Operate", body: "Update status to reflect service reality and feed analytics automatically." },
      ],
    },
    roadmap: {
      eyebrow: "ROADMAP",
      title: "Directional roadmap for Vehicles.",
      disclaimer:
        "Roadmap items are directional. We prioritize the features that reduce dispatch surprises first.",
      lanes: [
        { title: "Now", items: ["Fleet list and detail views", "Driver assignment workflow", "Vehicle status management", "Type normalization for reporting"] },
        { title: "Next", items: ["Constraint-ready vehicle profiles (dimensions, axle counts, attachments)", "Compatibility checks against route constraints", "Maintenance scheduling fields and reminders", "Bulk import and standardized fleet templates"] },
        { title: "Later", items: ["Telematics integrations for live status signals", "Predictive maintenance indicators", "Utilization and idle-time analytics", "Vehicle setup presets per cargo type"] },
      ],
    },
    faq: [
      { q: "Do you track drivers or trucks?", a: "QPort supports driver assignment at the vehicle level, and the workflow is designed for multi-week journeys where trucks are the durable anchor." },
      { q: "Can we model different trailer setups?", a: "Roadmap support covers richer vehicle profiles including trailer attachments and setup presets." },
      { q: "Will Vehicles connect to route constraints?", a: "That is a core roadmap direction: compatibility checks before dispatch so constraints are caught early." },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    path: "/analytics",
    seo: {
      title: "QPort Analytics | Corridor Signals, Not Noise",
      description:
        "Embedded Metabase dashboards for operational visibility across routes, tasks, and fleet. Measure what changes in the field and act faster.",
    },
    hero: {
      overline: "MODULE",
      line1: "Analytics",
      line2: { before: "See the", accent: "signal", after: " in operations." },
      line3:
        "Embedded dashboards for routes, tasks, and fleet. Measure what changes in the field and act faster.",
    },
    overview: {
      title: "Make performance measurable.",
      body:
        "When the workflow is digitized, you get the gift of measurement. Analytics brings route and task reality into dashboards your team can use without spreadsheet glue.",
      bullets: [
        "Embedded Metabase dashboards in the same UI.",
        "Multiple dashboards organized in the sidebar.",
        "Tokens handled server-side for secure embedding.",
      ],
    },
    capabilities: {
      eyebrow: "CAPABILITIES",
      title: "Dashboards that answer operational questions.",
      items: [
        { title: "Overview Dashboard", body: "A quick read of what is happening across corridors and teams.", tag: "Now" },
        { title: "Route Insights", body: "See route performance signals and recurring friction points.", tag: "Now" },
        { title: "Task Analytics", body: "Track throughput across survey, review, and delivery work.", tag: "Now" },
        { title: "Vehicle Performance", body: "Monitor fleet signals that affect dispatch readiness.", tag: "Now" },
        { title: "Scheduled Reports", body: "Deliver dashboard snapshots to stakeholders on a cadence.", tag: "Roadmap" },
        { title: "Alerts", body: "Threshold-based alerts when operational metrics drift.", tag: "Roadmap" },
      ],
    },
    workflow: {
      eyebrow: "WORKFLOW",
      title: "From data to decisions.",
      steps: [
        { n: "01", title: "Collect", body: "Routes, tasks, and vehicle state are captured inside the workflow you already run." },
        { n: "02", title: "Measure", body: "Dashboards surface trends, bottlenecks, and repeat friction across corridors." },
        { n: "03", title: "Act", body: "Use insights to reduce re-surveys, tighten dispatch prep, and improve corridor reuse." },
      ],
    },
    roadmap: {
      eyebrow: "ROADMAP",
      title: "Directional roadmap for Analytics.",
      disclaimer:
        "Roadmap items are directional. We focus on metrics that influence dispatch outcomes, not vanity charts.",
      lanes: [
        { title: "Now", items: ["Embedded Metabase dashboards", "Sidebar navigation for multiple dashboards", "Secure token-based embedding"] },
        { title: "Next", items: ["Scheduled dashboard exports (PDF/PPTX) for stakeholders", "Metric definitions library to standardize reporting", "Alert thresholds for exceptions and drift", "Saved views per team or corridor"] },
        { title: "Later", items: ["Outlier detection on corridor performance", "Predictive delay and re-survey risk signals", "Cost-to-serve modeling per corridor", "Executive summaries generated from operational data"] },
      ],
    },
    faq: [
      { q: "Is Analytics customizable for each customer?", a: "Yes. Dashboards are configured via environment settings and can be tailored for dev and production deployments." },
      { q: "How do you embed dashboards securely?", a: "Tokens are generated server-side and passed into the embedded viewer so access stays controlled." },
      { q: "Can we export dashboards to share internally?", a: "Roadmap support includes scheduled exports and curated stakeholder packs." },
    ],
  },
  {
    id: "tasks",
    label: "Tasks",
    path: "/tasks",
    seo: {
      title: "QPort Tasks | Survey, Review, Deliver With Clarity",
      description:
        "Task tracking for ODC operations: create tasks, assign owners, manage status, and approve work so the corridor is always dispatch-ready.",
    },
    hero: {
      overline: "MODULE",
      line1: "Tasks",
      line2: { before: "Make work", accent: "visible", after: "." },
      line3:
        "Survey, review, and delivery tasks with ownership, status, and approvals. No lost context.",
    },
    overview: {
      title: "Operations need choreography.",
      body:
        "Routes do not ship themselves. Tasks makes the work legible: who is responsible, what state it is in, and what is blocking dispatch.",
      bullets: [
        "Task types built for surveying and delivery operations.",
        "Simple statuses that map to real progress.",
        "Approvals when the corridor needs a sign-off.",
      ],
    },
    capabilities: {
      eyebrow: "CAPABILITIES",
      title: "A task system built for corridor work.",
      items: [
        { title: "Create + Edit", body: "CRUD tasks with clear fields and predictable actions.", tag: "Now" },
        { title: "Status Flow", body: "Pending, in-progress, done. Keep it obvious.", tag: "Now" },
        { title: "Types", body: "Survey, review, delivery, and other operational work.", tag: "Now" },
        { title: "Priority", body: "Low, medium, high. Give dispatch an early warning.", tag: "Now" },
        { title: "Checklists", body: "Repeatable checklists for survey and delivery standards.", tag: "Roadmap" },
        { title: "Field Attachments", body: "Attach photos, notes, and evidence directly to task state changes.", tag: "Roadmap" },
      ],
    },
    workflow: {
      eyebrow: "WORKFLOW",
      title: "Keep corridor work moving.",
      steps: [
        { n: "01", title: "Plan", body: "Create tasks for survey, review, and delivery milestones." },
        { n: "02", title: "Execute", body: "Track status with minimal friction so the system stays truthful." },
        { n: "03", title: "Approve", body: "Use approvals when a task completion changes what can be dispatched." },
      ],
    },
    roadmap: {
      eyebrow: "ROADMAP",
      title: "Directional roadmap for Tasks.",
      disclaimer:
        "Roadmap items are directional. We prioritize features that reduce rework and clarify responsibility.",
      lanes: [
        { title: "Now", items: ["Task CRUD", "Statuses and priorities", "Task types for corridor operations", "Approvals for key steps"] },
        { title: "Next", items: ["Checklists and templates", "Notifications and reminders", "Attachments tied to task state", "SLA and blocker tracking"] },
        { title: "Later", items: ["Auto-generated tasks from route gaps and constraints", "Geo-fenced task start/finish", "Cross-team handoff workflows", "Operational playbooks per corridor"] },
      ],
    },
    faq: [
      { q: "What task types are supported?", a: "Survey, delivery, review, and a general type for edge cases." },
      { q: "Can tasks be approved?", a: "Yes. Approvals are part of the workflow so sign-offs are explicit." },
      { q: "Will Tasks connect directly to Routes?", a: "That is a roadmap direction. Task templates and auto-generation are designed to reduce missed corridor work." },
    ],
  },
  {
    id: "teams",
    label: "Teams",
    path: "/teams",
    seo: {
      title: "QPort Teams | Roles, Access, Accountability",
      description:
        "User management for corridor operations: create users, assign roles, and control access so field and admin teams stay aligned.",
    },
    hero: {
      overline: "MODULE",
      line1: "Teams",
      line2: { before: "Control", accent: "access", after: " without friction." },
      line3:
        "Roles for admins, surveyors, and drivers. Keep the route library safe while the field stays fast.",
    },
    overview: {
      title: "The system is only as good as its permissions.",
      body:
        "ODC operations involve multiple roles with different responsibilities. Teams keeps access clean so edits are deliberate and driver views stay dependable.",
      bullets: [
        "Roles designed for field and admin responsibilities.",
        "Simple user creation and deletion workflows.",
        "A permissions baseline that supports enterprise controls.",
      ],
    },
    capabilities: {
      eyebrow: "CAPABILITIES",
      title: "Identity and access that stays practical.",
      items: [
        { title: "User Directory", body: "Create and manage users with a clear set of fields.", tag: "Now" },
        { title: "Roles", body: "Admin, surveyor, driver. Access maps to responsibility.", tag: "Now" },
        { title: "Safe Deletion", body: "Confirmation flows prevent accidental removal.", tag: "Now" },
        { title: "Avatar Initials", body: "Clear identity cues across the UI.", tag: "Now" },
        { title: "Audit Logs", body: "Track who changed what, when, and why.", tag: "Roadmap" },
        { title: "SSO", body: "SAML/OIDC support for enterprise identity providers.", tag: "Roadmap" },
      ],
    },
    workflow: {
      eyebrow: "WORKFLOW",
      title: "Keep teams aligned.",
      steps: [
        { n: "01", title: "Invite", body: "Create users for every role involved in the corridor lifecycle." },
        { n: "02", title: "Assign", body: "Apply roles so each person sees the tools they need, and nothing else." },
        { n: "03", title: "Operate", body: "Use auditability and approvals to keep changes accountable over time." },
      ],
    },
    roadmap: {
      eyebrow: "ROADMAP",
      title: "Directional roadmap for Teams.",
      disclaimer:
        "Roadmap items are directional. Enterprise controls ship in a way that stays simple for field operators.",
      lanes: [
        { title: "Now", items: ["User CRUD", "Role assignment (admin, surveyor, driver)", "Safe deletion flows", "Identity cues in UI"] },
        { title: "Next", items: ["Audit logs for sensitive actions", "Invite links and onboarding flows", "Role templates and permission matrix", "Team-scoped dashboard views"] },
        { title: "Later", items: ["SSO (SAML/OIDC)", "SCIM provisioning", "Multi-tenant org support", "Granular route-level permission policies"] },
      ],
    },
    faq: [
      { q: "What roles exist today?", a: "Admin, surveyor, and driver roles map to how corridor operations work." },
      { q: "Can drivers be restricted to view-only?", a: "Yes. Driver access is designed for route viewing rather than editing." },
      { q: "Do you support enterprise SSO?", a: "Roadmap support includes SSO and SCIM for organizations that require it." },
    ],
  },
  {
    id: "qport-ai",
    label: "Qport.ai",
    path: "/qport-ai",
    seo: {
      title: "Qport.ai | Ask Questions. Get Operational Answers.",
      description:
        "A conversational interface for routes, tasks, and vehicles. Query your operational data in plain language and keep decisions moving.",
    },
    hero: {
      overline: "MODULE",
      line1: "Qport.ai",
      line2: { before: "Ask the", accent: "system", after: "." },
      line3:
        "Natural language queries over routes, tasks, and fleet. Answers designed for the next decision.",
    },
    overview: {
      title: "Faster answers, fewer tabs.",
      body:
        "When the corridor truth is in the system, the question becomes access. Qport.ai turns common operational questions into a short interaction instead of a hunt across screens.",
      bullets: [
        "Questions about routes, tasks, and vehicles in plain language.",
        "Conversation history to keep context across a move.",
        "Approvals for actions that change state.",
      ],
    },
    capabilities: {
      eyebrow: "CAPABILITIES",
      title: "A chat UI that respects operations.",
      items: [
        { title: "Operational Queries", body: "Ask about routes, tasks, and vehicles without writing SQL.", tag: "Now" },
        { title: "Markdown Answers", body: "Readable output for teams who need clarity, not flair.", tag: "Now" },
        { title: "History", body: "Keep conversations per corridor or per customer.", tag: "Now" },
        { title: "Query Limits", body: "Usage tracking so costs stay predictable.", tag: "Now" },
        { title: "Sources", body: "Show where an answer came from and what data it used.", tag: "Roadmap" },
        { title: "Actionable Commands", body: "Turn an answer into an export, a task, or a route filter with approval.", tag: "Roadmap" },
      ],
    },
    workflow: {
      eyebrow: "WORKFLOW",
      title: "From question to action.",
      steps: [
        { n: "01", title: "Ask", body: "Type a question the way you’d ask your ops lead." },
        { n: "02", title: "Verify", body: "Review the answer and inspect sources where needed." },
        { n: "03", title: "Act", body: "Generate an export, open a task, or refine a route view with a confirmation step." },
      ],
    },
    roadmap: {
      eyebrow: "ROADMAP",
      title: "Directional roadmap for Qport.ai.",
      disclaimer:
        "Roadmap items are directional. Any action that changes operational state stays gated behind approvals.",
      lanes: [
        { title: "Now", items: ["Chat interface with history", "Markdown rendering", "Query limit tracking", "Approval dialog for actions"] },
        { title: "Next", items: ["Sources and citations for answers", "Saved prompts per corridor", "Suggested next questions based on context", "Export generation from chat with approval"] },
        { title: "Later", items: ["Daily dispatch briefing summaries", "Anomaly detection on corridor and task patterns", "Natural language route composition commands", "Agent runs for scheduled operational checks"] },
      ],
    },
    faq: [
      { q: "Can Qport.ai change data automatically?", a: "Any action that changes state should be explicit. Roadmap commands stay behind approvals so operators stay in control." },
      { q: "What can it answer today?", a: "Questions about routes, tasks, and vehicles, returned as readable responses with conversation history." },
      { q: "Will it show sources for answers?", a: "That is a near-term roadmap item. The goal is answers you can verify, not guesses." },
    ],
  },
];

export function getModuleByPath(pathname) {
  return MODULE_PAGES.find((m) => m.path === pathname) || null;
}

