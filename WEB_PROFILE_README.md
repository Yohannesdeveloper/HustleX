# HustleX Web Profile Wizard 🌟

A stunning, modern web interface for creating professional profiles on the HustleX freelance platform. Built with Flask and designed to mirror the amazing React profile wizard experience.

## ✨ Features

### 🎨 Beautiful Design
- **Modern UI**: Sleek, professional interface with gradient backgrounds and smooth animations
- **Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Interactive**: Hover effects, transitions, and micro-animations throughout
- **Glass Effect**: Modern glassmorphism design with backdrop blur effects

### 🚀 User Experience
- **Step-by-Step Wizard**: 4-step guided process (User Type → Basic Info → Professional Details → Review)
- **Progress Tracking**: Visual progress indicators and step navigation
- **File Uploads**: Drag-and-drop file uploads for profile pictures, CVs, and company logos
- **Form Validation**: Real-time validation with helpful error messages
- **Auto-Save**: Session-based data persistence during the setup process

### 👥 Dual Profile Types

#### Freelancer Profiles
- **Basic Information**: Name, email, phone, location, profile picture
- **Professional Details**: Bio, education, work experience, skills, experience level
- **Portfolio Links**: GitHub, LinkedIn, personal portfolio URLs
- **CV Upload**: Support for PDF, DOC, DOCX files
- **Availability Status**: Available, Busy, Part-time, Not Available

#### Client/Company Profiles
- **Company Information**: Name, description, industry, company size
- **Contact Details**: Contact person, email, phone, website
- **Business Details**: Founded year, mission statement
- **Logo Upload**: Company logo with image preview

### 🔧 Technical Features
- **Flask Backend**: Robust Python web framework
- **Session Management**: Secure user session handling
- **File Handling**: Secure file uploads with validation
- **API Integration**: Ready for backend API integration
- **Error Handling**: Comprehensive error handling and user feedback

## 🛠 Installation & Setup

### Prerequisites
- Python 3.8+
- pip package manager

### Installation

1. **Install Dependencies**
   ```bash
   pip install -r requirements_web_profile.txt
   ```

2. **Run the Application**
   ```bash
   python telegram_web_profile.py
   ```

3. **Open in Browser**
   ```
   http://localhost:5000
   ```

### Project Structure
```
hustlex-web-profile/
├── telegram_web_profile.py      # Main Flask application
├── templates/
│   ├── profile_setup.html       # Main profile wizard template
│   └── profile_complete.html    # Completion success page
├── static/
│   ├── css/                     # Custom CSS (if needed)
│   ├── js/                      # Custom JavaScript (if needed)
│   └── uploads/                 # File upload directory
│       ├── avatars/            # Profile pictures and logos
│       └── cvs/                # CV/resume files
├── requirements_web_profile.txt # Python dependencies
└── WEB_PROFILE_README.md       # This documentation
```

## 🎯 Usage Guide

### Starting the Profile Setup

1. **Access the Application**
   - Open `http://localhost:5000` in your browser
   - The application will automatically start a new profile session

2. **Choose Profile Type**
   - Select between "Freelancer" or "Client" profiles
   - Each option shows relevant features and benefits

3. **Complete Basic Information**
   - Fill in personal/company details
   - Upload a professional profile picture/logo
   - All required fields are marked with asterisks (*)

4. **Professional Details**
   - **Freelancers**: Add bio, education, experience, skills, portfolio links, and CV
   - **Clients**: Provide company description, industry, contact details, and mission

5. **Review and Submit**
   - Review all entered information
   - Make any final adjustments
   - Submit to complete the profile

### File Upload Guidelines

- **Profile Pictures**: JPG, PNG up to 5MB
- **CV/Resume**: PDF, DOC, DOCX up to 10MB
- **Company Logos**: JPG, PNG up to 5MB
- Files are stored securely with unique filenames

## 🔌 API Integration

The web profile wizard is designed to integrate with your HustleX backend API. Key integration points:

### Profile Submission
```python
# In telegram_web_profile.py
@app.route('/api/save-profile', methods=['POST'])
def save_profile():
    # Send profile data to your backend API
    response = requests.post('YOUR_BACKEND_API_ENDPOINT', json=profile_data)
    return jsonify(response.json())
```

### File Upload Handling
```python
# Files are uploaded to static/uploads/ directory
# Integrate with your file storage service (AWS S3, etc.)
```

### User Authentication
```python
# Add authentication middleware
@app.before_request
def require_auth():
    # Check user authentication status
    pass
```

## 🎨 Customization

### Styling
- **Tailwind CSS**: All styling uses Tailwind utility classes
- **Custom CSS**: Add custom styles in `static/css/custom.css`
- **Color Scheme**: Easily modify gradient colors and themes

### Form Fields
- Add new fields by updating the `ProfileData` interface
- Modify validation rules in the Flask routes
- Update HTML templates with new form elements

### Steps
- Modify the `ProfileWizardWeb.steps` list to add/remove steps
- Update corresponding HTML templates
- Adjust navigation logic in Flask routes

## 🚀 Deployment

### Local Development
```bash
# Run with debug mode
export FLASK_ENV=development
python telegram_web_profile.py
```

### Production Deployment
```bash
# Set production environment
export FLASK_ENV=production
# Configure your production server (Gunicorn, uWSGI, etc.)
gunicorn -w 4 -b 0.0.0.0:5000 telegram_web_profile:app
```

### Environment Variables
```bash
# Create .env file
FLASK_SECRET_KEY=your-secret-key-here
BACKEND_API_URL=https://api.hustlex.et
UPLOAD_FOLDER=/path/to/uploads
```

## 🔧 Configuration

### Flask Configuration
```python
app.config.update(
    SECRET_KEY='your-secret-key',
    UPLOAD_FOLDER='static/uploads',
    MAX_CONTENT_LENGTH=16 * 1024 * 1024,  # 16MB
    SESSION_TYPE='filesystem'
)
```

### File Upload Settings
```python
# Configure allowed file types
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf', 'doc', 'docx'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
```

## 🐛 Troubleshooting

### Common Issues

1. **Template Not Found**
   - Ensure `templates/` directory exists
   - Check file naming (case-sensitive)

2. **Static Files Not Loading**
   - Verify `static/` directory structure
   - Check Flask static folder configuration

3. **File Upload Errors**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure allowed file types

4. **Session Issues**
   - Clear browser cookies
   - Check Flask secret key configuration

### Debug Mode
```python
# Enable debug mode for development
app.run(debug=True, host='0.0.0.0', port=5000)
```

## 📱 Mobile Responsiveness

The profile wizard is fully responsive and optimized for:
- **Desktop**: Full feature set with multi-column layouts
- **Tablet**: Adapted grid layouts and touch-friendly buttons
- **Mobile**: Single-column layouts with optimized spacing

## 🌟 Advanced Features

### Planned Enhancements
- [ ] Real-time form autosave
- [ ] Profile preview mode
- [ ] Social media integration
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Profile templates
- [ ] Progress analytics

### Performance Optimizations
- [ ] File compression
- [ ] Lazy loading
- [ ] CDN integration
- [ ] Caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the HustleX freelance platform. All rights reserved.

## 📞 Support

For support and questions:
- **Email**: support@hustlex.et
- **Documentation**: Check the main HustleX documentation
- **Issues**: Create an issue in the project repository

---

**Built with ❤️ for the HustleX community**

*Transforming the freelance experience, one profile at a time.*
