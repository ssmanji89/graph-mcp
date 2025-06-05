# Deployment Guide

## Docker Deployment

### Build and Run
```bash
docker build -f deployment/Dockerfile -t graph-mcp-server .
docker run -p 3000:3000 -e AZURE_CLIENT_ID=your-id graph-mcp-server
```

### Docker Compose
```bash
cd deployment
docker-compose up -d
```

## Kubernetes Deployment

### Apply Configuration
```bash
kubectl apply -f deployment/kubernetes.yaml
```

### Configure Secrets
```bash
kubectl create secret generic graph-mcp-secrets \
  --from-literal=azure-client-id=your-id \
  --from-literal=azure-client-secret=your-secret \
  --from-literal=azure-tenant-id=your-tenant
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AZURE_CLIENT_ID` | Azure AD application ID | Yes |
| `AZURE_CLIENT_SECRET` | Azure AD application secret | Yes |
| `AZURE_TENANT_ID` | Azure AD tenant ID | Yes |
| `NODE_ENV` | Environment mode | No |
| `REDIS_URL` | Redis connection string | No |

## Health Checks

The server provides health check endpoints:
- `GET /health` - Overall health status
- `GET /metrics` - Performance metrics

## Monitoring

Configure monitoring with:
- Health check endpoints
- Performance metrics
- Error logging
- Cache statistics