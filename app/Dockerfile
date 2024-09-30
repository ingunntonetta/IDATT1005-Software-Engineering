FROM node:21

COPY ./server/package.json /tmp/server/package.json
COPY ./client/package.json /tmp/client/package.json

RUN cd /tmp/server && npm install
RUN cd /tmp/client && npm install

RUN mkdir -p /app/client && cp -a /tmp/client/node_modules /app/client
RUN mkdir -p /app/server && cp -a /tmp/server/node_modules /app/server

COPY ./client /app/client
COPY ./server /app/server

RUN cd /app/client && npm run build

COPY ./start_server.sh /app/server/start_server.sh
RUN chmod +x /app/server/start_server.sh

WORKDIR /app/server

EXPOSE 3000

ENTRYPOINT ["./start_server.sh"]