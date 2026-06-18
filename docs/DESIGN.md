# Design

Use this document to capture product-wide design principles that should stay
stable across features.

## Managed Agents Console

This product should feel like an operations console for high-trust engineering
work. The interface should be quiet, information-dense, and fast to scan.

Stable principles:

- The first screen should show useful session state, not a landing page.
- Tables, timelines, logs, file browsers, and detail panes are primary
  components.
- Use cards only for repeated items or modal surfaces, not as the default page
  structure.
- Put status, failure class, actor, lease/heartbeat age, environment, agent,
  and host metadata close to the object title.
- Treat audit and security posture as first-class details, not hidden admin
  tabs.
- Prefer explicit labels for dangerous actions and icon buttons for frequent
  operational tools once a design system exists.
