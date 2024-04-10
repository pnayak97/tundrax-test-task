#!/bin/bash

# Start the containers defined in the compose.yml file
sudo docker-compose up -d

# Wait for the PostgreSQL containers to be ready
echo "Waiting for PostgreSQL containers to be ready..."
sleep 3

# Add an entry in the user table of the postgres_dev database
echo "Adding an entry in the user table of the postgres_dev database..."
sudo docker exec -i postgres_dev psql -U user -d tundrax_db << EOF
INSERT INTO user (id, username, email,password,roles) VALUES (1, 'test_user', 'test@example.com','$2b$10$Bv2PMWgFNXpNNk/rD1egwO1poTJR3DPwOWIufkrQ8akc1AkkQTMlm',['SuperAdmin']);
EOF

echo "Entry added successfully."

# Print the logs of the containers
echo "Container logs:"
sudo docker-compose logs
