# HustleX Telegram Profile Bot

A Python Telegram bot that provides a profile setup wizard similar to the HustleX web platform's freelancer profile wizard. Users can set their profile picture, education, and certificates through an interactive chat interface.

## Features

- **Profile Setup Wizard**: Step-by-step profile creation process
- **Image Upload**: Users can upload profile pictures directly in Telegram
- **Education Input**: Text-based education information collection
- **Certificates Management**: Users can list their certifications and achievements
- **Profile Viewing**: Completed profiles can be viewed with all information
- **HustleX Branding**: Consistent branding throughout the bot interface
- **Persistent Storage**: User profiles are stored in memory (can be extended to database)

## Prerequisites

- Python 3.7+
- Telegram Bot Token (already configured)
- Internet connection for Telegram API

## Installation

1. **Clone or navigate to the project directory**

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the bot:**
   ```bash
   python telegram_profile_bot.py
   ```

## Bot Commands

- `/start` - Initialize the bot and show main menu
- `/help` - Display help information
- `/profile` - View your completed profile

## How to Use

### Setting Up Your Profile

1. **Start the Bot**: Send `/start` or click the start button
2. **Profile Setup**: Click "👤 Profile Setup" button
3. **Upload Picture**: Send a photo to set as your profile picture
4. **Add Education**: Type your educational background
5. **Add Certificates**: List your certifications and achievements
6. **Complete Profile**: Your profile is now ready!

### Viewing Your Profile

- Click "📋 View Profile" to see your completed profile information
- Your profile picture will be displayed along with all details

### About HustleX

- Click "ℹ️ About HustleX" to learn more about the platform

## Bot Features

### Interactive Menu System
- Main menu with persistent keyboard buttons
- Inline keyboards for profile setup steps
- Progress tracking during profile creation

### Profile Data Collection
- **Profile Picture**: Telegram photo upload
- **Education**: Text input with examples
- **Certificates**: Text input for certifications list

### User Experience
- Step-by-step guidance
- Progress indicators
- Confirmation messages
- Error handling

### Branding Elements
- HustleX logo and branding in all messages
- Consistent footer across all responses
- Professional messaging tone

## Technical Details

### Dependencies
- `python-telegram-bot==20.7` - Telegram Bot API wrapper
- `asyncio` - Asynchronous programming
- `typing` - Type hints

### Data Storage
Currently uses in-memory dictionary storage. For production use, consider:
- SQLite database
- PostgreSQL
- MongoDB
- Redis

### Security
- Bot token is hardcoded (move to environment variables in production)
- Basic input validation
- User data isolation

## File Structure

```
telegram_profile_bot.py    # Main bot application
requirements.txt           # Python dependencies
TELEGRAM_BOT_README.md     # This documentation
```

## API Key

The bot uses the following Telegram API key:
```
8289162137:AAG1ccjTbr9ZMPiU4OxVeiXyUla3pMzAOJw
```

## Future Enhancements

- Database integration for persistent storage
- Profile editing capabilities
- Multiple language support
- Integration with HustleX web platform
- Advanced validation and error handling
- User authentication linking
- Profile export functionality

## Support

For support or questions about the HustleX platform:
- Email: support@hustlex.et
- Website: [Coming Soon]

## License

This project is part of the HustleX freelance platform.

---

💼 **HustleX** - Connecting Talent with Opportunity
