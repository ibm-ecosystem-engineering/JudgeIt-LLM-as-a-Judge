# Deploy REST Service in OpenShift cluster

## Login to OpenShift cluster

Step 1: Login to openshift console and copy login command

<img width="652" alt="image" src="https://github.com/user-attachments/assets/8c8a174e-4a9f-4c82-abdf-c9adc3f6e410">

Login with the token or user user and password in the command line

## Deployment steps

- Create a new project

```sh
oc new-project llm-judge
```

- Set the project name in a variable

```sh
export $NAMESPACE_NAME='llm-judge'
```

- We are using the OpenShift internal registry; however, you can use any container registry.

```sh
export REGISTRY=$(oc get routes -n openshift-image-registry -o jsonpath='{.items[0].spec.host}')
echo $(oc whoami -t) | docker login $REGISTRY -u $(oc whoami) --password-stdin
```

- Build the docker image and push it to internal registry

```sh
docker build -t $REGISTRY/$NAMESPACE_NAME/backend:v1.0 .
docker push $REGISTRY/$NAMESPACE_NAME/backend:v1.0
```

- We have a deployment directory with kustomization. Before you applying the deployment please edit [base/kustomize.yaml](base/kustomization.yaml) file and update the below variables based on the values you have.

    - WATSONX_URL=
    - WX_PROJECT_ID=
    - IBM_CLOUD_API_KEY=
    - LLM_JUDGE_API_KEY=JudgeIt-Secret-Api-Key
    - WX_PLATFORM=saas
    - WX_USER=
    - CELERY_BROKER_URL=redis://redis:6379/0
    - CELERY_RESULT_BACKEND=redis://redis:6379/0
    - SERVER_URL=
    - MONGO_URL=
    - MONGO_USER=
    - MONGO_PASS=
    - MONGO_DB="judgeit_app"

```yaml
kind: Kustomization
images:
  - name: backend-image-name
    newName: image-registry.openshift-image-registry.svc:5000/llm-judge-dev/backend
    newTag: v1.0
secretGenerator:
- name: llm-judge-secret
  literals:
    - WATSONX_URL=
    - WX_PROJECT_ID=
    - IBM_CLOUD_API_KEY=
    - LLM_JUDGE_API_KEY=JudgeIt-Secret-Api-Key
    - WX_PLATFORM=saas
    - WX_USER=
    - CELERY_BROKER_URL=redis://redis:6379/0
    - CELERY_RESULT_BACKEND=redis://redis:6379/0
    - SERVER_URL=
    - MONGO_URL=
    - MONGO_USER=
    - MONGO_PASS=
    - MONGO_DB="judgeit_app"
resources:
  - redis/
  - celery-worker/
  - flower/
  - rest-app/
```

- Apply the deployment

```sh
oc apply -k base/
```

- Monitor the deployment

```sh
watch oc get deployments,pods
```

- Test

Copy the url from the command executed below and paste it in the browser.

```sh
oc get routes/llm-judge-backend -o jsonpath='https://{.spec.host}/docs{"\n"}'
```

- Clean up

```sh
oc delete -k base/
```
