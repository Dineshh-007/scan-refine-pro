🖼️ Image Distortion Corrector
A web-based application for correcting perspective distortion in images using OpenCV and machine learning.

Developed by: Dinesh, Iniyan, Sudharshan, Arjun, Boophesh

✨ Features
🎨 Modern Glassmorphism UI: Beautiful, interactive interface with soft pastel colors
📷 Smart Image Upload: Drag & drop support for JPEG/PNG files (max 10MB)
🎯 Interactive Corner Selection: Click to select 4 corner points on distorted areas
🔧 Real-time Processing: OpenCV-powered perspective transformation
🖥️ Side-by-Side Preview: Compare original and corrected images
💾 Download Functionality: Save corrected images locally
⚡ Image Enhancement: Automatic contrast improvement and noise reduction
📱 Responsive Design: Works on desktop and mobile devices
🛠️ Technology Stack
Frontend
React 19 - Modern UI framework
Tailwind CSS - Utility-first styling
Shadcn/UI - Beautiful, accessible components
Axios - HTTP client for API calls
Lucide React - Modern icon library
Backend
FastAPI - High-performance Python web framework
OpenCV - Computer vision library for image processing
Pillow - Python imaging library
NumPy - Numerical computing
MongoDB - Document database for metadata storage
Motor - Async MongoDB driver
🚀 Quick Start
Prerequisites
Python 3.8+
Node.js 16+
MongoDB (local or cloud instance)
Git
1. Clone Repository
git clone https://github.com/your-username/image-distortion-corrector.git
cd image-distortion-corrector
2. Backend Setup
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string

# Start the server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
3. Frontend Setup
cd frontend

# Install dependencies
yarn install

# Set environment variables
cp .env.example .env
# Edit .env with your backend URL

# Start the development server
yarn start
4. Access Application
Frontend: http://localhost:3000
Backend API: http://localhost:8001
API Documentation: http://localhost:8001/docs
📂 Project Structure
image-distortion-corrector/
├── frontend/                    # React application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ui/            # Shadcn/UI components
│   │   │   └── ImageDistortionCorrector.jsx
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Utility functions
│   │   │   └── api.js         # API client
│   │   ├── App.js             # Main App component
│   │   └── index.js           # Entry point
│   ├── package.json           # Dependencies
│   └── tailwind.config.js     # Tailwind configuration
├── backend/                    # FastAPI application
│   ├── server.py              # Main FastAPI server
│   ├── models.py              # Pydantic models
│   ├── image_processor.py     # OpenCV image processing
│   ├── requirements.txt       # Python dependencies
│   └── .env.example          # Environment variables template
├── contracts.md               # API contracts documentation
├── README.md                  # This file
└── .gitignore                # Git ignore rules
🎯 How It Works
1. Image Upload
Users upload JPEG/PNG images via drag & drop or file selection
Backend validates file format, size, and image integrity
Images are temporarily stored for processing
2. Corner Point Selection
Interactive canvas overlay allows clicking on image corners
Coordinates are automatically converted from display to image space
Visual feedback shows selected points and connecting lines
3. Perspective Correction
OpenCV's getPerspectiveTransform() calculates transformation matrix
warpPerspective() applies correction to straighten the image
Automatic image enhancement improves contrast and reduces noise
4. Download & Save
Processed images are available for immediate download
High-quality PNG format preserves image details
Metadata is stored in MongoDB for processing history
🔧 API Endpoints
Image Management
POST /api/upload-image - Upload image for processing
POST /api/process-image - Apply perspective correction
GET /api/images/{id}/original - Retrieve original image
GET /api/images/{id}/processed - Retrieve processed image
GET /api/images/{id}/download - Download processed image
GET /api/images/{id}/info - Get processing metadata
System
GET /api/health - Health check endpoint
GET /api/ - API welcome message
🐳 Docker Deployment
Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
Docker Compose
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongo:27017
      - DB_NAME=image_corrector
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - REACT_APP_BACKEND_URL=http://localhost:8001

  mongo:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
🧪 Testing
Manual Testing
Upload a distorted image (screenshot, document photo, etc.)
Click on four corners of the distorted area
Click "Correct Distortion" to process
Compare original and corrected images
Download the corrected image
Automated Testing
# Backend tests
cd backend
pytest tests/

# Frontend tests  
cd frontend
yarn test
🌟 Image Processing Pipeline
OpenCV Processing Steps:
Image Validation: Format and integrity checks
Coordinate Normalization: Convert UI coordinates to image space
Perspective Transform: Calculate transformation matrix
Image Warping: Apply perspective correction
Enhancement: CLAHE contrast improvement
Noise Reduction: Bilateral filtering
Output Generation: High-quality PNG export
Supported Features:
File Formats: JPEG, PNG
Max File Size: 10MB
Processing: Real-time perspective correction
Enhancement: Automatic contrast and noise reduction
Output: High-quality PNG format
🚀 Production Deployment
Environment Variables
Backend (.env)

MONGO_URL=your_mongodb_connection_string
DB_NAME=image_corrector
Frontend (.env)

REACT_APP_BACKEND_URL=https://your-api-domain.com
Cloud Deployment Options
Vercel/Netlify: Frontend deployment
Railway/Render: Backend deployment
MongoDB Atlas: Database hosting
AWS/Google Cloud: Full-stack deployment
🤝 Contributing
Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

👥 Team
Developed by:

Dinesh - Lead Developer & AI Integration 
Arjun - front end developer
Boophesh - UI/UX designer
Sudharshan - Data and Map Integration specialist 
Iniyan - backend developer
🙏 Acknowledgments
OpenCV - Computer vision library
FastAPI - Modern Python web framework
React - UI framework
Tailwind CSS - CSS framework
Shadcn/UI - Component library
