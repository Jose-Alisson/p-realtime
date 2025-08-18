FROM node:20

ARG PEDIDOS
ARG KEY

ENV API_PEDIDOS=${PEDIDOS}
ENV SECURITY_KEY=${KEY}

WORKDIR /main

COPY package*.json ./
COPY . .
RUN npm install && npm install -g typescript 
RUN tsc

EXPOSE 4040

CMD ["npm", "start"]
