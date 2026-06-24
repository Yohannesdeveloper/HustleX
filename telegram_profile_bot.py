import os
os.environ['TZ'] = 'UTC'

from dotenv import load_dotenv
load_dotenv()

import asyncio
import logging
import json
from typing import Dict, Any, Optional

import requests
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, ContextTypes, filters
from telegram.constants import ParseMode

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

TOKEN = os.getenv("TELEGRAM_PROFILE_BOT_TOKEN") or os.getenv("TELEGRAM_BOT_TOKEN")
if not TOKEN or "YOUR_" in TOKEN:
    raise RuntimeError("Telegram bot token is required. Set TELEGRAM_PROFILE_BOT_TOKEN or TELEGRAM_BOT_TOKEN in .env file.\nGenerate new token from @BotFather: https://t.me/botfather")

API_BASE_URL = os.getenv("API_BASE_URL") or "http://localhost:5000/api"


def api_get(path, params=None):
    url = f"{API_BASE_URL.rstrip('/')}/{path.lstrip('/')}"
    try:
        resp = requests.get(url, params=params, timeout=10)
        if resp.status_code == 200:
            return resp.json()
        logger.warning(f"API GET {url} returned {resp.status_code}: {resp.text[:200]}")
        return None
    except Exception as e:
        logger.error(f"API GET {url} error: {e}")
        return None


def api_post(path, data=None):
    url = f"{API_BASE_URL.rstrip('/')}/{path.lstrip('/')}"
    try:
        resp = requests.post(url, json=data, timeout=10)
        if resp.status_code in (200, 201):
            return resp.json()
        logger.warning(f"API POST {url} returned {resp.status_code}: {resp.text[:200]}")
        return None
    except Exception as e:
        logger.error(f"API POST {url} error: {e}")
        return None


def escape_md(text):
    if not text:
        return ""
    for ch in ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!']:
        text = text.replace(ch, '\\' + ch)
    return text


