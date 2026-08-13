FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci

COPY . .

RUN npm --workspace apps/web run build

EXPOSE 5173

CMD ["npm", "--workspace", "apps/web", "run", "preview", "--", "--host", "0.0.0.0"]
