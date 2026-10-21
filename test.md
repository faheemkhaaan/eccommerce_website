```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant R as Register Form
    participant S as Supabase Auth
    participant DB as Postgres Trigger
    participant C as Auth Confirm
    participant H as Header Menu

    U->>R: Submit form
    R->>S: signUp(email, password, metadata)
    S->>DB: insert auth.users, trigger creates profile + address
    S-->>U: Send Verification email
    U->>C: Clicks link (token_hash)
    C->>S: verifyOtp, session cookie set
    C-->>U: Redirect to Dashboard
    S-->>H: onAuthStateChange, useAuthStore, avatar menu