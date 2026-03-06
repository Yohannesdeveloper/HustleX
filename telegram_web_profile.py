from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, session
from werkzeug.utils import secure_filename
import os
import json
import uuid
from datetime import datetime
import requests
from typing import Dict, Any
import threading

app = Flask(__name__)
app.secret_key = 'hustlex-profile-wizard-secret-key-2024'
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'avatars'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'cvs'), exist_ok=True)

# Store user profiles in memory (in production, use a database)
user_profiles: Dict[str, Dict[str, Any]] = {}

class ProfileWizardWeb:
    def __init__(self):
        self.steps = [
            'user_type_selection',
            'basic_info',
            'professional_details',
            'review_submit'
        ]

    def get_step_index(self, step_name: str) -> int:
        return self.steps.index(step_name) if step_name in self.steps else 0

    def get_next_step(self, current_step: str) -> str:
        current_index = self.get_step_index(current_step)
        if current_index < len(self.steps) - 1:
            return self.steps[current_index + 1]
        return current_step

    def get_prev_step(self, current_step: str) -> str:
        current_index = self.get_step_index(current_step)
        if current_index > 0:
            return self.steps[current_index - 1]
        return current_step

wizard = ProfileWizardWeb()

@app.route('/', methods=['GET'])
def index():
    """Main page - redirect to profile setup"""
    return redirect(url_for('profile_setup'))

@app.route('/debug')
def debug():
    """Debug route to check app status"""
    return jsonify({
        'status': 'running',
        'routes': [
            '/',
            '/profile-setup',
            '/profile-step/<step_name>',
            '/profile-complete',
            '/api/profile-data',
            '/api/save-profile'
        ],
        'templates': ['profile_setup.html', 'profile_complete.html'],
        'session_id': session.get('session_id'),
        'user_profiles_count': len(user_profiles)
    })

@app.route('/profile-setup', methods=['GET'])
def profile_setup():
    """Start the profile setup wizard"""
    session_id = str(uuid.uuid4())
    session['session_id'] = session_id

    # Initialize user profile
    user_profiles[session_id] = {
        'session_id': session_id,
        'current_step': 'user_type_selection',
        'user_type': None,
        'basic_info': {},
        'professional_details': {},
        'company_info': {},
        'created_at': datetime.now().isoformat(),
        'completed': False
    }

    return render_template('profile_setup.html',
                         current_step='user_type_selection',
                         step_index=0,
                         total_steps=len(wizard.steps))

@app.route('/profile-step/<step_name>', methods=['GET', 'POST'])
def profile_step(step_name):
    """Handle individual profile setup steps"""
    session_id = session.get('session_id')
    if not session_id or session_id not in user_profiles:
        return redirect(url_for('profile_setup'))

    profile = user_profiles[session_id]

    if request.method == 'POST':
        return handle_step_post(step_name, profile)

    # GET request - show the step
    step_index = wizard.get_step_index(step_name)
    return render_template('profile_setup.html',
                         current_step=step_name,
                         step_index=step_index,
                         total_steps=len(wizard.steps),
                         profile=profile)

