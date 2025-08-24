# 🚫 **DevCore AI Toolkit – What It Does NOT Do**

> *Because a truly client-side app has limits—and these are the lines it doesn’t cross.*

This app is **static**, **frontend-only**, and **serverless**. There is no backend, no hosting logic, and no state persistence beyond your browser. Credentials are stored locally and encrypted via WebCrypto (in IndexedDB). It only uses **external APIs**, **directly from the client**.

Here’s the **definitive list** of what it **does not and cannot do**, sorted by domain.

---

### 🧠 AI/ML: Training & Infrastructure

* ❌ **Train or fine-tune models** (e.g., TensorFlow, PyTorch, Hugging Face)
* ❌ **Run custom inference servers** (no server = no hosting models)
* ❌ **Deploy ML pipelines** (Airflow, Kubeflow? Not here.)
* ❌ **Use local LLMs** (No WebGPU/ONNX model loading)
* ❌ **RAG pipelines / Vector DBs** (e.g., Pinecone, Weaviate)
* ❌ **Use LangChain / Agent toolchains** (no backend agent runners)

> ✅ It **can call hosted AI APIs** (like Gemini) **directly from the browser**, using secure keys stored locally.

---

### 🖥️ Backend Logic, APIs & Auth

* ❌ No backend microservices (e.g., Express, Flask)
* ❌ No session storage or cookies
* ❌ No OAuth flows (e.g., GitHub login via redirect)
* ❌ No custom API route handlers or REST endpoints
* ❌ No WebSockets or real-time event servers
* ❌ No rate limiting or traffic shaping

> ✅ **You must paste in personal API tokens manually.** OAuth integrations are not possible in a fully static setup.

---

### 🔐 Security & Identity

* ❌ No Role-Based Access Control (RBAC)
* ❌ No user auth systems (e.g., Firebase Auth, Auth0)
* ❌ No secret or environment variable injection at runtime
* ❌ No CVE scanning or software audits

> ✅ **Secrets are stored client-side only**, encrypted with AES-GCM using a PBKDF2-derived master key.

---

### 🛠 DevOps, Infra & Deployment

* ❌ No Docker/Docker Compose or containers
* ❌ No Kubernetes or Helm charts
* ❌ No CI/CD pipelines (GitHub Actions, Jenkins)
* ❌ No build/deploy integrations (Vercel, Netlify CLI)
* ❌ No observability/log aggregation (Datadog, NewRelic)
* ❌ No runtime configuration management

> ✅ This app is meant to be **deployed statically on any CDN** (e.g., GitHub Pages, Netlify, Cloudflare Pages).

---

### 📱 Mobile & Native

* ❌ No React Native, Flutter, Swift, Kotlin support
* ❌ No mobile-specific build outputs
* ❌ No access to mobile APIs (Bluetooth, camera, etc.)
* ❌ No push notification support

---

### 🎨 Multimedia & Creative

* ❌ No audio/video editing
* ❌ No animation frameworks or rendering engines
* ❌ No game engine integration (Unity, Godot)

> ✅ You can generate AI images using prompts or references.

---

### 📊 Data Science & Analytics

* ❌ No Jupyter-like notebooks
* ❌ No built-in SQL runner or database connectors
* ❌ No data pipeline orchestration
* ❌ No CSV/Excel import or dashboards

---

### 📅 Project Management & Collaboration

* ❌ No Kanban boards
* ❌ No issue tracking, tickets, or roadmaps
* ❌ No team/user management or collaboration tools
* ❌ No Slack / Discord integration

---

### 💸 Payments, Ecommerce, Marketing

* ❌ No Stripe or PayPal integration
* ❌ No shopping carts or product catalogs
* ❌ No email campaigns or newsletter systems
* ❌ No social media post generators

---

### 📦 Framework Ecosystems (Server-Dependent)

* ❌ No support for fullstack frameworks (Next.js, Nuxt, Remix, etc.)
* ❌ No server-side rendering (SSR or SSG)
* ❌ No backend code generation (NestJS, Laravel)

---

### 🧪 Testing Infra

* ❌ No Cypress or Playwright-style E2E tests
* ❌ No Jest or Mocha integration (does not run tests directly)
* ❌ No mutation testing or test coverage tools

> ✅ It **generates** unit tests, but **does not run them**.

---

## 🔐 🔑 Integration Access – Credential Handling

All third-party integrations are **read-only or write-through via API**, and **require user-provided API keys**, which are:

* **Never sent to a server**
* **Encrypted locally using WebCrypto**
* **Stored in IndexedDB**
* **Accessed only at runtime via user password-derived decryption**

### ✅ Supported Integrations (examples):

| Integration     | Method                      | Where to Store Credentials     |
| --------------- | --------------------------- | ------------------------------ |
| Gemini AI       | API Key                     | Vault (Encrypted in IndexedDB) |
| GitHub          | Personal Access Token (PAT) | Vault                          |
| OpenAI (opt-in) | API Key                     | Vault                          |
| Custom API      | Key + URL                   | Vault                          |

---

## 📐 Test Plan & Validation Rubric

Use this table to **test** whether the app meets the expectations of its static, secure, local-first architecture.

| Feature / Component               | Test Criteria                                                            | Should Pass? |
| --------------------------------- | ------------------------------------------------------------------------ | ------------ |
| Vault encryption                  | API key stored only after encryption via WebCrypto                       | ✅ Yes        |
| IndexedDB storage                 | Data is stored in browser IndexedDB, not localStorage                    | ✅ Yes        |
| No server calls (outside API)     | No internal fetch/XHR to own origin unless static assets                 | ✅ Yes        |
| Secure