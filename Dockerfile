FROM node:16.18.1

ENV TZ=Asia/Jakarta
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install --legacy-peer-deps

# Bundle app source
COPY . .

EXPOSE 4542
RUN npm run build
CMD ["npm","run","start"]