
# Socket

A socket.io server that gets data from Kafka Consumer and stream it.

![Apache License](https://img.shields.io/github/license/cleyxds/nodesocket)
![Last Commit](https://img.shields.io/github/last-commit/cleyxds/nodesocket)

## API Reference

- Runs on port 33334
- Once a client connected on the server any request/response are quick for both sides
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`KAFKA_BROKERS` *bootstrap-server*

`KAFKA_CLIENT_ID` *service accounts id*

`KAFKA_CLIENT_SECRET` *service accounts secret*

  
## Tech Stack

**Server:** Node, Socket.io, Kafka.js

  
## Authors

- [@cleyxds](https://www.github.com/cleyxds)
