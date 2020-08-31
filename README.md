# Application Summary



Infrastructure
- Docker containers encapsulate the application server
- Kubernetes orchaestrates the containers 

Front-end: 
- ejs renders html routes
- jQuery framework for client-side Javascript

Application Server:
- Requests are made to a load-balancer, that forwards it to a server running this Express app

Storage
- Application state management is handled by an external Redis cluster to maintain statelessness on the application server
- A PostgreSQL cluster stores application data and complies with ACID principles


Monitoring
- A prometheus client scrapes information from the K8 cluster 

Logging
- @todo

Error Handling
- @todo

Testing
- @todo
