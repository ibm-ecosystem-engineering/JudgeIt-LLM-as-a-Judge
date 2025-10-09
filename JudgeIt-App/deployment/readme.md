# LLM-Judge frontend

Make sure you deploy the Backend REST service first.

```yaml
oc create secret generic llmjudge-frontend-secret \
--from-literal=JUDGE_BACKEND_URL='' \
--from-literal=LLM_JUDGE_API_KEY='' \
--from-literal=NEXTAUTH_SECRET='' \
--from-literal=NEXTAUTH_URL='' \
--from-literal=OAUTH_CLIENT_ID='' \
--from-literal=OAUTH_ISSUER_URL=''
```

```sh
oc apply -f deployment.yaml
```