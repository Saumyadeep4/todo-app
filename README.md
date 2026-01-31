

# Todo App (Frontend) – Docker & Kubernetes Ready

A modern **Todo web application** built with **HTML, CSS, and Vanilla JavaScript**, containerized using **Docker**, published to **Docker Hub**, and deployed to **Kubernetes**.

This project is intentionally frontend-only at the current stage and is used to practice **real DevOps workflows**: containerization, image distribution, and Kubernetes deployment.

---

## ✨ Features

- Add, complete, and delete todos
- Filter by status (All / Active / Completed)
- Search todos
- Sort by priority or due date
- Priority indicators (Low / Medium / High)
- Dark / Light mode toggle
- Local persistence using browser `localStorage`
- Clean, macOS-inspired UI
- Fully static frontend (no backend yet)

---

## 🧱 Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Web Server:** Nginx
- **Containerization:** Docker
- **Container Registry:** Docker Hub
- **Orchestration:** Kubernetes (Deployment + Service)

---

## 📁 Project Structure

```
todo-app/
├── index.html
├── style.css
├── app.js
├── Dockerfile
├── k8s/
│   ├── frontend-deployment.yaml
│   └── frontend-service.yaml
└── README.md
```

---

## 🚀 Run Locally (Docker)

### Prerequisites
- Docker installed and running

### Pull image from Docker Hub
```bash
docker pull saumyadeepc/todo-frontend:latest
```

### Run the container
```bash
docker run -p 8080:80 saumyadeepc/todo-frontend:latest
```

Open in browser:
```
http://localhost:8080
```

This works on **macOS, Linux, and Windows**.

---

## ☸️ Deploy to Kubernetes

### Prerequisites
- Kubernetes cluster running (Docker Desktop / minikube / kind / AKS)
- `kubectl` configured

### Create namespace
```bash
kubectl create namespace todo-app
```

### Deploy frontend
```bash
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

### Access the app (local cluster)
```bash
kubectl port-forward -n todo-app svc/todo-frontend-service 8080:80
```

Open:
```
http://localhost:8080
```

---

## 🗂 Storage Behavior

- Todos are stored using **browser `localStorage`**
- Data persists across page reloads
- Data is **not shared** across browsers or machines
- Restarting or redeploying containers does **not** affect data
- Server-side persistence will be added when a backend is introduced

This behavior is **expected and intentional** at the current stage.

---

## 🔒 Security Notes

- No secrets or credentials are stored in this project
- No environment variables required
- Safe for learning, experimentation, and demos

---

## 🧭 Roadmap

Planned evolution of the project:

1. Add backend API (Node.js / FastAPI)
2. Add database (PostgreSQL)
3. Move persistence from `localStorage` → backend
4. Add authentication and multi-user support
5. Add CI/CD pipeline (GitHub Actions / GitLab CI)
6. Add Kubernetes Ingress + TLS

---

## 📌 Versioning & Branching

- `main` branch always represents a **deployable state**
- Docker images are versioned for Kubernetes compatibility
- Feature work should be done in separate branches

---

## 🧠 Purpose of This Project

This project is designed to:
- Practice real-world DevOps fundamentals
- Learn Docker image workflows
- Understand Kubernetes deployments
- Serve as a base for a full frontend + backend system

---

## 📄 License

MIT License