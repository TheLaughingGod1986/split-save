#!/bin/bash

# SplitSave Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

# Configuration
APP_NAME="split-save"
DEPLOYMENT_ENV="production"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOYMENT_ID="${APP_NAME}-${DEPLOYMENT_ENV}-${TIMESTAMP}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        log_error "git is not installed"
        exit 1
    fi
    
    # Check Docker (if using containerization)
    if ! command -v docker &> /dev/null; then
        log_warning "Docker is not installed - containerization will be skipped"
    fi
    
    log_success "Prerequisites check passed"
}

# Environment validation
validate_environment() {
    log_info "Validating environment variables..."
    
    # Required environment variables
    required_vars=(
        "NEXT_PUBLIC_API_URL"
        "DATABASE_URL"
        "SUPABASE_URL"
        "SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "JWT_SECRET"
        "NEXTAUTH_SECRET"
        "NEXTAUTH_URL"
    )
    
    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Missing required environment variables: ${missing_vars[*]}"
        exit 1
    fi
    
    log_success "Environment validation passed"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check if working directory is clean
    if [[ -n $(git status --porcelain) ]]; then
        log_warning "Working directory is not clean. Stashing changes..."
        git stash push -m "Auto-stash before deployment $DEPLOYMENT_ID"
    fi
    
    # Check if on main branch
    current_branch=$(git branch --show-current)
    if [[ "$current_branch" != "main" && "$current_branch" != "master" ]]; then
        log_error "Not on main/master branch. Current branch: $current_branch"
        exit 1
    fi
    
    # Pull latest changes
    log_info "Pulling latest changes from remote..."
    git pull origin $current_branch
    
    log_success "Pre-deployment checks passed"
}

# Security audit
security_audit() {
    log_info "Running security audit..."
    
    # Run npm audit
    if npm audit --audit-level=high; then
        log_success "Security audit passed"
    else
        log_warning "Security audit found issues. Review and fix before deployment."
        read -p "Continue with deployment? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Deployment cancelled by user"
            exit 0
        fi
    fi
}

# Build application
build_application() {
    log_info "Building application..."
    
    # Clean previous builds
    log_info "Cleaning previous builds..."
    rm -rf .next out dist
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --production=false
    
    # Run tests
    log_info "Running tests..."
    if npm test -- --passWithNoTests; then
        log_success "Tests passed"
    else
        log_error "Tests failed. Deployment cancelled."
        exit 1
    fi
    
    # Build application
    log_info "Building Next.js application..."
    if npm run build; then
        log_success "Build completed successfully"
    else
        log_error "Build failed. Deployment cancelled."
        exit 1
    fi
    
    # Run linting
    log_info "Running linting..."
    if npm run lint; then
        log_success "Linting passed"
    else
        log_warning "Linting found issues. Review before deployment."
    fi
}

# Performance optimization
optimize_performance() {
    log_info "Running performance optimizations..."
    
    # Bundle analysis
    if [[ "$ANALYZE_BUNDLE" == "true" ]]; then
        log_info "Analyzing bundle..."
        ANALYZE=true npm run build
        log_success "Bundle analysis completed"
    fi
    
    # Image optimization
    log_info "Optimizing images..."
    npm run optimize-images || log_warning "Image optimization failed"
    
    # Generate sitemap
    log_info "Generating sitemap..."
    npm run generate-sitemap || log_warning "Sitemap generation failed"
    
    log_success "Performance optimizations completed"
}

# Database migration
run_database_migrations() {
    log_info "Running database migrations..."
    
    # Check if Prisma is configured
    if [[ -f "prisma/schema.prisma" ]]; then
        log_info "Running Prisma migrations..."
        npx prisma migrate deploy
        
        log_info "Generating Prisma client..."
        npx prisma generate
        
        log_success "Database migrations completed"
    else
        log_info "No Prisma schema found, skipping database migrations"
    fi
}

# Docker build (if applicable)
build_docker_image() {
    if command -v docker &> /dev/null && [[ -f "Dockerfile" ]]; then
        log_info "Building Docker image..."
        
        docker build -t $APP_NAME:$DEPLOYMENT_ID .
        docker tag $APP_NAME:$DEPLOYMENT_ID $APP_NAME:latest
        
        log_success "Docker image built successfully"
    else
        log_info "Skipping Docker build"
    fi
}

