import { useEffect, useState } from 'react';

const useTelegram = () => {
    const [tg, setTg] = useState(null);
    const [user, setUser] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Check if running in Telegram
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            const webApp = window.Telegram.WebApp;

            // Initialize Telegram WebApp
            webApp.ready();
            webApp.expand();

            // Enable closing confirmation
            webApp.enableClosingConfirmation();

            // Set header color to match app theme
            webApp.setHeaderColor('#0f172a');

            // Get user data
            const telegramUser = webApp.initDataUnsafe?.user;

            setTg(webApp);
            setUser(telegramUser);
            setIsReady(true);

            console.log('Telegram WebApp initialized:', {
                platform: webApp.platform,
                version: webApp.version,
                user: telegramUser
            });
        } else {
            // Not in Telegram, set ready anyway for web version
            setIsReady(true);
            console.log('Running in web browser (not Telegram)');
        }
    }, []);

    // Show main button
    const showMainButton = (text, onClick) => {
        if (tg?.MainButton) {
            tg.MainButton.setText(text);
            tg.MainButton.show();
            tg.MainButton.onClick(onClick);
        }
    };

    // Hide main button
    const hideMainButton = () => {
        if (tg?.MainButton) {
            tg.MainButton.hide();
        }
    };

    // Show back button
    const showBackButton = (onClick) => {
        if (tg?.BackButton) {
            tg.BackButton.show();
            tg.BackButton.onClick(onClick);
        }
    };

    // Hide back button
    const hideBackButton = () => {
        if (tg?.BackButton) {
            tg.BackButton.hide();
        }
    };

    // Close the mini app
    const close = () => {
        if (tg) {
            tg.close();
        }
    };

    // Show popup
    const showPopup = (message, callback) => {
        if (tg) {
            tg.showPopup({
                message,
                buttons: [{ type: 'ok' }]
            }, callback);
        } else {
            alert(message);
        }
    };

    // Haptic feedback
    const hapticFeedback = (type = 'medium') => {
        if (tg?.HapticFeedback) {
            if (type === 'light') tg.HapticFeedback.impactOccurred('light');
            else if (type === 'medium') tg.HapticFeedback.impactOccurred('medium');
            else if (type === 'heavy') tg.HapticFeedback.impactOccurred('heavy');
            else if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
            else if (type === 'error') tg.HapticFeedback.notificationOccurred('error');
            else if (type === 'warning') tg.HapticFeedback.notificationOccurred('warning');
        }
    };

    return {
        tg,
        user,
        isReady,
        isTelegram: !!tg,
        showMainButton,
        hideMainButton,
        showBackButton,
        hideBackButton,
        close,
        showPopup,
        hapticFeedback,
        // Telegram theme colors
        themeParams: tg?.themeParams || {},
        colorScheme: tg?.colorScheme || 'light'
    };
};

export default useTelegram;
