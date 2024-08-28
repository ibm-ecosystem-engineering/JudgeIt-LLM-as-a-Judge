# JudgeIt Application

This directory contains the code for a React-based application that provides a user interface for interacting with the LLM Judge service. It is built on the Next.js framework and integrates with IBM App ID for authentication. The application allows users to submit single and batch requests and save the results in CSV or XLSX format.

## Prerequisite

- LLM Judge Backend Service is up and running. Can be found [here](/REST%20Service)
- [Node.js](https://nodejs.org/en) v18 or higher
- [IBM AppID](https://www.ibm.com/products/app-id) for application authentication

## Environment Variables

Create a `.env` file to run the application with the following variables: Make sure `NEXT_PUBLIC_LLM_JUDGE_API_KEY` value matches with the value assigned in backend service.

```sh
NEXT_PUBLIC_JUDGE_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_LLM_JUDGE_API_KEY="LLM-JUDGE-SECRET-PASS"
OAUTH_ISSUER_URL=
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
```

## Getting Started

### Install the dependencies

```sh
npm install
```

### Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.