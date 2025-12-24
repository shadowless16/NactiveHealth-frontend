# Nactive Health - Frontend

The client-side interface for the Nactive Health EHR module.

## Features

- **Dashboard:** Role-based views for Doctors, Nurses, and Admins.
- **Patient Management:** Forms for registering new patients.
- **Clinical Records:** View history, add encounters, and manage prescriptions.
- **Secure Auth:** Uses HttpOnly cookies for session management.

## Setup

1. **Install Dependencies:**

   ```bash
   pnpm install
   ```

2. **Environment Configuration:**
   Create a `.env` file if you need to point to a custom API URL (defaults to `http://localhost:3001/api`).

3. **Start the App:**
   ```bash
   pnpm start
   ```

## Development

- **Types:** Interfaces are defined in `src/types/index.ts`.
- **API Service:** Axios instance with `withCredentials: true` is in `src/services/api.ts`.
- **Auth State:** Managed via React Context in `src/context/AuthContext.tsx`.

## License

MIT