# Deploy to production
deploy_to_production() {
    log_info "Deploying to production..."
    
    # Check deployment method
    if [[ -n "$DEPLOYMENT_METHOD" ]]; then
        case $DEPLOYMENT_METHOD in
            "vercel")
                deploy_to_vercel
                ;;
            "netlify")
                deploy_to_netlify
                ;;
            "docker")
                deploy_with_docker
                ;;
            "manual")
                deploy_manually
                ;;
            *)
                log_error "Unknown deployment method: $DEPLOYMENT_METHOD"
                exit 1
                ;;
        esac
    else
        log_info "No deployment method specified, using manual deployment"
        deploy_manually
    fi
}

# Deploy to Vercel
deploy_to_vercel() {
    log_info "Deploying to Vercel..."
    
    if command -v vercel &> /dev/null; then
        vercel --prod --yes
        log_success "Deployment to Vercel completed"
    else
        log_error "Vercel CLI not found. Install with: npm i -g vercel"
        exit 1
    fi
}

# Deploy to Netlify
deploy_to_netlify() {
    log_info "Deploying to Netlify..."
    
    if command -v netlify &> /dev/null; then
        netlify deploy --prod --dir=out
        log_success "Deployment to Netlify completed"
    else
        log_error "Netlify CLI not found. Install with: npm i -g netlify-cli"
        exit 1
    fi
}

# Deploy with Docker
deploy_with_docker() {
    log_info "Deploying with Docker..."
    
    if command -v docker &> /dev/null; then
        # Stop existing containers
        docker stop $APP_NAME || true
        docker rm $APP_NAME || true
        
        # Run new container
        docker run -d \
            --name $APP_NAME \
            --restart unless-stopped \
            -p 3000:3000 \
            -e NODE_ENV=production \
            $APP_NAME:$DEPLOYMENT_ID
        
        log_success "Docker deployment completed"
    else
        log_error "Docker not available"
        exit 1
    fi
}

# Manual deployment
deploy_manually() {
    log_info "Manual deployment - please deploy the built application manually"
    log_info "Build output is available in the .next directory"
    log_info "You can start the application with: npm start"
}

# Health check
health_check() {
    log_info "Running health checks..."
    
    # Wait for application to start
    sleep 10
    
    # Check if application is responding
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        exit 1
    fi
}

# Post-deployment tasks
post_deployment_tasks() {
    log_info "Running post-deployment tasks..."
    
    # Clear caches
    log_info "Clearing caches..."
    npm run clear-cache || true
    
    # Update deployment log
    echo "$(date): Deployment $DEPLOYMENT_ID completed successfully" >> deployment.log
    
    # Send notification
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        send_slack_notification "Deployment $DEPLOYMENT_ID completed successfully"
    fi
    
    log_success "Post-deployment tasks completed"
}

# Send Slack notification
send_slack_notification() {
    local message="$1"
    
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
}

# Rollback function
rollback() {
    log_error "Deployment failed. Rolling back..."
    
    if command -v docker &> /dev/null; then
        docker stop $APP_NAME || true
        docker rm $APP_NAME || true
        
        if [[ -n "$PREVIOUS_IMAGE" ]]; then
            docker run -d \
                --name $APP_NAME \
                --restart unless-stopped \
                -p 3000:3000 \
                -e NODE_ENV=production \
                $PREVIOUS_IMAGE
            log_info "Rolled back to previous version"
        fi
    fi
    
    # Send rollback notification
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        send_slack_notification "Deployment $DEPLOYMENT_ID failed and was rolled back"
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    
    # Remove old Docker images (keep last 5)
    if command -v docker &> /dev/null; then
        docker images $APP_NAME --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}" | \
        tail -n +2 | sort -k3 -r | tail -n +6 | \
        awk '{print $1 ":" $2}' | xargs -r docker rmi || true
    fi
    
    # Clean npm cache
    npm cache clean --force || true
    
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    log_info "Starting production deployment: $DEPLOYMENT_ID"
    
    # Set up error handling
    trap 'rollback' ERR
    trap 'cleanup' EXIT
    
    # Run deployment steps
    check_root
    check_prerequisites
    validate_environment
    pre_deployment_checks
    security_audit
    build_application
    optimize_performance
    run_database_migrations
    build_docker_image
    deploy_to_production
    health_check
    post_deployment_tasks
    
    log_success "Production deployment completed successfully!"
    log_info "Deployment ID: $DEPLOYMENT_ID"
    log_info "Application is now running in production"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --analyze-bundle)
            ANALYZE_BUNDLE=true
            shift
            ;;
        --deployment-method)
            DEPLOYMENT_METHOD="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --analyze-bundle     Run bundle analysis"
            echo "  --deployment-method  Specify deployment method (vercel|netlify|docker|manual)"
            echo "  --help               Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main function
