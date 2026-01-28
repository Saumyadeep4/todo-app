FROM nginx:alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy current directory contents (HTML/CSS/JS)
COPY . /usr/share/nginx/html

# Expose nginx port
EXPOSE 80

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
