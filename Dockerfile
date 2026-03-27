FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Ensure Convex generated files are in the expected location for src/ imports
# Create src/convex/_generated and copy files from convex/_generated
RUN mkdir -p src/convex/_generated && \
    if [ -d "convex/_generated" ]; then \
      cp -r convex/_generated/* src/convex/_generated/ 2>/dev/null || true; \
    fi

# Create runtime api.ts stub if it doesn't exist
RUN if [ ! -f "src/convex/_generated/api.ts" ]; then \
      echo '// Runtime stub for Convex API' > src/convex/_generated/api.ts && \
      echo 'import type { api as ApiType, internal as InternalType } from "../../../convex/_generated/api";' >> src/convex/_generated/api.ts && \
      echo 'export const api = {} as typeof ApiType;' >> src/convex/_generated/api.ts && \
      echo 'export const internal = {} as typeof InternalType;' >> src/convex/_generated/api.ts; \
    fi

# Vite replaces import.meta.env.VITE_* at build time only; runtime container env does not apply.
ARG VITE_CONVEX_URL
ARG VITE_KEYCLOAK_URL=https://auth.f3ssoftware.com
ARG VITE_KEYCLOAK_REALM=portal
ARG VITE_KEYCLOAK_CLIENT_ID=cms-admin-web
ENV VITE_CONVEX_URL=${VITE_CONVEX_URL}
ENV VITE_KEYCLOAK_URL=${VITE_KEYCLOAK_URL}
ENV VITE_KEYCLOAK_REALM=${VITE_KEYCLOAK_REALM}
ENV VITE_KEYCLOAK_CLIENT_ID=${VITE_KEYCLOAK_CLIENT_ID}

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]





