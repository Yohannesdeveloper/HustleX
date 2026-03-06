@echo off
echo Clearing uploaded files...

cd backend\uploads

echo Clearing avatars...
if exist avatars (
    del /Q avatars\*.*
    echo Cleared avatars
) else (
    echo No avatars directory found
)

echo Clearing CVs...
if exist cvs (
    del /Q cvs\*.*
    echo Cleared CVs
) else (
    echo No cvs directory found
)

echo Clearing logos...
if exist logos (
    del /Q logos\*.*
    echo Cleared logos
) else (
    echo No logos directory found
)

echo Clearing message attachments...
if exist message-attachments (
    del /Q message-attachments\*.*
    echo Cleared message attachments
) else (
    echo No message-attachments directory found
)

echo Clearing trade licenses...
if exist trade-licenses (
    del /Q trade-licenses\*.*
    echo Cleared trade licenses
) else (
    echo No trade-licenses directory found
)

echo All uploaded files cleared successfully!
pause
