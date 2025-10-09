# Use the official Selenium Standalone Chrome image as the base image
FROM registry.access.redhat.com/ubi8/python-311:latest

# Set the working directory inside the container
WORKDIR /app/backend

# Copy the requirements file to the container and install dependencies
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
RUN pip3 install bson
RUN pip3 install pymongo

# Copy your FastAPI Python script to the container
COPY main.py main.py
COPY app/ app/
COPY cert/ cert/

EXPOSE 3001

# Set the command to run your Python script
CMD ["python3", "main.py"]