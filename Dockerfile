FROM node:22

# Create app directory
WORKDIR /usr/src/jinn-backend

# Copying file into APP directory of docker
COPY package.json ./

RUN npm install

# Copy current directory to APP folder
COPY . .

RUN npm run build

EXPOSE 5000
CMD ["npm", "run", "start:prod"]
