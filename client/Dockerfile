# ── Stage 1: build the React/Vite app ────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copy manifests first — npm ci layer is cached unless deps change.
COPY package.json package-lock.json* ./
RUN npm ci

# VITE_API_URL is baked into the JS bundle at build time by Vite.
# Must be the URL the BROWSER uses to reach the API — not the internal Docker hostname.
# Example: http://localhost:8000/api (local) or https://api.talentlink.com/api (prod)
ARG VITE_API_URL=http://localhost:8000/api
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build


# ── Stage 2: serve with nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