main "$@"

# SplitSave Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

# Configuration
APP_NAME="split-save"
DEPLOYMENT_ENV="production"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOYMENT_ID="${APP_NAME}-${DEPLOYMENT_ENV}-${TIMESTAMP}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        log_error "git is not installed"
        exit 1
    fi
    
    # Check Docker (if using containerization)
    if ! command -v docker &> /dev/null; then
        log_warning "Docker is not installed - containerization will be skipped"
    fi
    
    log_success "Prerequisites check passed"
}

# Environment validation
validate_environment() {
    log_info "Validating environment variables..."
    
    # Required environment variables
    required_vars=(
        "NEXT_PUBLIC_API_URL"
        "DATABASE_URL"
        "SUPABASE_URL"
        "SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "JWT_SECRET"
        "NEXTAUTH_SECRET"
        "NEXTAUTH_URL"
    )
    
    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Missing required environment variables: ${missing_vars[*]}"
        exit 1
    fi
    
    log_success "Environment validation passed"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check if working directory is clean
    if [[ -n $(git status --porcelain) ]]; then
        log_warning "Working directory is not clean. Stashing changes..."
        git stash push -m "Auto-stash before deployment $DEPLOYMENT_ID"
    fi
    
    # Check if on main branch
    current_branch=$(git branch --show-current)
    if [[ "$current_branch" != "main" && "$current_branch" != "master" ]]; then
        log_error "Not on main/master branch. Current branch: $current_branch"
        exit 1
    fi
    
    # Pull latest changes
    log_info "Pulling latest changes from remote..."
    git pull origin $current_branch
    
    log_success "Pre-deployment checks passed"
}

# Security audit
security_audit() {
    log_info "Running security audit..."
    
    # Run npm audit
    if npm audit --audit-level=high; then
        log_success "Security audit passed"
    else
        log_warning "Security audit found issues. Review and fix before deployment."
        read -p "Continue with deployment? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Deployment cancelled by user"
            exit 0
        fi
    fi
}

# Build application
build_application() {
    log_info "Building application..."
    
    # Clean previous builds
    log_info "Cleaning previous builds..."
    rm -rf .next out dist
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --production=false
    
    # Run tests
    log_info "Running tests..."
    if npm test -- --passWithNoTests; then
        log_success "Tests passed"
    else
        log_error "Tests failed. Deployment cancelled."
        exit 1
    fi
    
    # Build application
    log_info "Building Next.js application..."
    if npm run build; then
        log_success "Build completed successfully"
    else
        log_error "Build failed. Deployment cancelled."
        exit 1
    fi
    
    # Run linting
    log_info "Running linting..."
    if npm run lint; then
        log_success "Linting passed"
    else
        log_warning "Linting found issues. Review before deployment."
    fi
}

# Performance optimization
optimize_performance() {
    log_info "Running performance optimizations..."
    
    # Bundle analysis
    if [[ "$ANALYZE_BUNDLE" == "true" ]]; then
        log_info "Analyzing bundle..."
        ANALYZE=true npm run build
        log_success "Bundle analysis completed"
    fi
    
    # Image optimization
    log_info "Optimizing images..."
    npm run optimize-images || log_warning "Image optimization failed"
    
    # Generate sitemap
    log_info "Generating sitemap..."
    npm run generate-sitemap || log_warning "Sitemap generation failed"
    
    log_success "Performance optimizations completed"
}

# Database migration
run_database_migrations() {
    log_info "Running database migrations..."
    
    # Check if Prisma is configured
    if [[ -f "prisma/schema.prisma" ]]; then
        log_info "Running Prisma migrations..."
        npx prisma migrate deploy
        
        log_info "Generating Prisma client..."
        npx prisma generate
        
        log_success "Database migrations completed"
    else
        log_info "No Prisma schema found, skipping database migrations"
    fi
}

# Docker build (if applicable)
build_docker_image() {
    if command -v docker &> /dev/null && [[ -f "Dockerfile" ]]; then
        log_info "Building Docker image..."
        
        docker build -t $APP_NAME:$DEPLOYMENT_ID .
        docker tag $APP_NAME:$DEPLOYMENT_ID $APP_NAME:latest
        
        log_success "Docker image built successfully"
    else
        log_info "Skipping Docker build"
    fi
}