def handle_step_post(step_name: str, profile: Dict[str, Any]):
    """Handle POST requests for profile steps"""
    if step_name == 'user_type_selection':
        user_type = request.form.get('user_type')
        if user_type in ['freelancer', 'client']:
            profile['user_type'] = user_type
            profile['current_step'] = wizard.get_next_step(step_name)
            return redirect(url_for('profile_step', step_name=profile['current_step']))
        else:
            flash('Please select a valid user type', 'error')
            return redirect(url_for('profile_step', step_name=step_name))

    elif step_name == 'basic_info':
        # Handle basic info form
        profile['basic_info'] = {
            'first_name': request.form.get('first_name', ''),
            'last_name': request.form.get('last_name', ''),
            'email': request.form.get('email', ''),
            'phone': request.form.get('phone', ''),
            'location': request.form.get('location', ''),
        }

        # Handle profile picture upload
        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            if file and file.filename:
                filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'avatars', filename)
                file.save(filepath)
                profile['basic_info']['profile_picture'] = f'/static/uploads/avatars/{filename}'

        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email', 'location']
        if all(profile['basic_info'].get(field) for field in required_fields):
            profile['current_step'] = wizard.get_next_step(step_name)
            return redirect(url_for('profile_step', step_name=profile['current_step']))
        else:
            flash('Please fill in all required fields', 'error')
            return redirect(url_for('profile_step', step_name=step_name))

    elif step_name == 'professional_details':
        if profile['user_type'] == 'freelancer':
            profile['professional_details'] = {
                'bio': request.form.get('bio', ''),
                'education': request.form.get('education', ''),
                'work_experience': request.form.get('work_experience', ''),
                'skills': request.form.get('skills', '').split(',') if request.form.get('skills') else [],
                'experience_level': request.form.get('experience_level', ''),
                'years_of_experience': request.form.get('years_of_experience', ''),
                'availability': request.form.get('availability', 'Available'),
                'portfolio_url': request.form.get('portfolio_url', ''),
                'linkedin_url': request.form.get('linkedin_url', ''),
                'github_url': request.form.get('github_url', ''),
                'certifications': request.form.get('certifications', '').split(',') if request.form.get('certifications') else [],
            }

            # Handle CV upload
            if 'cv_file' in request.files:
                file = request.files['cv_file']
                if file and file.filename:
                    filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
                    filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'cvs', filename)
                    file.save(filepath)
                    profile['professional_details']['cv_file'] = f'/static/uploads/cvs/{filename}'

            # Validate required fields
            required_fields = ['bio', 'education', 'work_experience', 'skills', 'experience_level', 'years_of_experience', 'availability']
            if all(profile['professional_details'].get(field) for field in required_fields):
                profile['current_step'] = wizard.get_next_step(step_name)
                return redirect(url_for('profile_step', step_name=profile['current_step']))
            else:
                flash('Please fill in all required fields', 'error')
                return redirect(url_for('profile_step', step_name=step_name))

        elif profile['user_type'] == 'client':
            profile['company_info'] = {
                'company_name': request.form.get('company_name', ''),
                'company_description': request.form.get('company_description', ''),
                'industry': request.form.get('industry', ''),
                'company_size': request.form.get('company_size', ''),
                'website': request.form.get('website', ''),
                'contact_person': request.form.get('contact_person', ''),
                'contact_email': request.form.get('contact_email', ''),
                'contact_phone': request.form.get('contact_phone', ''),
                'founded_year': request.form.get('founded_year', ''),
                'mission': request.form.get('mission', ''),
            }

            # Handle company logo upload
            if 'company_logo' in request.files:
                file = request.files['company_logo']
                if file and file.filename:
                    filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
                    filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'avatars', filename)
                    file.save(filepath)
                    profile['company_info']['company_logo'] = f'/static/uploads/avatars/{filename}'

            # Validate required fields
            required_fields = ['company_name', 'company_description', 'industry', 'company_size', 'contact_person', 'contact_email', 'contact_phone']
            if all(profile['company_info'].get(field) for field in required_fields):
                profile['current_step'] = wizard.get_next_step(step_name)
                return redirect(url_for('profile_step', step_name=profile['current_step']))
            else:
                flash('Please fill in all required fields', 'error')
                return redirect(url_for('profile_step', step_name=step_name))

    elif step_name == 'review_submit':
        # Handle final submission
        profile['completed'] = True
        profile['completed_at'] = datetime.now().isoformat()

        # Here you could send the profile data to your backend API
        # For now, we'll just mark it as completed

        flash('Profile completed successfully!', 'success')
        return redirect(url_for('profile_complete'))

    return redirect(url_for('profile_step', step_name=step_name))

@app.route('/profile-complete')
def profile_complete():
    """Show profile completion page"""
    session_id = session.get('session_id')
    if not session_id or session_id not in user_profiles:
        return redirect(url_for('profile_setup'))

    profile = user_profiles[session_id]
    return render_template('profile_complete.html', profile=profile)

@app.route('/api/profile-data', methods=['GET'])
def get_profile_data():
    """API endpoint to get current profile data"""
    session_id = session.get('session_id')
    if not session_id or session_id not in user_profiles:
        return jsonify({'error': 'No active session'}), 404

    return jsonify(user_profiles[session_id])

@app.route('/api/save-profile', methods=['POST'])
def save_profile():
    """API endpoint to save profile to backend"""
    session_id = session.get('session_id')
    if not session_id or session_id not in user_profiles:
        return jsonify({'error': 'No active session'}), 404

    profile = user_profiles[session_id]

    # Here you would send the profile data to your HustleX backend
    # For demonstration, we'll just return success

    try:
        # Example API call to your backend
        # response = requests.post('http://your-backend-api/save-profile', json=profile)
        # if response.status_code == 200:
        #     return jsonify({'success': True, 'message': 'Profile saved successfully'})
        # else:
        #     return jsonify({'error': 'Failed to save profile'}), 500

        return jsonify({
            'success': True,
            'message': 'Profile saved successfully',
            'profile_id': session_id
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.template_filter('step_title')
def step_title_filter(step_name):
    """Template filter to get human-readable step titles"""
    titles = {
        'user_type_selection': 'Choose Profile Type',
        'basic_info': 'Basic Information',
        'professional_details': 'Professional Details',
        'review_submit': 'Review & Submit'
    }
    return titles.get(step_name, step_name.replace('_', ' ').title())

@app.template_filter('step_description')
def step_description_filter(step_name):
    """Template filter to get step descriptions"""
    descriptions = {
        'user_type_selection': 'Select whether you want to create a freelancer or client profile',
        'basic_info': 'Tell us about yourself with your basic personal information',
        'professional_details': 'Share your experience, skills, and professional background',
        'review_submit': 'Review your information and submit your profile'
    }
    return descriptions.get(step_name, '')

if __name__ == '__main__':
    print("🚀 HustleX Profile Wizard Web Server Starting...")
    print("🌐 Open your browser to http://localhost:5000")
    print("💼 HustleX - Amazing Profile Creation Experience")
    app.run(debug=True, host='0.0.0.0', port=5000)