def format_profile_text(profile: dict, telegram_user: dict) -> str:
    fn = profile.get('firstName', telegram_user.get('first_name', ''))
    ln = profile.get('lastName', telegram_user.get('last_name', ''))
    name = f"{fn} {ln}".strip()
    location = profile.get('location', 'Not set')
    bio = profile.get('bio', 'Not provided')
    skills = ', '.join(profile.get('skills', [])) or 'Not set'
    primary = profile.get('primarySkill', 'Not set')
    exp_level = profile.get('experienceLevel', 'Not set')
    years_exp = profile.get('yearsOfExperience', 'Not set')
    availability = profile.get('availability', 'Not set')
    education = profile.get('education', 'Not provided')
    certs = ', '.join(profile.get('certifications', [])) or 'None listed'

    lines = [
        f"👤 *Your HustleX Profile*",
        "",
        f"━━━━━━━━━━━━━━━━━━━━━",
        f"📖 *Personal Information:*",
        f"• Name: {escape_md(name)}",
        f"• Location: {escape_md(location)}",
        "",
        f"🎓 *Education:*",
        f"{escape_md(education)}",
        "",
        f"🏆 *Certifications:*",
        f"{escape_md(certs)}",
        "",
        f"💪 *Skills:*",
        f"• Primary: {escape_md(primary)}",
        f"• All: {escape_md(skills)}",
        "",
        f"📊 *Experience:*",
        f"• Level: {escape_md(exp_level)}",
        f"• Years: {escape_md(years_exp)}",
        f"• Availability: {escape_md(availability)}",
        "",
        f"📝 *Bio:*",
        f"{escape_md(bio[:200])}{'...' if len(bio) > 200 else ''}",
        "",
        f"━━━━━━━━━━━━━━━━━━━━━",
        f"💼 *HustleX* — Your Professional Profile",
    ]
    return "\n".join(lines)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    tid = user.id

    # Check if user has a profile on the backend
    backend_data = api_get("auth/telegram-profile", {"telegramId": tid})

    if backend_data and backend_data.get("user"):
        context.user_data['user_id'] = str(backend_data['user']['_id'])
        context.user_data['profile'] = backend_data['user'].get('profile', {})
        context.user_data['has_profile'] = True
    else:
        context.user_data['has_profile'] = False
        context.user_data['profile'] = {}

    context.user_data['telegram_user'] = {
        'id': tid,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name or '',
    }

    keyboard = [
        [KeyboardButton("👤 My Profile"), KeyboardButton("✏️ Edit Profile")],
        [KeyboardButton("ℹ️ About HustleX")],
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

    welcome = (
        f"🌟 *Welcome to HustleX, {escape_md(user.first_name)}!* 🌟\n\n"
        f"Your profile is synced with the HustleX platform.\n"
        f"Changes made here will be reflected on the web and vice versa.\n\n"
        f"👇 Use the buttons below to get started."
        if context.user_data['has_profile'] else
        f"🌟 *Welcome to HustleX, {escape_md(user.first_name)}!* 🌟\n\n"
        f"You don't have a profile yet. Let's create one!\n\n"
        f"👇 Tap *Edit Profile* to start."
    )

    await update.message.reply_text(welcome, reply_markup=reply_markup, parse_mode=ParseMode.MARKDOWN)


async def handle_text(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    text = update.message.text

    if text == "👤 My Profile":
        await view_profile(update, context)
    elif text == "✏️ Edit Profile":
        await start_profile_wizard(update, context)
    elif text == "ℹ️ About HustleX":
        await about_hustlex(update, context)
    else:
        # Handle wizard steps
        current_step = context.user_data.get('current_step', '')
        if current_step == 'waiting_for_bio':
            context.user_data['profile']['bio'] = text
            context.user_data['current_step'] = 'waiting_for_education'
            await send_wizard_step(update, context, 'waiting_for_education')
        elif current_step == 'waiting_for_education':
            context.user_data['profile']['education'] = text
            context.user_data['current_step'] = 'waiting_for_skills'
            await send_wizard_step(update, context, 'waiting_for_skills')
        elif current_step == 'waiting_for_skills':
            skills = [s.strip() for s in text.replace(',', '\n').split('\n') if s.strip()]
            context.user_data['profile']['skills'] = skills
            context.user_data['current_step'] = 'waiting_for_experience'
            await send_wizard_step(update, context, 'waiting_for_experience')
        elif current_step == 'waiting_for_experience':
            context.user_data['profile']['experienceLevel'] = text
            context.user_data['current_step'] = 'review'
            await show_review(update, context)
        else:
            await update.message.reply_text(
                "Please use the menu buttons below.",
                reply_markup=ReplyKeyboardMarkup(
                    [[KeyboardButton("👤 My Profile"), KeyboardButton("✏️ Edit Profile")],
                     [KeyboardButton("ℹ️ About HustleX")]],
                    resize_keyboard=True
                )
            )


async def view_profile(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    tid = user.id

    # Always fetch latest from backend
    backend_data = api_get("auth/telegram-profile", {"telegramId": tid})
    profile = {}
    if backend_data and backend_data.get("user"):
        profile = backend_data['user'].get('profile', {})
        context.user_data['profile'] = profile
        context.user_data['has_profile'] = True
        context.user_data['user_id'] = str(backend_data['user']['_id'])

    if not profile or not profile.get('firstName'):
        msg = (
            f"❌ *No profile found*\n\n"
            f"You haven't created your HustleX profile yet.\n"
            f"Tap *✏️ Edit Profile* to get started!"
        )
        await update.message.reply_text(msg, parse_mode=ParseMode.MARKDOWN)
        return

    text = format_profile_text(profile, {'first_name': user.first_name, 'last_name': user.last_name or ''})
    await update.message.reply_text(text, parse_mode=ParseMode.MARKDOWN)


async def start_profile_wizard(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    tid = user.id

    # Fetch existing profile from backend
    backend_data = api_get("auth/telegram-profile", {"telegramId": tid})
    existing = {}
    if backend_data and backend_data.get("user"):
        existing = backend_data['user'].get('profile', {})
        context.user_data['user_id'] = str(backend_data['user']['_id'])

    context.user_data['profile'] = {
        'firstName': existing.get('firstName', user.first_name or ''),
        'lastName': existing.get('lastName', user.last_name or ''),
        'bio': existing.get('bio', ''),
        'education': existing.get('education', ''),
        'skills': existing.get('skills', []),
        'experienceLevel': existing.get('experienceLevel', ''),
        'location': existing.get('location', ''),
        'primarySkill': existing.get('primarySkill', ''),
        'yearsOfExperience': existing.get('yearsOfExperience', ''),
        'availability': existing.get('availability', 'Available'),
        'certifications': existing.get('certifications', []),
    }

    context.user_data['current_step'] = 'waiting_for_bio'

    keyboard = [[InlineKeyboardButton("❌ Cancel", callback_data="cancel_wizard")]]
    reply_markup = InlineKeyboardMarkup(keyboard)

    wizard_msg = (
        f"✏️ *Profile Editor*\n\n"
        f"Let's update your profile step by step.\n"
        f"You can send your current info or type new details.\n\n"
        f"━━━━━━━━━━━━━━━━━━━━━\n"
        f"📋 *Steps:* Bio → Education → Skills → Experience → Review\n"
        f"━━━━━━━━━━━━━━━━━━━━━"
    )
    await update.message.reply_text(wizard_msg, reply_markup=reply_markup, parse_mode=ParseMode.MARKDOWN)
    await send_wizard_step(update, context, 'waiting_for_bio')


async def send_wizard_step(update: Update, context: ContextTypes.DEFAULT_TYPE, step: str) -> None:
    profile = context.user_data.get('profile', {})

    if step == 'waiting_for_bio':
        current = profile.get('bio', '')
        msg = (
            f"📝 *Step 1 of 4: Bio*\n\n"
            f"Tell us about yourself, your background, and what makes you unique.\n\n"
            f"{'*Current:* ' + escape_md(current[:200]) if current else '_No bio set yet_'}"
        )
        await update.message.reply_text(msg, parse_mode=ParseMode.MARKDOWN)

    elif step == 'waiting_for_education':
        current = profile.get('education', '')
        msg = (
            f"🎓 *Step 2 of 4: Education*\n\n"
            f"Tell us about your educational background.\n\n"
            f"*Example:* Bachelor's in Computer Science, Addis Ababa University (2018-2022)\n\n"
            f"{'*Current:* ' + escape_md(current[:200]) if current else '_No education set yet_'}"
        )
        await update.message.reply_text(msg, parse_mode=ParseMode.MARKDOWN)

    elif step == 'waiting_for_skills':
        current = ', '.join(profile.get('skills', []))
        msg = (
            f"💪 *Step 3 of 4: Skills*\n\n"
            f"List your skills separated by commas.\n\n"
            f"*Example:* Python, JavaScript, React, UI/UX Design\n\n"
            f"{'*Current:* ' + escape_md(current) if current else '_No skills set yet_'}"
        )
        await update.message.reply_text(msg, parse_mode=ParseMode.MARKDOWN)

    elif step == 'waiting_for_experience':
        current = profile.get('experienceLevel', '')
        msg = (
            f"📊 *Step 4 of 4: Experience Level*\n\n"
            f"What is your experience level?\n"
            f"Choose one: *Beginner*, *Intermediate*, *Advanced*, *Expert*\n\n"
            f"{'*Current:* ' + escape_md(current) if current else '_Not set yet_'}"
        )
        await update.message.reply_text(msg, parse_mode=ParseMode.MARKDOWN)


async def show_review(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    profile = context.user_data.get('profile', {})
    tg_user = context.user_data.get('telegram_user', {})

    fn = profile.get('firstName', tg_user.get('first_name', ''))
    ln = profile.get('lastName', tg_user.get('last_name', ''))
    name = f"{fn} {ln}".strip()

    skills_str = ', '.join(profile.get('skills', [])) or 'None'
    bio_preview = (profile.get('bio', '') or '')[:100]

    review = (
        f"📋 *Review Your Profile*\n\n"
        f"━━━━━━━━━━━━━━━━━━━━━\n"
        f"👤 *Name:* {escape_md(name)}\n"
        f"📝 *Bio:* {escape_md(bio_preview)}{'...' if len(bio_preview) >= 100 else ''}\n"
        f"🎓 *Education:* {escape_md((profile.get('education', '') or '')[:100])}\n"
        f"💪 *Skills:* {escape_md(skills_str)}\n"
        f"📊 *Experience:* {escape_md(profile.get('experienceLevel', 'Not set'))}\n\n"
        f"Does everything look good?"
    )

    keyboard = [
        [InlineKeyboardButton("✅ Save Profile", callback_data="save_profile")],
        [InlineKeyboardButton("🔄 Start Over", callback_data="restart_wizard")],
        [InlineKeyboardButton("❌ Cancel", callback_data="cancel_wizard")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(review, reply_markup=reply_markup, parse_mode=ParseMode.MARKDOWN)


async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()

    if query.data == "cancel_wizard":
        context.user_data['current_step'] = ''
        keyboard = [
            [KeyboardButton("👤 My Profile"), KeyboardButton("✏️ Edit Profile")],
            [KeyboardButton("ℹ️ About HustleX")],
        ]
        reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
        await query.edit_message_text(
            "❌ *Profile editing cancelled.*\n\nYou can start again anytime by tapping *✏️ Edit Profile*.",
            reply_markup=reply_markup,
            parse_mode=ParseMode.MARKDOWN
        )

    elif query.data == "restart_wizard":
        context.user_data['current_step'] = 'waiting_for_bio'
        await query.edit_message_text("🔄 *Starting over...*", parse_mode=ParseMode.MARKDOWN)
        await send_wizard_step_via_query(query, context, 'waiting_for_bio')

    elif query.data == "save_profile":
        await save_profile_to_backend(query, context)


async def send_wizard_step_via_query(query, context: ContextTypes.DEFAULT_TYPE, step: str) -> None:
    profile = context.user_data.get('profile', {})

    if step == 'waiting_for_bio':
        current = profile.get('bio', '')
        msg = (
            f"📝 *Step 1 of 4: Bio*\n\n"
            f"Tell us about yourself.\n\n"
            f"{'*Current:* ' + escape_md(current[:200]) if current else '_No bio set yet_'}"
        )
        await query.edit_message_text(msg, parse_mode=ParseMode.MARKDOWN)

    elif step == 'waiting_for_education':
        current = profile.get('education', '')
        msg = (
            f"🎓 *Step 2 of 4: Education*\n\n"
            f"Tell us about your educational background.\n\n"
            f"{'*Current:* ' + escape_md(current[:200]) if current else '_No education set yet_'}"
        )
        await query.edit_message_text(msg, parse_mode=ParseMode.MARKDOWN)

    elif step == 'waiting_for_skills':
        current = ', '.join(profile.get('skills', []))
        msg = (
            f"💪 *Step 3 of 4: Skills*\n\n"
            f"List your skills separated by commas.\n\n"
            f"{'*Current:* ' + escape_md(current) if current else '_No skills set yet_'}"
        )
        await query.edit_message_text(msg, parse_mode=ParseMode.MARKDOWN)

    elif step == 'waiting_for_experience':
        current = profile.get('experienceLevel', '')
        msg = (
            f"📊 *Step 4 of 4: Experience Level*\n\n"
            f"Choose: *Beginner*, *Intermediate*, *Advanced*, *Expert*\n\n"
            f"{'*Current:* ' + escape_md(current) if current else '_Not set yet_'}"
        )
        await query.edit_message_text(msg, parse_mode=ParseMode.MARKDOWN)


async def save_profile_to_backend(query, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = query.from_user
    profile = context.user_data.get('profile', {})
    tg_user = context.user_data.get('telegram_user', {})

    # Build payload matching the API expected format
    payload = {
        'profile': {
            'firstName': profile.get('firstName', tg_user.get('first_name', '')),
            'lastName': profile.get('lastName', tg_user.get('last_name', '')),
            'email': f"tg_{user.id}@hustlex.telegram",
            'phone': '',
            'location': profile.get('location', ''),
            'bio': profile.get('bio', ''),
            'education': profile.get('education', ''),
            'workExperience': '',
            'skills': profile.get('skills', []),
            'primarySkill': profile.get('primarySkill', profile.get('skills', [''])[0] if profile.get('skills') else ''),
            'experienceLevel': profile.get('experienceLevel', ''),
            'yearsOfExperience': profile.get('yearsOfExperience', ''),
            'portfolioUrl': '',
            'certifications': profile.get('certifications', []),
            'availability': profile.get('availability', 'Available'),
            'monthlyRate': '',
            'currency': 'USD',
            'preferredJobTypes': [],
            'workLocation': 'Remote',
            'linkedinUrl': '',
            'githubUrl': '',
            'websiteUrl': '',
            'avatar': '',
        }
    }

    # If we already have a user_id, include it so the backend can find the existing user
    user_id = context.user_data.get('user_id')
    if user_id:
        payload['profile']['_userId'] = user_id

    result = api_post("auth/freelancer-profile", payload)

    if result and result.get("user"):
        context.user_data['has_profile'] = True
        context.user_data['user_id'] = str(result['user']['_id'])
        context.user_data['current_step'] = ''

        keyboard = [
            [KeyboardButton("👤 My Profile"), KeyboardButton("✏️ Edit Profile")],
            [KeyboardButton("ℹ️ About HustleX")],
        ]
        reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

        success = (
            f"✅ *Profile Saved Successfully!*\n\n"
            f"Your HustleX profile is now synced with the platform.\n"
            f"Changes made on the website will also appear here."
        )
        await query.edit_message_text(success, reply_markup=reply_markup, parse_mode=ParseMode.MARKDOWN)
    else:
        await query.edit_message_text(
            "❌ *Failed to save profile.*\n\nPlease try again later or use the website to set up your profile.",
            parse_mode=ParseMode.MARKDOWN
        )


async def handle_photo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "📸 Photo upload is supported on the HustleX website.\n"
        "Please visit the platform to upload your profile picture.",
    )


async def about_hustlex(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    msg = (
        "🌟 *About HustleX* 🌟\n\n"
        "HustleX is Ethiopia's premier freelance platform connecting talented professionals with businesses worldwide.\n\n"
        "🎯 *Key Features:*\n"
        "• ✅ Verified freelancers and companies\n"
        "• ✅ Project management tools\n"
        "• ✅ Skill-based job matching\n"
        "• ✅ Professional networking\n\n"
        "💼 *HustleX* — Connecting Talent with Opportunity"
    )
    await update.message.reply_text(msg, parse_mode=ParseMode.MARKDOWN)


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    msg = (
        "🆘 *HustleX Bot Help*\n\n"
        "*/start* — Show main menu\n"
        "*/help* — Show this help\n"
        "*/profile* — View your synced profile\n\n"
        "📱 *How it works:*\n"
        "Your profile is synced with the HustleX platform.\n"
        "Edit on the web → updates here.\n"
        "Edit here → updates on the web."
    )
    await update.message.reply_text(msg, parse_mode=ParseMode.MARKDOWN)


if __name__ == '__main__':
    import sys
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    print("🤖 HustleX Telegram Profile Bot (Synced Mode) is starting...")
    print(f"💼 API Base URL: {API_BASE_URL}")

    application = Application.builder().token(TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("profile", view_profile))
    application.add_handler(CallbackQueryHandler(handle_callback))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text))
    application.add_handler(MessageHandler(filters.PHOTO, handle_photo))

    application.run_polling(allowed_updates=Update.ALL_TYPES)
