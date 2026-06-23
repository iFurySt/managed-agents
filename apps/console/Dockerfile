FROM node:22-alpine

WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/console/package.json ./apps/console/package.json
RUN npm ci
COPY apps/console ./apps/console

EXPOSE 5173
CMD ["npm", "--workspace", "apps/console", "run", "dev", "--", "--host", "0.0.0.0"]
