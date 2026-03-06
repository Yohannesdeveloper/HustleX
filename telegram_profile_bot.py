import os
os.environ['TZ'] = 'UTC'

import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, ContextTypes, filters
from telegram.constants import ParseMode
import asyncio
from typing import Dict, Any
import json
import pytz

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Bot token
TOKEN = '8289162137:AAG1ccjTbr9ZMPiU4OxVeiXyUla3pMzAOJw'

# User profile data storage (in production, use a database)
user_profiles: Dict[int, Dict[str, Any]] = {}

class ProfileWizard:
    def __init__(self):
        self.steps = {
            'start': 'profile_setup',
            'profile_setup': 'waiting_for_image',
            'waiting_for_image': 'waiting_for_education',
            'waiting_for_education': 'waiting_for_certificates',
            'waiting_for_certificates': 'profile_complete'
        }

    def get_next_step(self, current_step: str) -> str:
        return self.steps.get(current_step, 'start')

    def get_step_message(self, step: str) -> str:
        messages = {
            'profile_setup': "🎯 *Welcome to HustleX Profile Setup!*\n\nLet's create your professional profile. We'll collect your image, education, and certificates.\n\n📸 *Step 1:* Please send your profile picture",
            'waiting_for_image': "📸 *Step 1:* Please send your profile picture",
            'waiting_for_education': "🎓 *Step 2:* Please tell us about your education\n\nExample: Bachelor's in Computer Science, Addis Ababa University (2018-2022)",
            'waiting_for_certificates': "🏆 *Step 3:* Please list your certificates and certifications\n\nExample: AWS Certified Developer, Google Cloud Professional, PMP Certification",
            'profile_complete': "✅ *Profile Complete!*\n\nYour HustleX profile has been set up successfully!"
        }
        return messages.get(step, "Unknown step")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    user = update.effective_user

    # Initialize user profile if not exists
    if user.id not in user_profiles:
        user_profiles[user.id] = {
            'user_id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'current_step': 'start',
            'profile_image': None,
            'education': None,
            'certificates': None,
            'completed': False
        }

    # Create main menu keyboard
    keyboard = [
        [KeyboardButton("👤 Profile Setup")],
        [KeyboardButton("📋 View Profile")],
        [KeyboardButton("ℹ️ About HustleX")]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

    welcome_message = f"""
🌟 *Welcome to HustleX Freelance Platform!* 🌟

Hello {user.mention_html()}! 👋

I'm your HustleX assistant bot. I help you create and manage your professional profile on our freelance platform.

🚀 *What can I do for you?*
• Set up your professional profile
• Update your education and certificates
• Showcase your skills to potential clients

Use the buttons below to get started!

━━━━━━━━━━━━━━━━━━━━━
💼 *HustleX* - Connecting Talent with Opportunity
━━━━━━━━━━━━━━━━━━━━━
"""

    await update.message.reply_html(
        welcome_message,
        reply_markup=reply_markup
    )

async def handle_text(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle text messages."""
    user = update.effective_user
    text = update.message.text

    # Initialize user profile if not exists
    if user.id not in user_profiles:
        user_profiles[user.id] = {
            'user_id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'current_step': 'start',
            'profile_image': None,
            'education': None,
            'certificates': None,
            'completed': False
        }

    user_profile = user_profiles[user.id]
    wizard = ProfileWizard()

    # Handle main menu options
    if text == "👤 Profile Setup":
        await start_profile_wizard(update, context)
    elif text == "📋 View Profile":
        await view_profile(update, context)
    elif text == "ℹ️ About HustleX":
        await about_hustlex(update, context)
    else:
        # Handle profile setup wizard steps
        current_step = user_profile.get('current_step', 'start')

        if current_step == 'waiting_for_education':
            user_profile['education'] = text
            user_profile['current_step'] = wizard.get_next_step(current_step)
            await send_wizard_step(update, context, user_profile['current_step'])
        elif current_step == 'waiting_for_certificates':
            user_profile['certificates'] = text
            user_profile['current_step'] = wizard.get_next_step(current_step)
            user_profile['completed'] = True

            # Save profile completion
            await complete_profile(update, context)
        else:
            await update.message.reply_text(
                "Please use the menu buttons or type /start to begin."
            )

async def start_profile_wizard(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Start the profile setup wizard with step-by-step flow."""
    user = update.effective_user
    user_profile = user_profiles[user.id]

    # Reset profile setup
    user_profile['current_step'] = 'profile_setup'
    user_profile['completed'] = False

    # Start with the first step
    wizard = ProfileWizard()
    first_step = wizard.get_next_step('start')  # This will be 'waiting_for_image'

    # Create wizard navigation keyboard
    keyboard = [
        [InlineKeyboardButton("⏭️ Skip", callback_data="skip_step")],
        [InlineKeyboardButton("❌ Cancel", callback_data="cancel_wizard")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    wizard_message = f"""
🎯 *HustleX Profile Setup Wizard* 🎯

Welcome {user.first_name}! Let's create your professional profile step by step.

━━━━━━━━━━━━━━━━━━━━━
📋 *Wizard Progress:*
🔸 Profile Picture → 🎓 Education → 🏆 Certificates → ✅ Complete

━━━━━━━━━━━━━━━━━━━━━
💼 *HustleX* - Your Professional Journey Starts Here
━━━━━━━━━━━━━━━━━━━━━
"""

    await update.message.reply_text(
        wizard_message,
        reply_markup=reply_markup,
        parse_mode=ParseMode.MARKDOWN
    )

    # Send the first step
    await send_wizard_step(update, context, first_step)

async def send_wizard_step(update: Update, context: ContextTypes.DEFAULT_TYPE, step: str) -> None:
    """Send the appropriate wizard step to the user."""
    user = update.effective_user
    wizard = ProfileWizard()

    if step == 'waiting_for_image':
        step_message = """
📸 *Step 1 of 3: Profile Picture* 📸

Please send your profile picture to represent yourself professionally.

━━━━━━━━━━━━━━━━━━━━━
💡 *Tips:*
• Use a clear, professional photo
• Face should be clearly visible
• Recent photo preferred

━━━━━━━━━━━━━━━━━━━━━
💼 *HustleX* - Building Your Professional Profile
━━━━━━━━━━━━━━━━━━━━━
"""
        await update.message.reply_text(
            step_message,
            parse_mode=ParseMode.MARKDOWN
        )

    elif step == 'waiting_for_education':
        step_message = """
🎓 *Step 2 of 3: Education* 🎓

Please tell us about your educational background.

━━━━━━━━━━━━━━━━━━━━━
📝 *Examples:*
• Bachelor's in Computer Science, Addis Ababa University (2018-2022)
• Master's in Software Engineering, Harvard University (2020-2022)
• Self-taught developer with online certifications

━━━━━━━━━━━━━━━━━━━━━
💼 *HustleX* - Building Your Professional Profile
━━━━━━━━━━━━━━━━━━━━━
"""
        await update.message.reply_text(
            step_message,
            parse_mode=ParseMode.MARKDOWN
        )

    elif step == 'waiting_for_certificates':
        step_message = """
🏆 *Step 3 of 3: Certificates & Certifications* 🏆

Please list your professional certificates and certifications.

━━━━━━━━━━━━━━━━━━━━━
📝 *Examples:*
• AWS Certified Developer Associate
• Google Cloud Professional Cloud Architect
• PMP (Project Management Professional)
• Cisco CCNA, Microsoft Azure certifications

━━━━━━━━━━━━━━━━━━━━━
💼 *HustleX* - Building Your Professional Profile
━━━━━━━━━━━━━━━━━━━━━
"""
        await update.message.reply_text(
            step_message,
            parse_mode=ParseMode.MARKDOWN
        )

async def send_wizard_step_via_query(query, context: ContextTypes.DEFAULT_TYPE, step: str) -> None:
    """Send wizard step via callback query (for skip functionality)."""
    if step == 'waiting_for_education':
        step_message = """
🎓 *Step 2 of 3: Education* 🎓

Please tell us about your educational background.

━━━━━━━━━━━━━━━━━━━━━
📝 *Examples:*
• Bachelor's in Computer Science, Addis Ababa University (2018-2022)
• Master's in Software Engineering, Harvard University (2020-2022)
• Self-taught developer with online certifications

━━━━━━━━━━━━━━━━━━━━━
💼 *HustleX* - Building Your Professional Profile
━━━━━━━━━━━━━━━━━━━━━
"""
        await query.edit_message_text(
            step_message,
            parse_mode=ParseMode.MARKDOWN
        )

    elif step == 'waiting_for_certificates':
        step_message = """
🏆 *Step 3 of 3: Certificates & Certifications* 🏆

Please list your professional certificates and certifications.

━━━━━━━━━━━━━━━━━━━━━
📝 *Examples:*
• AWS Certified Developer Associate
• Google Cloud Professional Cloud Architect
• PMP (Project Management Professional)
• Cisco CCNA, Microsoft Azure certifications

━━━━━━━━━━━━━━━━━━━━━
💼 *HustleX* - Building Your Professional Profile
━━━━━━━━━━━━━━━━━━━━━
"""
        await query.edit_message_text(
            step_message,
            parse_mode=ParseMode.MARKDOWN
        )

async def start_profile_setup(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Legacy function - redirects to new wizard."""
    await start_profile_wizard(update, context)

async def handle_photo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle photo uploads for profile picture."""
    user = update.effective_user
    user_profile = user_profiles.get(user.id, {})

    if user_profile.get('current_step') == 'waiting_for_image':
        # Get the largest photo size
        photo = update.message.photo[-1]
        file_id = photo.file_id

        # Store the file ID
        user_profile['profile_image'] = file_id
        user_profile['current_step'] = 'waiting_for_education'

        wizard = ProfileWizard()

        success_message = """
✅ *Profile Picture Saved!* ✅

Great! Your profile picture has been uploaded successfully.

━━━━━━━━━━━━━━━━━━━━━
🎓 *Step 2 of 3: Education*

Now please tell us about your educational background.

━━━━━━━━━━━━━━━━━━━━━
💼 *HustleX* - Building Your Professional Profile
━━━━━━━━━━━━━━━━━━━━━
"""

        await update.message.reply_text(
            success_message,
            parse_mode=ParseMode.MARKDOWN
        )

        # Send the next step
        await send_wizard_step(update, context, 'waiting_for_education')
    else:
        await update.message.reply_text(
            "Please start the profile setup wizard first by clicking '👤 Profile Setup'.",
            parse_mode=ParseMode.MARKDOWN
        )

async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle callback queries from inline keyboards."""
    query = update.callback_query
    await query.answer()

    user = query.from_user
    user_profile = user_profiles.get(user.id, {})
    wizard = ProfileWizard()

    if query.data == "upload_image":
        user_profile['current_step'] = 'waiting_for_image'
        await query.edit_message_text(
            wizard.get_step_message('waiting_for_image'),
            parse_mode=ParseMode.MARKDOWN
        )

    elif query.data == "add_education":
        user_profile['current_step'] = 'waiting_for_education'
        await query.edit_message_text(
            wizard.get_step_message('waiting_for_education'),
            parse_mode=ParseMode.MARKDOWN
        )

    elif query.data == "add_certificates":
        user_profile['current_step'] = 'waiting_for_certificates'
        await query.edit_message_text(
            wizard.get_step_message('waiting_for_certificates'),
            parse_mode=ParseMode.MARKDOWN
        )

    elif query.data == "complete_profile":
        await complete_profile_callback(query, context)

    elif query.data == "skip_step":
        # Handle step skipping in wizard
        current_step = user_profile.get('current_step', 'start')
        if current_step == 'waiting_for_image':
            user_profile['current_step'] = 'waiting_for_education'
            await send_wizard_step_via_query(query, context, 'waiting_for_education')
        elif current_step == 'waiting_for_education':
            user_profile['current_step'] = 'waiting_for_certificates'
            await send_wizard_step_via_query(query, context, 'waiting_for_certificates')
        elif current_step == 'waiting_for_certificates':
            user_profile['current_step'] = 'profile_complete'
            user_profile['completed'] = True
            await complete_profile_callback(query, context)
        else:
            await query.edit_message_text(
                "Cannot skip this step. Please provide the required information.",
                parse_mode=ParseMode.MARKDOWN
            )

    elif query.data == "cancel_wizard":
        # Cancel the wizard and return to main menu
        user_profile['current_step'] = 'start'

        cancel_message = """
❌ *Wizard Cancelled* ❌

Profile setup has been cancelled. You can start again anytime.

━━━━━━━━━━━━━━━━━━━━━
💼 *HustleX* - Connecting Talent with Opportunity
━━━━━━━━━━━━━━━━━━━━━
"""

        # Create main menu keyboard
        keyboard = [
            [KeyboardButton("👤 Profile Setup")],
            [KeyboardButton("📋 View Profile")],
            [KeyboardButton("ℹ️ About HustleX")]
        ]
        reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

        await query.edit_message_text(
            cancel_message,
            reply_markup=reply_markup,
            parse_mode=ParseMode.MARKDOWN
        )

async def complete_profile_callback(query, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle profile completion via callback."""
    user = query.from_user
    user_profile = user_profiles.get(user.id, {})

    # Check if all required fields are filled
    if not user_profile.get('profile_image'):
        await query.edit_message_text(
            "❌ Please upload a profile picture first.",
            parse_mode=ParseMode.MARKDOWN
        )
        return

    if not user_profile.get('education'):
        await query.edit_message_text(
            "❌ Please add your education information first.",
            parse_mode=ParseMode.MARKDOWN
        )
        return

    if not user_profile.get('certificates'):
        await query.edit_message_text(
            "❌ Please add your certificates first.",
            parse_mode=ParseMode.MARKDOWN
        )
        return

    # Mark as completed
    user_profile['completed'] = True
    user_profile['current_step'] = 'profile_complete'

    completion_message = f"""
🎉 *Congratulations!* 🎉

Your HustleX profile has been completed successfully!

━━━━━━━━━━━━━━━━━━━━━
✅ *Profile Summary:*
👤 Name: {user.first_name} {user.last_name or ''}
📧 Username: @{user.username or 'N/A'}
🎓 Education: {user_profile.get('education', 'N/A')}
🏆 Certificates: {user_profile.get('certificates', 'N/A')}

━━━━━━━━━━━━━━━━━━━━━
🚀 *Ready to freelance?*
Visit HustleX platform to start applying for jobs!

💼 *HustleX* - Your Professional Journey Starts Here
━━━━━━━━━━━━━━━━━━━━━
"""

    await query.edit_message_text(
        completion_message,
        parse_mode=ParseMode.MARKDOWN
    )

async def complete_profile(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle profile completion."""
    user = update.effective_user
    user_profile = user_profiles.get(user.id, {})

    completion_message = f"""
🎉 *Profile Setup Complete!* 🎉

Thank you {user.first_name}! Your professional profile is now ready.

━━━━━━━━━━━━━━━━━━━━━
📋 *Your Profile:*
• Education: {user_profile.get('education', 'Not provided')}
• Certificates: {user_profile.get('certificates', 'Not provided')}
• Profile Picture: {"✅ Uploaded" if user_profile.get('profile_image') else "❌ Not uploaded"}

━━━━━━━━━━━━━━━━━━━━━
💼 *HustleX* - Connecting Talent with Opportunity
━━━━━━━━━━━━━━━━━━━━━

Use the menu buttons below to view your profile or make changes.
"""

    # Create main menu keyboard
    keyboard = [
        [KeyboardButton("👤 Profile Setup")],
        [KeyboardButton("📋 View Profile")],
        [KeyboardButton("ℹ️ About HustleX")]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

    await update.message.reply_text(
        completion_message,
        reply_markup=reply_markup,
        parse_mode=ParseMode.MARKDOWN
    )

async def view_profile(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Display user's profile."""
    user = update.effective_user
    user_profile = user_profiles.get(user.id, {})

    if not user_profile.get('completed', False):
        await update.message.reply_text(
            "❌ You haven't completed your profile setup yet. Please use the Profile Setup button to get started.",
            parse_mode=ParseMode.MARKDOWN
        )
        return

    profile_message = f"""
👤 *Your HustleX Profile* 👤

━━━━━━━━━━━━━━━━━━━━━
📖 *Personal Information:*
• Name: {user.first_name} {user.last_name or ''}
• Username: @{user.username or 'N/A'}

🎓 *Education:*
{user_profile.get('education', 'Not provided')}

🏆 *Certificates & Certifications:*
{user_profile.get('certificates', 'Not provided')}

📸 *Profile Picture:* {"✅ Uploaded" if user_profile.get('profile_image') else "❌ Not uploaded"}

━━━━━━━━━━━━━━━━━━━━━
💼 *HustleX* - Your Professional Profile
━━━━━━━━━━━━━━━━━━━━━
"""

    # Send profile picture if available
    if user_profile.get('profile_image'):
        try:
            await context.bot.send_photo(
                chat_id=update.effective_chat.id,
                photo=user_profile['profile_image'],
                caption=profile_message,
                parse_mode=ParseMode.MARKDOWN
            )
        except Exception as e:
            logger.error(f"Error sending profile picture: {e}")
            await update.message.reply_text(
                profile_message,
                parse_mode=ParseMode.MARKDOWN
            )
    else:
        await update.message.reply_text(
            profile_message,
            parse_mode=ParseMode.MARKDOWN
        )

async def about_hustlex(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show information about HustleX."""
    about_message = """
🌟 *About HustleX* 🌟

━━━━━━━━━━━━━━━━━━━━━
💼 *What is HustleX?*

HustleX is Ethiopia's premier freelance platform connecting talented professionals with businesses worldwide.

🚀 *Our Mission:*
To empower freelancers and businesses by providing a seamless, secure, and efficient marketplace for talent acquisition and project collaboration.

━━━━━━━━━━━━━━━━━━━━━
🎯 *Key Features:*
• ✅ Verified freelancers and companies

• ✅ Project management tools
• ✅ Skill-based job matching
• ✅ Professional networking

━━━━━━━━━━━━━━━━━━━━━
📱 *Get Started:*
1. Complete your professional profile
2. Browse available projects
3. Apply for jobs that match your skills
4. Start freelancing today!

━━━━━━━━━━━━━━━━━━━━━
💼 *HustleX* - Connecting Talent with Opportunity
━━━━━━━━━━━━━━━━━━━━━

🌐 Visit our website: [Coming Soon]
📧 Contact: support@hustleX.et
"""

    await update.message.reply_text(
        about_message,
        parse_mode=ParseMode.MARKDOWN,
        disable_web_page_preview=True
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /help is issued."""
    help_message = """
🆘 *HustleX Bot Help* 🆘

━━━━━━━━━━━━━━━━━━━━━
🤖 *Available Commands:*

/start - Start the bot and show main menu
/help - Show this help message
/profile - View your current profile

━━━━━━━━━━━━━━━━━━━━━
📱 *How to Use:*

1. *Profile Setup:*
   - Click "👤 Profile Setup"
   - Upload your profile picture
   - Add your education details
   - List your certificates

2. *View Profile:*
   - Click "📋 View Profile" to see your completed profile

3. *About:*
   - Click "ℹ️ About HustleX" for platform information

━━━━━━━━━━━━━━━━━━━━━
💼 *HustleX* - Your Freelance Journey Starts Here
━━━━━━━━━━━━━━━━━━━━━
"""

    await update.message.reply_text(
        help_message,
        parse_mode=ParseMode.MARKDOWN
    )

async def main() -> None:
    """Start the bot."""
    # Create the Application and pass it your bot's token
    # Configure job queue with proper timezone to avoid issues
    utc = pytz.UTC
    application = Application.builder().token(TOKEN).build()

    # Add handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("profile", view_profile))

    application.add_handler(CallbackQueryHandler(handle_callback))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text))
    application.add_handler(MessageHandler(filters.PHOTO, handle_photo))

    # Start the bot
    print("🤖 HustleX Telegram Bot is starting...")
    print("💼 HustleX - Connecting Talent with Opportunity")
    await application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    asyncio.run(main())
