<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="light">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'Langit Ecosystem') }}</title>
    <link rel="icon" type="image/jpeg" href="/images/logo.jpg">

    <!-- Fonts: Etna Sans Serif (Local), Google Fonts: Instrument Serif, Playfair Display, Outfit, Plus Jakarta Sans, Inter -->
    <link rel="preload" href="/fonts/etna.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Theme Initializer: Default Light Mode, Toggleable to Dark Mode -->
    <script>
        (function() {
            try {
                const storedTheme = localStorage.getItem('langit_theme');
                if (storedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                    if (!storedTheme) {
                        localStorage.setItem('langit_theme', 'light');
                    }
                }
            } catch (e) {
                document.documentElement.classList.add('light');
                document.documentElement.setAttribute('data-theme', 'light');
            }
        })();
    </script>

    <!-- Styles & Scripts -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="bg-slate-50 text-slate-900 dark:bg-[#07090E] dark:text-slate-100 font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-900 dark:selection:bg-cyan-500/30 dark:selection:text-cyan-200 overflow-x-hidden min-h-screen transition-colors duration-300">
    @inertia
</body>
</html>