# Deploy to production
deploy_to_production() {
    log_info "Deploying to production..."
    
    # Check deployment method
    if [[ -n "$DEPLOYMENT_METHOD" ]]; then
        case $DEPLOYMENT_METHOD in
            "vercel")
                deploy_to_vercel
                ;;
            "netlify")
                deploy_to_netlify
                ;;
            "docker")
                deploy_with_docker
                ;;
            "manual")
                deploy_manually
                ;;
            *)
                log_error "Unknown deployment method: $DEPLOYMENT_METHOD"
                exit 1
                ;;
        esac
    else
        log_info "No deployment method specified, using manual deployment"
        deploy_manually
    fi
}

# Deploy to Vercel
deploy_to_vercel() {
    log_info "Deploying to Vercel..."
    
    if command -v vercel &> /dev/null; then
        vercel --prod --yes
        log_success "Deployment to Vercel completed"
    else
        log_error "Vercel CLI not found. Install with: npm i -g vercel"
        exit 1
    fi
}

# Deploy to Netlify
deploy_to_netlify() {
    log_info "Deploying to Netlify..."
    
    if command -v netlify &> /dev/null; then
        netlify deploy --prod --dir=out
        log_success "Deployment to Netlify completed"
    else
        log_error "Netlify CLI not found. Install with: npm i -g netlify-cli"
        exit 1
    fi
}

# Deploy with Docker
deploy_with_docker() {
    log_info "Deploying with Docker..."
    
    if command -v docker &> /dev/null; then
        # Stop existing containers
        docker stop $APP_NAME || true
        docker rm $APP_NAME || true
        
        # Run new container
        docker run -d \
            --name $APP_NAME \
            --restart unless-stopped \
            -p 3000:3000 \
            -e NODE_ENV=production \
            $APP_NAME:$DEPLOYMENT_ID
        
        log_success "Docker deployment completed"
    else
        log_error "Docker not available"
        exit 1
    fi
}

# Manual deployment
deploy_manually() {
    log_info "Manual deployment - please deploy the built application manually"
    log_info "Build output is available in the .next directory"
    log_info "You can start the application with: npm start"
}

# Health check
health_check() {
    log_info "Running health checks..."
    
    # Wait for application to start
    sleep 10
    
    # Check if application is responding
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        exit 1
    fi
}

# Post-deployment tasks
post_deployment_tasks() {
    log_info "Running post-deployment tasks..."
    
    # Clear caches
    log_info "Clearing caches..."
    npm run clear-cache || true
    
    # Update deployment log
    echo "$(date): Deployment $DEPLOYMENT_ID completed successfully" >> deployment.log
    
    # Send notification
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        send_slack_notification "Deployment $DEPLOYMENT_ID completed successfully"
    fi
    
    log_success "Post-deployment tasks completed"
}

# Send Slack notification
send_slack_notification() {
    local message="$1"
    
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
}

# Rollback function
rollback() {
    log_error "Deployment failed. Rolling back..."
    
    if command -v docker &> /dev/null; then
        docker stop $APP_NAME || true
        docker rm $APP_NAME || true
        
        if [[ -n "$PREVIOUS_IMAGE" ]]; then
            docker run -d \
                --name $APP_NAME \
                --restart unless-stopped \
                -p 3000:3000 \
                -e NODE_ENV=production \
                $PREVIOUS_IMAGE
            log_info "Rolled back to previous version"
        fi
    fi
    
    # Send rollback notification
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        send_slack_notification "Deployment $DEPLOYMENT_ID failed and was rolled back"
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    
    # Remove old Docker images (keep last 5)
    if command -v docker &> /dev/null; then
        docker images $APP_NAME --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}" | \
        tail -n +2 | sort -k3 -r | tail -n +6 | \
        awk '{print $1 ":" $2}' | xargs -r docker rmi || true
    fi
    
    # Clean npm cache
    npm cache clean --force || true
    
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    log_info "Starting production deployment: $DEPLOYMENT_ID"
    
    # Set up error handling
    trap 'rollback' ERR
    trap 'cleanup' EXIT
    
    # Run deployment steps
    check_root
    check_prerequisites
    validate_environment
    pre_deployment_checks
    security_audit
    build_application
    optimize_performance
    run_database_migrations
    build_docker_image
    deploy_to_production
    health_check
    post_deployment_tasks
    
    log_success "Production deployment completed successfully!"
    log_info "Deployment ID: $DEPLOYMENT_ID"
    log_info "Application is now running in production"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --analyze-bundle)
            ANALYZE_BUNDLE=true
            shift
            ;;
        --deployment-method)
            DEPLOYMENT_METHOD="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --analyze-bundle     Run bundle analysis"
            echo "  --deployment-method  Specify deployment method (vercel|netlify|docker|manual)"
            echo "  --help               Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main function
main "$@"


