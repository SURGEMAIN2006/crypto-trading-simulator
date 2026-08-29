FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production || true
COPY . .
EXPOSE 3005
CMD ["node", "index.cjs"]
